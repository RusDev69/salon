import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  escapeHtml,
  getTelegramConfig,
  sendTelegramMessage,
} from "@/lib/telegram";

export const dynamic = "force-dynamic";

type TelegramChat = {
  id: number;
  type: string;
  username?: string;
  first_name?: string;
  title?: string;
};

type TelegramUpdate = {
  update_id?: number;
  message?: {
    text?: string;
    chat?: TelegramChat;
    from?: { username?: string; first_name?: string };
  };
  my_chat_member?: {
    chat?: TelegramChat;
    new_chat_member?: { status?: string };
  };
};

function safeSecretEquals(received: string, expected: string) {
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function chatTitle(chat: TelegramChat) {
  return chat.title || chat.first_name || chat.username || String(chat.id);
}

export async function POST(request: NextRequest) {
  const config = getTelegramConfig();

  if (!config.token) {
    return NextResponse.json(
      { error: "Telegram bot token is not configured" },
      { status: 503 },
    );
  }

  if (!config.webhookSecret) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Telegram webhook secret is not configured" },
        { status: 503 },
      );
    }
  } else {
    const received =
      request.headers.get("x-telegram-bot-api-secret-token") ?? "";
    if (!safeSecretEquals(received, config.webhookSecret)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 401 });
    }
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  }

  // Bot removed from a group/channel — stop sending there.
  if (update.my_chat_member?.chat) {
    const status = update.my_chat_member.new_chat_member?.status;
    if (status === "left" || status === "kicked") {
      await prisma.telegramSubscriber
        .updateMany({
          where: { chatId: String(update.my_chat_member.chat.id) },
          data: { isActive: false },
        })
        .catch((error) => console.error("Telegram unsubscribe failed", error));
    }
    return NextResponse.json({ ok: true });
  }

  const message = update.message;
  const chat = message?.chat;
  if (!message || !chat) {
    return NextResponse.json({ ok: true });
  }

  const command = message.text?.trim().split(/\s+/)[0]?.split("@")[0]?.toLowerCase();
  const chatId = String(chat.id);
  const username = message.from?.username ?? chat.username ?? null;
  const firstName = message.from?.first_name ?? chat.first_name ?? null;

  try {
    if (command === "/start") {
      await prisma.telegramSubscriber.upsert({
        where: { chatId },
        update: { username, firstName, isActive: true },
        create: { chatId, username, firstName, isActive: true },
      });

      await sendTelegramMessage(
        chatId,
        [
          "🌿 <b>World Beauty Club · уведомления подключены</b>",
          "",
          `Здравствуйте${firstName ? `, ${escapeHtml(firstName)}` : ""}!`,
          "Теперь сюда будут приходить новые записи и изменения статусов со всеми деталями визита.",
          "",
          "<b>Команды:</b>",
          "/stop — отписаться от уведомлений",
          "/status — проверить подписку",
        ].join("\n"),
      ).catch((error) => console.error("Telegram welcome failed", error));

      return NextResponse.json({ ok: true });
    }

    if (command === "/stop") {
      await prisma.telegramSubscriber.updateMany({
        where: { chatId },
        data: { isActive: false },
      });
      await sendTelegramMessage(
        chatId,
        "Уведомления World Beauty Club отключены. Вернуться можно командой /start.",
      ).catch((error) => console.error("Telegram unsubscribe reply failed", error));
      return NextResponse.json({ ok: true });
    }

    if (command === "/status") {
      const subscriber = await prisma.telegramSubscriber.findUnique({
        where: { chatId },
        select: { isActive: true },
      });
      await sendTelegramMessage(
        chatId,
        subscriber?.isActive
          ? `✅ Уведомления включены для «${escapeHtml(chatTitle(chat))}».`
          : "Уведомления выключены. Отправьте /start, чтобы подписаться.",
      ).catch((error) => console.error("Telegram status reply failed", error));
      return NextResponse.json({ ok: true });
    }

    if (message.text?.startsWith("/")) {
      await sendTelegramMessage(
        chatId,
        "Доступные команды:\n/start — подписаться на уведомления\n/stop — отписаться\n/status — проверить подписку",
      ).catch((error) => console.error("Telegram help failed", error));
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook failed", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
