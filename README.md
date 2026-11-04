# World Beauty Club — Beauty & Wellness

Премиальное веб-приложение салона красоты World Beauty Club на Варшавском шоссе, 122А: элегантный лендинг, онлайн-запись в четыре шага и кабинет владельца с управлением записями, слотами и командой. 169 услуг, рейтинг 5.0 и 389 отзывов на Яндекс Картах.

> **Демо-доступ к кабинету:** `owner@worldbeautyclub.ru` / `WBC2026!`
> Локальная версия работает без внешних сервисов на Prisma + SQLite. Production-схема, RLS и Auth подготовлены для Supabase.

![Главная страница](screenshots/final/home-full-small.jpg)

---

## Содержание

- [Стек](#стек)
- [Что реализовано](#что-реализовано)
- [Быстрый старт](#быстрый-старт)
- [Supabase: production-режим](#supabase-production-режим)
- [Telegram-уведомления](#telegram-уведомления)
- [Структура проекта](#структура-проекта)
- [База данных и RLS](#база-данных-и-rls)
- [Поток записи](#поток-записи)
- [API](#api)
- [Дизайн-система](#дизайн-система)
- [Проверка и сборка](#проверка-и-сборка)
- [Деплой](#деплой)
- [Безопасность](#безопасность)
- [Ограничения демо](#ограничения-демо)

---

## Стек

| Слой | Технологии |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript strict |
| UI | Tailwind CSS, shadcn/ui-компоненты, Lucide, Framer Motion |
| Данные | React Query, Zustand, Zod |
| Формы | React Hook Form + `@hookform/resolvers/zod` |
| Backend | Route Handlers, Prisma ORM |
| Production DB | Supabase Postgres, Auth, RLS, SQL-миграции |
| Демо DB | SQLite (Prisma) — zero-config запуск |
| Auth | Supabase Auth (production) / JWT-cookie (локальное демо) |
| Уведомления | Telegram Bot API (webhook + подписчики) |
| Даты | date-fns + date-fns-tz, таймзона салона `Europe/Moscow` |

---

## Что реализовано

### Лендинг

- Hero-секция с параллакс-композицией, крупной типографикой Playfair Display и мягкими анимациями.
- Секция услуг: сетка карточек с категорией, ценой и длительностью; ссылки сразу предзаполняют запись.
- Секция «Наши мастера»: графические портреты, рейтинг, специализация, стаж.
- Философия салона, отзывы, блок сообщества ВКонтакте.
- Адаптивная навигация, мобильное меню, footer, JSON-LD `BeautySalon`, sitemap и robots.
- Плавное появление секций при скролле через `Reveal` (Framer Motion) с поддержкой `prefers-reduced-motion`.

### Онлайн-запись

- Stepper: услуга → мастер → дата и время → контакты.
- Календарь на 60 дней; салон работает ежедневно 10:00–22:00.
- Свободные слоты строятся из недельного графика мастера и обновляются каждые 15 секунд.
- Занятые (`pending`, `confirmed`) и закрытые владельцем слоты не показываются.
- Сервер повторно проверяет услугу, мастера, график, длительность и пересечения при создании записи.
- Конкурентная запись защищена транзакцией; в Supabase — exclusion constraint на уровне БД.
- После успеха: номер записи, `.ics`-файл для календаря, повторная запись.

### Кабинет владельца

- Защищённый layout + middleware, проверка роли `owner` и JWT/ Supabase Auth.
- Обзор: записи дня, ожидающие подтверждения, выручка за 7 дней, загрузка, ближайшие заявки.
- `/admin/bookings`: shadcn-таблица всех записей на TanStack Table (пагинация по 8), фильтры по статусу/дате/поиску, подтверждение, завершение, отмена, восстановление.
- `/admin/schedule`: дневная сетка слотов и недельная сетка; клик по свободному слоту закрывает его, повторный клик открывает.
- Редактор недельного графика мастера (`master_schedules`): рабочие дни, начало/конец смены, сохранение.
- CRUD мастеров: добавление, редактирование, мягкое удаление в архив, восстановление, выбор услуг и фото.
- Telegram-уведомления: новая запись и каждая смена статуса отправляются всем активным подписчикам бота; подписка через `/start`.

---

## Быстрый старт

Требования: Node.js 20+, pnpm 9+.

```bash
pnpm install
pnpm db:push
pnpm db:seed
pnpm dev
```

Откройте [http://localhost:3000](http://localhost:3000).

Кабинет: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

```text
owner@worldbeautyclub.ru
WBC2026!
```

Если база уже существует и нужно пересоздать демо-данные:

```bash
pnpm db:push --force-reset
pnpm db:seed
```

### Переменные окружения

Скопируйте `.env.example` в `.env`:

```dotenv
DATABASE_URL="file:./dev.db"
AUTH_SECRET="длинная-случайная-строка"
NEXT_PUBLIC_SALON_TIMEZONE="Europe/Moscow"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

---

## Supabase: production-режим

Каноническая схема находится в [`supabase/migrations/`](supabase/migrations/), демо-каталог — в [`supabase/seed.sql`](supabase/seed.sql), конфигурация CLI — в [`supabase/config.toml`](supabase/config.toml). Применяются **обе** миграции: базовая и Telegram-подписчики.

### 1. Применить SQL

**Вариант A — Supabase CLI (рекомендуется):**

```bash
supabase link --project-ref <project-ref>
supabase db push
psql "$DATABASE_URL" -f supabase/seed.sql
```

**Вариант B — SQL Editor:**

1. Откройте SQL Editor в Supabase Dashboard.
2. Выполните `20261104090000_init.sql`.
3. Выполните `20261104100000_telegram.sql`.
4. Выполните `supabase/seed.sql`.

Миграции создают:

- таблицы `profiles`, `masters`, `services`, `master_services`, `master_schedules`, `bookings`, `slot_blocks`, `telegram_subscribers`;
- enum-статусы в нижнем регистре: `pending | confirmed | cancelled | completed`;
- триггеры `updated_at`, создание профиля при регистрации;
- exclusion constraint `bookings_no_overlap` против двойной записи;
- RLS-политики для всех таблиц;
- RPC `get_available_slots(master_id, service_id, date, timezone)`.

### 2. Создать владельца

1. Создайте пользователя в **Authentication → Users** (или через форму регистрации Supabase).
2. Выполните:

```sql
update public.profiles
set role = 'owner', full_name = 'Светлана Ерофеева'
where email = 'owner@worldbeautyclub.ru';
```

Пароль хранится в Supabase Auth. Приложение проверяет пароль через `signInWithPassword`, затем читает роль из `profiles` доверенным server-клиентом.

### 3. Настроить окружение

```dotenv
DATABASE_URL="postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
NEXT_PUBLIC_SUPABASE_URL="https://<ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-or-publishable-key>"
SUPABASE_SERVICE_ROLE_KEY="<service-role-or-secret-key>"
AUTH_SECRET="<long-random-string>"
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
NEXT_PUBLIC_SALON_TIMEZONE="Europe/Moscow"
```

`SUPABASE_SERVICE_ROLE_KEY` используется только на сервере (route handlers) и **никогда** не попадает в клиентский бандл.

### 4. Prisma на Supabase Postgres

```bash
cp prisma/schema.prisma prisma/schema.sqlite.prisma.bak
cp prisma/schema.supabase.prisma prisma/schema.prisma
pnpm prisma generate
pnpm build
```

`prisma/schema.supabase.prisma` маппит camelCase TypeScript на snake_case Postgres и enum-статусы на нижний регистр. SQL-миграция остаётся источником истины для RLS, триггеров и ограничений.

> **Важно про RLS.** Политики защищают доступ через PostgREST/supabase-js (anon и authenticated). Next.js-сервер подключается к Postgres по доверенному соединению Prisma и не обходит бизнес-валидацию: все мутации повторно проверяются в route handlers. Для прямых клиентских запросов RLS активен.

### 5. Supabase Auth

Логин автоматически переключается на Supabase, если заданы `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` и `SUPABASE_SERVICE_ROLE_KEY`. Без них используется локальная демо-аутентификация.

После успешного входа приложение выдаёт httpOnly JWT-cookie на 8 часов; middleware проверяет роль `OWNER`.

---

## Telegram-уведомления

Бот отправляет карточку записи со всеми параметрами: номер, гость, телефон, email, услуга, мастер, дата, время, длительность, стоимость, статус, пожелания и дата создания.

### Как это работает

1. Пользователь открывает бота и отправляет `/start`.
2. Webhook сохраняет `chat_id` в `telegram_subscribers`.
3. После новой записи или смены статуса `notifyBooking()` отправляет сообщение всем активным подписчикам и дополнительным ID из `TELEGRAM_CHAT_ID(S)`.
4. `/stop` отключает подписку, `/status` показывает её состояние.

Telegram не позволяет боту писать произвольным пользователям: каждый должен сам нажать `/start`. Для группового чата или канала добавьте бота и отправьте `/start` там — уведомления будет видеть вся группа/подписчики канала.

### Настройка

В `.env` (и в переменных Vercel/VPS):

```dotenv
TELEGRAM_BOT_TOKEN="<токен из @BotFather>"
TELEGRAM_WEBHOOK_SECRET="<случайная строка>"
TELEGRAM_CHAT_ID=""          # необязательно: ваш личный chat_id
TELEGRAM_CHAT_IDS=""         # необязательно: группа/канал через запятую
```

Токен создаётся в [@BotFather](https://t.me/BotFather), команда `/newbot`.

### Webhook

Нужен публичный HTTPS-адрес. После деплоя:

```bash
pnpm telegram:webhook
```

Скрипт вызывает `setWebhook` на:

```text
https://<ваш-домен>/api/telegram/webhook
```

Для локальной проверки можно временно поднять туннель и задать `TELEGRAM_WEBHOOK_URL`.

Секрет проверяется по заголовку `X-Telegram-Bot-Api-Secret-Token`. Без него webhook в production отвечает `503`, с неверным секретом — `401`.

### База

Для Supabase примените дополнительную миграцию:

```text
supabase/migrations/20261104100000_telegram.sql
```

Для локального SQLite:

```bash
pnpm db:push
```

> Токен — секрет. Не коммитьте `.env` и не передавайте токен в клиентский код. Если токен засветился, перевыпустите его через `/revoke` в @BotFather.

---

## Структура проекта

```text
.
├── app/
│   ├── (site)/
│   │   ├── layout.tsx                 # header, footer, skip-link, JSON-LD
│   │   ├── page.tsx                   # лендинг (server component)
│   │   ├── booking/page.tsx           # страница онлайн-записи
│   │   └── booking/success/page.tsx   # /booking/success?ref=…
│   ├── admin/
│   │   ├── login/page.tsx             # вход владельца
│   │   └── (panel)/
│   │       ├── layout.tsx             # защищённый layout + sidebar
│   │       ├── page.tsx               # обзор
│   │       ├── bookings/page.tsx      # /admin/bookings
│   │       ├── appointments/page.tsx  # alias → /admin/bookings
│   │       ├── masters/page.tsx       # CRUD мастеров
│   │       └── schedule/page.tsx      # слоты + недельный график
│   ├── api/
│   │   ├── admin/
│   │   │   ├── bookings/route.ts
│   │   │   ├── bookings/[id]/route.ts
│   │   │   ├── masters/route.ts
│   │   │   ├── masters/[id]/route.ts
│   │   │   ├── schedules/route.ts     # GET/PUT master_schedules
│   │   │   └── slots/route.ts         # день + toggle занятости
│   │   ├── auth/login/route.ts
│   │   ├── auth/logout/route.ts
│   │   ├── availability/route.ts      # свободные слоты
│   │   ├── bookings/route.ts          # создание записи
│   │   ├── masters/route.ts
│   │   ├── services/route.ts
│   │   └── telegram/webhook/route.ts  # /start, /stop, /status
│   ├── error.tsx
│   ├── not-found.tsx
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── admin/
│   │   ├── admin-sidebar.tsx
│   │   ├── appointments-manager.tsx
│   │   ├── login-form.tsx
│   │   ├── masters-manager.tsx
│   │   ├── schedule-manager.tsx
│   │   ├── schedule-workspace.tsx
│   │   ├── week-slot-grid.tsx
│   │   └── weekly-schedule-editor.tsx
│   ├── booking/
│   │   ├── booking-calendar.tsx       # календарь + доступные даты
│   │   ├── booking-flow.tsx           # Zustand + React Query
│   │   ├── booking-stepper.tsx
│   │   ├── booking-summary.tsx
│   │   ├── booking-success.tsx
│   │   ├── booking-success-page.tsx   # отдельный success-route
│   │   ├── step-service.tsx
│   │   ├── step-master.tsx
│   │   ├── step-schedule.tsx
│   │   └── step-details.tsx           # RHF + Zod
│   ├── common/
│   ├── landing/
│   ├── layout/
│   └── ui/                            # shadcn-примитивы
├── hooks/
│   ├── use-admin.ts
│   └── use-booking.ts
├── lib/
│   ├── auth.ts
│   ├── prisma.ts
│   ├── session.ts
│   ├── telegram.ts                    # Bot API + форматирование
│   ├── time.ts
│   ├── types.ts
│   ├── utils.ts
│   ├── validators.ts
│   └── supabase/
│       ├── auth.ts
│       ├── client.ts
│       ├── config.ts
│       └── server.ts
├── prisma/
│   ├── schema.prisma                  # SQLite demo
│   ├── schema.supabase.prisma         # Postgres production
│   ├── dev.db
│   └── seed.ts
├── store/
│   └── booking-store.ts               # Zustand
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   ├── 20261104090000_init.sql
│   │   └── 20261104100000_telegram.sql
│   └── seed.sql
├── middleware.ts                      # защита /admin и /api/admin
└── next.config.ts                     # security headers
```

---

## База данных и RLS

### Связи

```text
auth.users 1 ─── 1 profiles
profiles.role = client | owner | master

masters 1 ─── * master_schedules (day_of_week 1..7, start_time, end_time)
masters * ─── * services            (master_services)
masters 1 ─── * bookings * ─── 1 services
masters 1 ─── * slot_blocks
profiles 1 ─── * bookings (client_id, nullable для гостя)
```

### Статусы

```sql
create type booking_status as enum ('pending','confirmed','cancelled','completed');
```

В UI статусы отображаются как «Ожидает», «Подтверждена», «Отменена», «Завершена». Prisma-схема маппит верхний регистр TypeScript на нижний регистр Postgres.

### Ключевые ограничения

- `bookings_no_overlap`: `EXCLUDE USING gist (master_id WITH =, tstzrange(start_time, end_time, '[)') WITH &&) WHERE status IN ('pending','confirmed')`.
- `master_schedules_time_order`: `start_time < end_time`.
- `bookings_time_order`: `end_time > start_time`.
- Триггер `set_booking_end_time()` пересчитывает `end_time` из длительности услуги — клиент не может продлить визит подменой payload.
- `unique(master_id, start_time)` для ручных блокировок.

### RLS-политики (кратко)

| Таблица | anon | authenticated client | owner |
|---|---|---|---|
| `services`, `masters` | select active | select active | full CRUD |
| `master_schedules` | select active | select active | full CRUD |
| `bookings` | — | select/insert/cancel свои | select/update все |
| `profiles` | — | select/update свои (`full_name`, `avatar_url`) | select все |
| `slot_blocks` | — | — | full CRUD |
| `master_services` | select | select | full CRUD |
| `telegram_subscribers` | — | — | select |

Проверка владельца вынесена в `public.is_owner()` с `SECURITY DEFINER`, чтобы избежать рекурсии RLS. Колонка `role` защищена column-level grants: пользователь не может повысить себе роль.

### RPC свободных слотов

```sql
select * from public.get_available_slots(
  '<master-uuid>',
  '<service-uuid>',
  '2026-11-04',
  'Europe/Moscow'
);
```

Функция учитывает график, длительность услуги, занятые записи, ручные блокировки и прошедшее время. Next.js использует эквивалентную серверную логику, чтобы работать и в локальном SQLite-демо.

---

## Поток записи

1. **Zustand** хранит шаг, услугу, мастера, дату, время и черновик контактов.
2. **React Query** запрашивает `/api/availability` при выборе даты; кэш инвалидируется после записи и по таймеру.
3. **BookingCalendar** показывает горизонт 60 дней и блокирует прошедшие даты; World Beauty Club работает ежедневно 10:00–22:00.
4. **StepDetails** валидирует контакты через React Hook Form + Zod.
5. `POST /api/bookings` повторно проверяет всё на сервере, создаёт `PENDING`-запись в транзакции и возвращает номер.
6. Клиент сохраняет подтверждение в `sessionStorage` и делает `router.replace('/booking/success?ref=…')`; success-страница показывает детали, `.ics` и обновляет доступность.

Если слот заняли между выбором и подтверждением, API возвращает `409`; интерфейс очищает время, возвращает на шаг расписания и показывает toast.

---

## API

| Метод | Endpoint | Назначение |
|---|---|---|
| `GET` | `/api/services` | активные услуги |
| `GET` | `/api/masters?serviceId=` | активные мастера |
| `GET` | `/api/availability?masterId=&serviceId=&date=` | свободные слоты |
| `POST` | `/api/bookings` | создать запись |
| `POST` | `/api/auth/login` | вход владельца |
| `POST` | `/api/auth/logout` | выход |
| `GET` | `/api/admin/bookings?status=&date=&q=` | записи для админки |
| `PATCH` | `/api/admin/bookings/:id` | сменить статус |
| `GET` | `/api/admin/slots?masterId=&date=` | сетка слотов |
| `POST` | `/api/admin/slots` | закрыть/открыть слот |
| `GET` | `/api/admin/schedules?masterId=` | недельный график |
| `PUT` | `/api/admin/schedules` | сохранить график |
| `GET/POST` | `/api/admin/masters` | список/создание мастера |
| `PATCH/DELETE` | `/api/admin/masters/:id` | редактирование/архив |
| `POST` | `/api/telegram/webhook` | подписка бота и команды |

Все `/api/admin/*` защищены middleware и дополнительной проверкой `requireApiOwner()` в route handler.

---

## Дизайн-система

| Токен | Значение |
|---|---|
| Фон | `#FBFCF7` |
| Основной зелёный | `#3F8467` |
| Светлый sage | `#A6C5AF` |
| Тёплый серый | `#A8A29E` |
| Тёмный лесной (текст) | `#14221B` |
| Заголовки | Playfair Display |
| Основной текст | Inter |
| Скругления | `rounded-2xl`, `rounded-3xl`, `rounded-[26px]` |
| Стекло | `backdrop-blur-md bg-white/30` |
| Мягкая тень | `0 8px 30px rgb(0 0 0 / 0.04)` |

Токены заданы в [`tailwind.config.ts`](tailwind.config.ts) и [`app/globals.css`](app/globals.css). Для доступности мелкий текст использует более тёмный `taupe`, а точный `#A8A29E` — декоративные подписи и разделители.

---

## Проверка и сборка

```bash
pnpm build        # prisma generate + next build
pnpm typecheck    # tsc --noEmit
pnpm start        # production server на :3000
```

E2E-сценарии Playwright находятся в [`scripts/e2e.mjs`](scripts/e2e.mjs). Запуск — при работающем сервере на `:3000`:

```bash
pnpm dev            # отдельный терминал
pnpm test:e2e
```

Проверяются:

- запись гостя и исчезновение слота;
- вход владельца;
- смену статусов;
- блокировку/разблокировку слота;
- создание, редактирование и архивирование мастера.

Скриншоты: [`screenshots/`](screenshots/).

---

## Деплой

### Vercel

1. Импортируйте репозиторий.
2. Добавьте переменные из production-раздела `.env.example`.
3. Build command: `pnpm build`.
4. Убедитесь, что `DATABASE_URL` указывает на Supabase Transaction pooler.
5. Примените миграции до первого деплоя.

### Supabase

- Включите email-провайдер и подтверждение почты по необходимости.
- Настройте Site URL и Redirect URLs в Auth.
- Не публикуйте service role key.
- Для production-домена обновите `NEXT_PUBLIC_SITE_URL`.

---

## Безопасность

- httpOnly, `sameSite=lax`, `secure` (production) cookie сессии; TTL 8 часов.
- Пароли Supabase Auth; локальный демо-пароль хранится bcrypt-хешем.
- Rate limiting логина: 8 попыток / 10 минут на IP.
- Zod-валидация всех входных данных на сервере.
- Проверка роли и в layout, и в middleware, и в каждом admin route handler.
- Security headers: `nosniff`, `SAMEORIGIN`, `Referrer-Policy`, `Permissions-Policy`, HSTS.
- RLS + column-level grants + exclusion constraint в Postgres.
- Telegram webhook защищён `X-Telegram-Bot-Api-Secret-Token`; токен бота хранится только в серверном `.env`.
- Админка и API закрыты от индексации (`robots.ts`, metadata `robots`).

---

## Ограничения демо

- Instagram-блок — стилизованный placeholder; для реального фида нужен access token Basic Display API.
- Локальная SQLite-версия не отправляет email/SMS-подтверждения; Telegram-уведомления работают при доступном api.telegram.org и настроенном webhook.
- Для Telegram-уведомлений каждый получатель должен сам отправить боту `/start`.
- Supabase Auth и RLS требуют настроенного проекта; без env приложение прозрачно работает в demo-режиме.
- Онлайн-оплата и личный кабинет гостя не входят в текущий объём.

