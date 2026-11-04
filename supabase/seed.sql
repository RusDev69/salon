-- ============================================================================
-- World Beauty Club — demo catalog for a fresh Supabase project.
--
-- Run after both migrations:
--   supabase db reset          (local)
--   supabase db push           (remote)
--   psql "$DATABASE_URL" -f supabase/seed.sql
--
-- The owner account is created by Supabase Auth (Dashboard → Auth → Users or
-- the sign-up form). Promote it once:
--   update public.profiles
--   set role = 'owner', full_name = 'Светлана Ерофеева'
--   where email = 'owner@worldbeautyclub.ru';
-- ============================================================================

begin;

insert into public.services
  (slug, name, description, category, duration_minutes, price, is_active, sort_order)
values
  ('manicure-gel', 'Маникюр + покрытие гель-лак',
   'Комбинированный маникюр, укрепление и покрытие гель-лаком в один тон. Средний сегмент EMI, UNO, COSMO или премиум LUXIO.',
   'NAILS', 90, 2600, true, 1),
  ('spa-manicure', 'SPA-маникюр без покрытия',
   'Гигиенический маникюр с уходом Nogturne Professional и Spa System: очищение, питание и глубокое увлажнение кожи рук.',
   'NAILS', 75, 1800, true, 2),
  ('smart-pedicure', 'SMART-педикюр женский',
   'Обработка стоп по технологии SMART: удаление ороговевшей кожи и натоптышей, аккуратная работа с ногтевой пластиной.',
   'PODOLOGY', 90, 2500, true, 3),
  ('nail-extension', 'Наращивание ногтей',
   'Моделирование длины и формы с укреплением. Подбираем архитектуру, которая подходит вашим натуральным ногтям.',
   'NAILS', 150, 4000, true, 4),
  ('women-haircut', 'Женская стрижка',
   'Стрижка с учётом структуры волос, формы лица и вашего образа жизни. Мытьё и укладка включены.',
   'HAIR', 60, 2000, true, 5),
  ('men-haircut', 'Мужская модельная стрижка',
   'Точная форма, работа с текстурами и укладка. Подходит для классических и современных образов.',
   'HAIR', 45, 1500, true, 6),
  ('haircut-spa', 'Стрижка + японский SPA-массаж головы',
   'Модельная стрижка, питательный уход и расслабляющий массаж кожи головы.',
   'HAIR', 90, 4000, true, 7),
  ('promo-hair', 'Акция: стрижка + уход для кожи головы и волос',
   'Модельная стрижка, пилинг и массаж кожи головы, питательный уход по типу волос. Фиксированная цена на любую длину — 3 950 ₽ вместо 6 000 ₽.',
   'HAIR', 90, 3950, true, 8),
  ('coloring-roots', 'Окрашивание корней',
   'Освежение цвета у корней с деликатным уходом. Подбираем оттенок под ваш текущий цвет и образ.',
   'HAIR', 90, 3500, true, 9),
  ('airtouch', 'Окрашивание air-touch',
   'Мягкое растяжение цвета без резких границ. Техника для естественного блонда, света и объёма.',
   'HAIR', 180, 12000, true, 10),
  ('complex-coloring', 'Сложное окрашивание',
   'Мелирование, шатуш, омбре или балаяж. Многоэтапная работа с цветом и уходом для стойкого результата.',
   'HAIR', 180, 6000, true, 11),
  ('lebel-absolute', 'Lebel «Абсолютное счастье для волос»',
   'Японская многоэтапная SPA-программа для восстановления волос и кожи головы: увлажнение, плотность и эластичность.',
   'HAIR', 90, 5500, true, 12),
  ('combined-cleansing', 'Комбинированная чистка лица',
   'Глубокое очищение с учётом состояния кожи: поры, текстура и ровный тон. Завершаем успокаивающим уходом.',
   'SKIN', 90, 4000, true, 13),
  ('face-massage', 'Массаж лица 50 минут',
   'Скульптурный, буккальный или миофасциальный массаж — подбираем технику под задачу вашей кожи.',
   'SKIN', 50, 4000, true, 14),
  ('peach-peel', 'Peach Peel. Гидролипидный пилинг',
   'Деликатное обновление кожи: мягко снимает ороговевший слой, выравнивает тон и возвращает сияние.',
   'SKIN', 60, 4500, true, 15),
  ('brow-architecture', 'Архитектура бровей',
   'Форма по вашим чертам лица, коррекция и окрашивание. Естественный результат без перегруженности.',
   'BROWS', 45, 1900, true, 16),
  ('brow-lamination', 'Ламинирование бровей + архитектура',
   'Долговременная укладка бровей, коррекция формы и окрашивание. Брови выглядят гуще и ухоженнее.',
   'BROWS', 60, 3000, true, 17),
  ('lash-lamination', 'Ламинирование ресниц + ботокс',
   'Изгиб, питание и укрепление ресниц. Эффект распахнутого взгляда без наращивания.',
   'BROWS', 90, 4500, true, 18),
  ('permanent-brows', 'Перманентный макияж бровей',
   'Максимально натуральный эффект: форма и мягкий оттенок, который сохраняется до года и постепенно светлеет.',
   'MAKEUP', 120, 12000, true, 19),
  ('permanent-lips', 'Перманентный макияж губ',
   'Деликатный оттенок, красивая форма и визуально более свежие, ухоженные губы. Максимально натуральный результат.',
   'MAKEUP', 120, 12000, true, 20),
  ('laser-bikini', 'Лазерная эпиляция: глубокое бикини',
   'Комфортная процедура на современном оборудовании. Курс и интервалы подбирает специалист после консультации.',
   'LASER', 45, 3500, true, 21),
  ('laser-legs', 'Лазерная эпиляция: ноги полностью',
   'Обработка ног полностью с индивидуальным подбором параметров и деликатным охлаждением кожи.',
   'LASER', 60, 3960, true, 22),
  ('laser-complex', 'Лазерная эпиляция: комплекс №2',
   'Бикини + подмышки + голени. Практичный комплекс для регулярного ухода без лишних визитов.',
   'LASER', 75, 5100, true, 23),
  ('podology-pedicure', 'Подологический педикюр',
   'Комплексная процедура для здоровья стоп и ногтей. Работа с проблемными зонами специалистом с медицинским образованием.',
   'PODOLOGY', 90, 4000, true, 24)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  duration_minutes = excluded.duration_minutes,
  price = excluded.price,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.masters
  (slug, name, specialization, bio, photo_url, rating, reviews_count,
   experience_years, is_active, sort_order)
values
  ('elvina', 'Эльвина', 'Nail-мастер · подолог',
   'Мастер маникюра и педикюра, которую гости отмечают за аккуратность и внимательное отношение. Работает с укреплением, моделированием и уходом за стопами.',
   '/images/wbc/master-1.svg', 5.0, 96, 6, true, 1),
  ('maria', 'Мария', 'Косметолог-эстетист',
   'Косметолог World Beauty Club. Подбирает уход по состоянию кожи, работает с чистками, пилингами, массажем лица и лазерными протоколами.',
   '/images/wbc/master-2.svg', 5.0, 124, 8, true, 2),
  ('nadezhda', 'Надежда', 'Стилист-колорист',
   'Стилист и колорист с опытом более 10 лет. Создаёт стрижки и цвет, которые легко повторить дома, и бережно относится к структуре волос.',
   '/images/wbc/master-3.svg', 5.0, 169, 10, true, 3)
on conflict (slug) do update set
  name = excluded.name,
  specialization = excluded.specialization,
  bio = excluded.bio,
  photo_url = excluded.photo_url,
  rating = excluded.rating,
  reviews_count = excluded.reviews_count,
  experience_years = excluded.experience_years,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

-- Master ↔ service matrix
insert into public.master_services (master_id, service_id)
select m.id, s.id
from (values
  ('elvina', 'manicure-gel'),
  ('elvina', 'spa-manicure'),
  ('elvina', 'smart-pedicure'),
  ('elvina', 'nail-extension'),
  ('elvina', 'podology-pedicure'),
  ('maria', 'combined-cleansing'),
  ('maria', 'face-massage'),
  ('maria', 'peach-peel'),
  ('maria', 'permanent-brows'),
  ('maria', 'permanent-lips'),
  ('maria', 'laser-bikini'),
  ('maria', 'laser-legs'),
  ('maria', 'laser-complex'),
  ('nadezhda', 'women-haircut'),
  ('nadezhda', 'men-haircut'),
  ('nadezhda', 'haircut-spa'),
  ('nadezhda', 'promo-hair'),
  ('nadezhda', 'coloring-roots'),
  ('nadezhda', 'airtouch'),
  ('nadezhda', 'complex-coloring'),
  ('nadezhda', 'lebel-absolute'),
  ('nadezhda', 'brow-architecture'),
  ('nadezhda', 'brow-lamination'),
  ('nadezhda', 'lash-lamination')
) as pairs(master_slug, service_slug)
join public.masters m on m.slug = pairs.master_slug
join public.services s on s.slug = pairs.service_slug
on conflict do nothing;

-- World Beauty Club работает без выходных, 10:00–22:00.
insert into public.master_schedules (master_id, day_of_week, start_time, end_time, is_active)
select m.id, day, time '10:00', time '22:00', true
from public.masters m
cross join generate_series(1, 7) as day
where m.is_active = true
on conflict (master_id, day_of_week, start_time) do update
set end_time = excluded.end_time, is_active = true;

-- Demo visits for today's shift. The booking trigger recalculates end_time
-- from services.duration_minutes, so the placeholder end is safe.
with demo(master_slug, service_slug, reference, customer_name, customer_phone,
          customer_email, notes, start_time, status) as (
  values
    ('elvina', 'manicure-gel', 'WBC-1041', 'Юлия З.', '+7 (916) 204-18-41',
     'yulia@example.com', 'Маникюр с покрытием, спокойный нюдовый оттенок.',
     ((current_date + time '11:00') at time zone 'Europe/Moscow')::timestamptz, 'confirmed'::public.booking_status),
    ('maria', 'combined-cleansing', 'WBC-1042', 'Анна К.', '+7 (925) 771-30-12',
     null, null,
     ((current_date + time '13:30') at time zone 'Europe/Moscow')::timestamptz, 'pending'::public.booking_status),
    ('maria', 'face-massage', 'WBC-1043', 'Мария Л.', '+7 (903) 118-42-90',
     null, 'Чувствительная кожа.',
     ((current_date + time '16:00') at time zone 'Europe/Moscow')::timestamptz, 'confirmed'::public.booking_status),
    ('nadezhda', 'brow-architecture', 'WBC-1044', 'Ольга В.', '+7 (926) 540-09-77',
     null, null,
     ((current_date + time '18:30') at time zone 'Europe/Moscow')::timestamptz, 'pending'::public.booking_status)
)
insert into public.bookings
  (reference, master_id, service_id, customer_name, customer_phone, customer_email,
   notes, start_time, end_time, status)
select
  demo.reference, m.id, s.id, demo.customer_name, demo.customer_phone,
  demo.customer_email, demo.notes, demo.start_time,
  demo.start_time + interval '1 hour', demo.status
from demo
join public.masters m on m.slug = demo.master_slug
join public.services s on s.slug = demo.service_slug
on conflict (reference) do nothing;

insert into public.slot_blocks (master_id, start_time, end_time, reason)
select m.id,
       ((current_date + time '15:00') at time zone 'Europe/Moscow')::timestamptz,
       ((current_date + time '17:00') at time zone 'Europe/Moscow')::timestamptz,
       'Личное время'
from public.masters m
where m.slug = 'elvina'
on conflict (master_id, start_time) do nothing;

commit;
