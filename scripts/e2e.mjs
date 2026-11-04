import { chromium } from "playwright-core";
import { addDays } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { ru } from "date-fns/locale";
import fs from "node:fs";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://127.0.0.1:3000";
const TZ = "Europe/Moscow";

fs.mkdirSync("screenshots/verify", { recursive: true });

function assert(condition, message) {
  if (!condition) throw new Error(`ASSERT: ${message}`);
}

async function json(path) {
  const response = await fetch(`${BASE}${path}`);
  if (!response.ok) throw new Error(`${path} → ${response.status}`);
  return response.json();
}

const services = await json("/api/services");
const service = services.find((item) => item.slug === "airtouch");
assert(service, "airtouch service exists");
const masters = await json(`/api/masters?serviceId=${service.id}`);
const master = masters.find((item) => item.slug === "nadezhda");
assert(master, "Alina provides airtouch");

const today = formatInTimeZone(new Date(), TZ, "yyyy-MM-dd");
let targetDate = null;
let slots = [];
for (let offset = 1; offset <= 10; offset += 1) {
  const candidate = formatInTimeZone(
    addDays(new Date(`${today}T12:00:00Z`), offset),
    TZ,
    "yyyy-MM-dd",
  );
  const availability = await json(
    `/api/availability?masterId=${master.id}&serviceId=${service.id}&date=${candidate}`,
  );
  if (availability.slots.length > 0) {
    targetDate = candidate;
    slots = availability.slots;
    break;
  }
}
assert(targetDate, "a bookable date exists in the next 10 days");

const target = new Date(`${targetDate}T12:00:00Z`);
const targetDay = formatInTimeZone(target, TZ, "d");
const targetMonth = formatInTimeZone(target, TZ, "MMMM", { locale: ru });
const targetSlot = slots[0];

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const errors = [];
page.on("console", (message) => {
  if (message.type() === "error") errors.push(`CONSOLE ${message.text()}`);
});
page.on("pageerror", (error) => errors.push(`PAGEERROR ${error.message}`));

try {
  console.log("TARGET", { targetDate, targetSlot, master: master.name });

  // ------------------------------------------------------------------ booking
  await page.goto(`${BASE}/booking?service=airtouch&master=nadezhda`, {
    waitUntil: "networkidle",
  });
  await page.getByText("Найдите свой").waitFor({ timeout: 15000 });

  const targetLabel = new RegExp(`^${targetDay} ${targetMonth}`);
  const dayButton = page.getByRole("button", { name: targetLabel }).first();
  if (!(await dayButton.count())) {
    await page.getByRole("button", { name: "Следующий месяц" }).click();
  }
  await page.getByRole("button", { name: targetLabel }).first().click();
  await page.waitForTimeout(1000);

  const slotButton = page.getByRole("button", {
    name: targetSlot,
    exact: true,
  });
  await slotButton.waitFor({ timeout: 15000 });
  await slotButton.click();
  await page.getByRole("button", { name: /Продолжить/ }).click();
  await page.waitForTimeout(500);

  await page.fill("#customerName", "Тест Гость");
  await page.fill("#customerPhone", "9161234567");
  await page.fill("#customerEmail", "test@example.com");
  await page.fill("#notes", "Проверка онлайн-записи и RHF");
  await page.getByRole("button", { name: /Подтвердить запись/ }).first().click();
  await page.getByText("Вы записаны").waitFor({ timeout: 20000 });
  await page.waitForTimeout(600);

  const reference = (
    await page.locator("text=/WBC-[A-F0-9]{6}/").first().textContent()
  )?.trim();
  assert(reference?.startsWith("WBC-"), "booking reference is visible");
  console.log("BOOKING_OK", reference);
  await page.screenshot({ path: "screenshots/verify/booking-success.png", fullPage: true });

  const after = await json(
    `/api/availability?masterId=${master.id}&serviceId=${service.id}&date=${targetDate}`,
  );
  assert(
    !after.slots.includes(targetSlot),
    "booked slot disappears from public availability",
  );
  console.log("AVAILABILITY_CONFLICT_OK");

  // -------------------------------------------------------------------- admin
  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
  await page.fill("#email", "owner@worldbeautyclub.ru");
  await page.fill("#password", "WBC2026!");
  await page.getByRole("button", { name: /Войти в кабинет/ }).click();
  await page.waitForURL("**/admin", { timeout: 20000 });
  console.log("LOGIN_OK");

  await page.goto(`${BASE}/admin/bookings`, { waitUntil: "networkidle" });
  await page.getByPlaceholder("Имя, телефон или номер").fill("Тест Гость");
  await page.waitForTimeout(1200);

  const row = page.locator("tr").filter({ hasText: "Тест Гость" }).first();
  await row.waitFor({ timeout: 10000 });
  await row.getByRole("button", { name: /Подтвердить/ }).click();
  await row.getByText("Подтверждена").first().waitFor({ timeout: 15000 });
  await row.getByRole("button", { name: /Завершить/ }).click();
  await row.getByText("Завершена").first().waitFor({ timeout: 15000 });
  await page.screenshot({ path: "screenshots/verify/admin-bookings.png", fullPage: true });
  console.log("ADMIN_STATUS_FLOW_OK");

  // ----------------------------------------------------------- weekly schedule
  await page.goto(`${BASE}/admin/schedule`, { waitUntil: "networkidle" });
  await page.getByRole("tab", { name: /График недели/ }).click();
  await page.getByText("Повторяющийся график").waitFor({ timeout: 10000 });
  await page.waitForTimeout(700);

  const switches = page.getByRole("switch");
  await switches.first().waitFor({ timeout: 15000 });
  assert((await switches.count()) === 7, "seven weekday switches");
  const tuesday = switches.nth(1);
  await tuesday.click();
  await page.getByRole("button", { name: /Сохранить график/ }).click();
  await page.waitForTimeout(1400);
  assert(await page.getByText("График мастера обновлён").isVisible(), "schedule saved");
  await tuesday.click();
  await page.getByRole("button", { name: /Сохранить график/ }).click();
  await page.waitForTimeout(1400);
  console.log("WEEKLY_SCHEDULE_OK");
  await page.screenshot({ path: "screenshots/verify/admin-week-schedule.png", fullPage: true });

  // ---------------------------------------------------------------- week grid
  await page.getByRole("tab", { name: /^Слоты/ }).click();
  await page.getByRole("button", { name: "Неделя" }).click();
  await page.waitForTimeout(1200);
  const availableCell = page.locator('button[aria-label*=": свободно"]').first();
  await availableCell.waitFor({ timeout: 15000 });
  const availableLabel = await availableCell.getAttribute("aria-label");
  assert(availableLabel, "available week cell has aria-label");
  await availableCell.click();
  await page.waitForTimeout(1400);
  const blockedLabel = availableLabel.replace(": свободно", ": закрыто");
  const blockedCell = page.locator(`button[aria-label="${blockedLabel}"]`);
  await blockedCell.waitFor({ timeout: 10000 });
  await blockedCell.click();
  await page.waitForTimeout(1400);
  await page
    .locator(`button[aria-label="${availableLabel}"]`)
    .waitFor({ timeout: 10000 });
  console.log("WEEK_GRID_TOGGLE_OK");
  await page.screenshot({ path: "screenshots/verify/admin-week-grid.png", fullPage: true });

  const meaningfulErrors = errors.filter(
    (entry) => !entry.includes("favicon") && !entry.includes("404"),
  );
  assert(meaningfulErrors.length === 0, meaningfulErrors.join("\n"));
  console.log("NO_RUNTIME_ERRORS");
  console.log("VERIFY_COMPLETE");
} catch (error) {
  console.error(error);
  await page.screenshot({ path: "screenshots/verify/failure.png", fullPage: true });
  console.error(errors.join("\n"));
  process.exitCode = 1;
} finally {
  await browser.close();
}

