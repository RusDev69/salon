import { chromium } from "playwright-core";
import fs from "node:fs";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
fs.mkdirSync("screenshots/review", { recursive: true });

const browser = await chromium.launch({
  executablePath: chrome,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none"],
});

const errors = [];
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(`CONSOLE ${msg.text()}`);
});
page.on("pageerror", (err) => errors.push(`PAGEERROR ${err.message}`));

await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
await page.evaluate(async () => {
  const step = 650;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 90));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(1200);
await page.screenshot({ path: "screenshots/review/home-desktop-full.png", fullPage: true });

for (const [selector, name] of [
  ["#services", "services"],
  ["#masters", "masters"],
  ["#philosophy", "philosophy"],
  ["#reviews", "reviews"],
  ["#contacts", "footer"],
]) {
  const el = page.locator(selector);
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await el.screenshot({ path: `screenshots/review/home-${name}.png` });
}

// Mobile
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
const m = await mobile.newPage();
m.on("pageerror", (err) => errors.push(`MOBILE PAGEERROR ${err.message}`));
await m.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
await m.waitForTimeout(800);
await m.screenshot({ path: "screenshots/review/mobile-hero.png" });
const sections = [
  ["#services", "mobile-services"],
  ["#masters", "mobile-masters"],
  ["#reviews", "mobile-reviews"],
];
for (const [selector, name] of sections) {
  await m.locator(selector).scrollIntoViewIfNeeded();
  await m.waitForTimeout(900);
  await m.screenshot({ path: `screenshots/review/${name}.png` });
}
await m.goto("http://127.0.0.1:3000/booking", { waitUntil: "networkidle" });
await m.waitForTimeout(700);
await m.screenshot({ path: "screenshots/review/mobile-booking.png", fullPage: false });

console.log(errors.length ? errors.join("\n") : "No runtime errors");
await browser.close();
