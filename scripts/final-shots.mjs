import { chromium } from "playwright-core";
import fs from "node:fs";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://127.0.0.1:3000";
fs.mkdirSync("screenshots/final", { recursive: true });

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none"],
});

const errors = [];
const desktop = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
});
const page = await desktop.newPage();
page.on("console", (message) => {
  if (message.type() === "error") errors.push(`CONSOLE ${message.text()}`);
});
page.on("pageerror", (error) => errors.push(`PAGEERROR ${error.message}`));

async function revealAll(target) {
  const reveals = target.locator("[data-reveal]");
  const count = await reveals.count();
  for (let index = 0; index < count; index += 1) {
    await reveals.nth(index).scrollIntoViewIfNeeded();
    await target.waitForTimeout(110);
  }
  await target.evaluate(() => window.scrollTo(0, 0));
  await target.waitForTimeout(900);
}

await page.goto(BASE, { waitUntil: "networkidle" });
await revealAll(page);
await page.screenshot({ path: "screenshots/final/home-full.png", fullPage: true });

for (const [selector, name] of [
  ["#services", "services"],
  ["#masters", "masters"],
  ["#philosophy", "philosophy"],
  ["#reviews", "reviews"],
]) {
  const section = page.locator(selector);
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await section.screenshot({ path: `screenshots/final/${name}.png` });
}

await page.goto(`${BASE}/booking`, { waitUntil: "networkidle" });
await revealAll(page);
await page.screenshot({ path: "screenshots/final/booking.png", fullPage: true });

await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.screenshot({ path: "screenshots/final/login.png", fullPage: true });

await page.fill("#email", "owner@worldbeautyclub.ru");
await page.fill("#password", "WBC2026!");
await page.getByRole("button", { name: /Войти в кабинет/ }).click();
await page.waitForURL("**/admin", { timeout: 20000 });
await page.waitForTimeout(950);
await page.screenshot({ path: "screenshots/final/admin-dashboard.png", fullPage: true });

await page.goto(`${BASE}/admin/bookings`, { waitUntil: "networkidle" });
await page.waitForTimeout(900);
await page.screenshot({ path: "screenshots/final/admin-bookings.png", fullPage: true });

await page.goto(`${BASE}/admin/schedule`, { waitUntil: "networkidle" });
await page.waitForTimeout(1100);
await page.screenshot({ path: "screenshots/final/admin-schedule.png", fullPage: true });

await page.getByRole("tab", { name: /График недели/ }).click();
await page.getByRole("switch").first().waitFor({ timeout: 15000 });
await page.waitForTimeout(500);
await page.screenshot({
  path: "screenshots/final/admin-week-schedule.png",
  fullPage: true,
});

await page.getByRole("tab", { name: /^Слоты/ }).click();
await page.getByRole("button", { name: "Неделя" }).click();
await page.waitForTimeout(1100);
await page.screenshot({ path: "screenshots/final/admin-week-grid.png", fullPage: true });

// ------------------------------------------------------------------- mobile
const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  isMobile: true,
});
const phone = await mobile.newPage();
phone.on("pageerror", (error) => errors.push(`MOBILE PAGEERROR ${error.message}`));
await phone.goto(BASE, { waitUntil: "networkidle" });
await phone.waitForTimeout(700);
await phone.screenshot({ path: "screenshots/final/mobile-hero.png" });
for (const [selector, name] of [
  ["#services", "mobile-services"],
  ["#masters", "mobile-masters"],
  ["#reviews", "mobile-reviews"],
]) {
  const section = phone.locator(selector);
  await section.scrollIntoViewIfNeeded();
  await phone.waitForTimeout(700);
  await phone.screenshot({ path: `screenshots/final/${name}.png` });
}
await phone.goto(`${BASE}/booking`, { waitUntil: "networkidle" });
await phone.waitForTimeout(700);
await phone.screenshot({ path: "screenshots/final/mobile-booking.png" });

console.log(errors.length ? errors.join("\n") : "No runtime errors");
await browser.close();

