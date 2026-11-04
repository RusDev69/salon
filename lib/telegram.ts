import "server-only";

import { prisma } from "@/lib/prisma";
import { formatSalon } from "@/lib/time";
import { formatPrice } from "@/lib/utils";

export type TelegramBooking = {
  reference: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  notes: string | null;
  startsAt: Date | string;
  endsAt: Date | string;
  status: string;
  createdAt?: Date | string;
  service: { name: string; price: number };
  master: { name: string };
};

export type BookingNotificationEvent =
  | { type: "created" }
  | { type: "status"; previousStatus: string };

type SendResult =
  | { ok: true }
  | { ok: false; status?: number; description?: string };

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Ожидает подтверждения",
  CONFIRMED: "Подтверждена",
  COMPLETED: "Завершена",
  CANCELLED: "Отменена",
};

export function getTelegramConfig() {
  return {
    token: process.env.TELEGRAM_BOT_TOKEN?.trim() ?? "",
    webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET?.trim() ?? "",
    chatIds: [
      process.env.TELEGRAM_CHAT_ID?.trim(),
      ...(process.env.TELEGRAM_CHAT_IDS?.split(",") ?? []),
    ]
      .map((value) => value?.trim())
      .filter((value): value is string => Boolean(value)),
  };
}

export function telegramEnabled() {
  return Boolean(getTelegramConfig().token);
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function statusLabel(status: string) {
  return STATUS_LABELS[status] ?? status;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatBookingMessage(
  booking: TelegramBooking,
  event: BookingNotificationEvent,
) {
  const title =
    event.type === "created"
      ? "🌿 <b>Новая запись в World Beauty Club</b>"
      : "🔄 <b>Статус записи изменён</b>";

  const start = new Date(booking.startsAt);
  const end = new Date(booking.endsAt);
  const durationMinutes = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / 60_000),
  );
  const duration =
    durationMinutes >= 60
      ? `${Math.floor(durationMinutes / 60)} ч${
          durationMinutes % 60 ? ` ${durationMinutes % 60} мин` : ""
        }`
      : `${durationMinutes} мин`;

  const date = capitalize(
    formatSalon(start, "d MMMM yyyy, EEEE", { locale: true }),
  );
  const time = `${formatSalon(start, "HH:mm")}–${formatSalon(end, "HH:mm")}`;
  const created = booking.createdAt
    ? formatSalon(booking.createdAt, "dd.MM.yyyy, HH:mm")
    : null;

  const lines = [
    title,
    "",
    `<b>Номер:</b> <code>${escapeHtml(booking.reference)}</code>`,
    `<b>Гость:</b> ${escapeHtml(booking.customerName)}`,
    `<b>Телефон:</b> ${escapeHtml(booking.customerPhone)}`,
    `<b>Email:</b> ${booking.customerEmail ? escapeHtml(booking.customerEmail) : "—"}`,
    "",
    `<b>Услуга:</b> ${escapeHtml(booking.service.name)}`,
    `<b>Мастер:</b> ${escapeHtml(booking.master.name)}`,
    `<b>Дата:</b> ${escapeHtml(date)}`,
    `<b>Время:</b> ${time} (${duration})`,
    `<b>Стоимость:</b> ${escapeHtml(formatPrice(booking.service.price))}`,
    "",
    `<b>Статус:</b> ${escapeHtml(statusLabel(booking.status))}`,
  ];

  if (event.type === "status") {
    lines.push(
      `<b>Было:</b> ${escapeHtml(statusLabel(event.previousStatus))}`,
    );
  }

  lines.push(
    `<b>Пожелания:</b> ${booking.notes ? escapeHtml(booking.notes) : "—"}`,
  );

  if (created) {
    lines.push(`<b>Создана:</b> ${escapeHtml(created)}`);
  }

  return lines.join("\n");
}

export async function sendTelegramMessage(
  chatId: string,
  text: string,
): Promise<SendResult> {
  const { token } = getTelegramConfig();
  if (!token) {
    return { ok: false, description: "TELEGRAM_BOT_TOKEN is not configured" };
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(6_000),
      },
    );

    const payload = (await response.json().catch(() => null)) as {
      ok?: boolean;
      description?: string;
    } | null;

    if (!response.ok || !payload?.ok) {
      return {
        ok: false,
        status: response.status,
        description: payload?.description ?? `Telegram HTTP ${response.status}`,
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      description: error instanceof Error ? error.message : "Telegram request failed",
    };
  }
}

async function getRecipients() {
  const envIds = getTelegramConfig().chatIds;
  const recipients = new Map<
    string,
    { chatId: string; subscriberId: string | null }
  >();

  for (const chatId of envIds) {
    recipients.set(chatId, { chatId, subscriberId: null });
  }

  try {
    const subscribers = await prisma.telegramSubscriber.findMany({
      where: { isActive: true },
      select: { id: true, chatId: true },
    });

    for (const subscriber of subscribers) {
      recipients.set(subscriber.chatId, {
        chatId: subscriber.chatId,
        subscriberId: subscriber.id,
      });
    }
  } catch (error) {
    // The table may not exist until `prisma db push` / the Supabase migration
    // is applied. Environment chat IDs still work in that case.
    console.error("Telegram subscribers lookup failed", error);
  }

  return [...recipients.values()];
}

/**
 * Broadcast a booking event to every active subscriber plus optional
 * TELEGRAM_CHAT_ID(S) recipients. Failures are logged and never affect the
 * guest's booking.
 */
export async function notifyBooking(
  booking: TelegramBooking,
  event: BookingNotificationEvent,
) {
  if (!telegramEnabled()) {
    console.warn("Telegram notifications skipped: token is not configured");
    return;
  }

  const recipients = await getRecipients();
  if (recipients.length === 0) {
    console.warn(
      "Telegram notifications skipped: no subscribers. Send /start to the bot first.",
    );
    return;
  }

  const text = formatBookingMessage(booking, event);
  const results = await Promise.all(
    recipients.map(async (recipient) => ({
      recipient,
      result: await sendTelegramMessage(recipient.chatId, text),
    })),
  );

  const blockedSubscriberIds: string[] = [];
  for (const { recipient, result } of results) {
    if (!result.ok) {
      console.error(
        `Telegram delivery failed for chat ${recipient.chatId}: ${result.description}`,
      );
      const description = result.description?.toLowerCase() ?? "";
      if (
        recipient.subscriberId &&
        (result.status === 403 ||
          description.includes("chat not found") ||
          description.includes("bot was blocked") ||
          description.includes("user is deactivated"))
      ) {
        blockedSubscriberIds.push(recipient.subscriberId);
      }
    }
  }

  if (blockedSubscriberIds.length > 0) {
    await prisma.telegramSubscriber
      .updateMany({
        where: { id: { in: blockedSubscriberIds } },
        data: { isActive: false },
      })
      .catch((error) => console.error("Telegram subscriber cleanup failed", error));
  }
}

export { formatBookingMessage, statusLabel };
