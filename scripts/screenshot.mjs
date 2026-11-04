import { chromium } from "playwright-core";
import fs from "node:fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
fs.mkdirSync("screenshots", { recursive: true });

const browser = await chromium.launch({
  executablePath: chrome,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none"],
});

const logs = [];
async function pageWithLogs(viewport) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on("console", (msg) => {
    if (msg.type() === "error") logs.push(`CONSOLE ${msg.text()}`);
  });
  page.on("pageerror", (err) => logs.push(`PAGEERROR ${err.message}`));
  return { context, page };
}

const desktop = await pageWithLogs({ width: 1440, height: 1000 });
await desktop.page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
await desktop.page.waitForTimeout(1200);
await desktop.page.screenshot({ path: "screenshots/home-desktop.png", fullPage: true });

const mobile = await pageWithLogs({ width: 390, height: 844 });
await mobile.page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
await mobile.page.waitForTimeout(800);
await mobile.page.screenshot({ path: "screenshots/home-mobile.png", fullPage: true });

await desktop.page.goto("http://127.0.0.1:3000/booking", { waitUntil: "networkidle" });
await desktop.page.waitForTimeout(800);
await desktop.page.screenshot({ path: "screenshots/booking-step1.png", fullPage: true });

await desktop.page.goto("http://127.0.0.1:3000/admin/login", { waitUntil: "networkidle" });
await desktop.page.waitForTimeout(500);
await desktop.page.screenshot({ path: "screenshots/login.png", fullPage: true });

await desktop.page.fill("#email", "owner@worldbeautyclub.ru");
await desktop.page.fill("#password", "WBC2026!");
await desktop.page.click('button[type="submit"]');
await desktop.page.waitForURL("**/admin", { timeout: 20000 });
await desktop.page.waitForTimeout(1000);
await desktop.page.screenshot({ path: "screenshots/admin-dashboard.png", fullPage: true });

for (const [route, name] of [
  ["/admin/bookings", "admin-bookings"],
  ["/admin/schedule", "admin-schedule"],
  ["/admin/masters", "admin-masters"],
]) {
  await desktop.page.goto(`http://127.0.0.1:3000${route}`, { waitUntil: "networkidle" });
  await desktop.page.waitForTimeout(900);
  await desktop.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
}

console.log(logs.length ? logs.join("\n") : "No console errors");
await browser.close();

