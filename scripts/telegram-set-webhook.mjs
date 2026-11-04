import "dotenv/config";

const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
const overrideUrl = process.env.TELEGRAM_WEBHOOK_URL?.trim();

if (!token) {
  console.error("TELEGRAM_BOT_TOKEN is missing in .env");
  process.exit(1);
}

if (!secret) {
  console.error("TELEGRAM_WEBHOOK_SECRET is missing in .env");
  process.exit(1);
}

if (process.argv.includes("--delete")) {
  const response = await fetch(
    `https://api.telegram.org/bot${token}/deleteWebhook`,
    { method: "POST" },
  );
  console.log(JSON.stringify(await response.json(), null, 2));
  process.exit(response.ok ? 0 : 1);
}

const webhookUrl = overrideUrl || `${siteUrl}/api/telegram/webhook`;

if (!webhookUrl.startsWith("https://")) {
  console.error(
    [
      "Telegram requires a public HTTPS webhook URL.",
      "Set NEXT_PUBLIC_SITE_URL to your deployed HTTPS domain,",
      "or provide TELEGRAM_WEBHOOK_URL (e.g. a cloudflared tunnel URL).",
      `Current URL: ${webhookUrl}`,
    ].join("\n"),
  );
  process.exit(1);
}

const response = await fetch(
  `https://api.telegram.org/bot${token}/setWebhook`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: webhookUrl,
      secret_token: secret,
      allowed_updates: ["message", "my_chat_member"],
      drop_pending_updates: true,
    }),
  },
);

const payload = await response.json();
console.log(JSON.stringify(payload, null, 2));

if (!response.ok || !payload.ok) {
  process.exit(1);
}

const infoResponse = await fetch(
  `https://api.telegram.org/bot${token}/getWebhookInfo`,
);
console.log(JSON.stringify(await infoResponse.json(), null, 2));
