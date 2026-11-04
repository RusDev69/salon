import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import "dotenv/config";

const prisma = new PrismaClient();
const TZ = "Europe/Moscow";

const today = formatInTimeZone(new Date(), TZ, "yyyy-MM-dd");
const tomorrow = formatInTimeZone(addDays(new Date(), 1), TZ, "yyyy-MM-dd");
const yesterday = formatInTimeZone(addDays(new Date(), -1), TZ, "yyyy-MM-dd");

function at(date: string, time: string) {
  return fromZonedTime(`${date}T${time}:00`, TZ);
}

function ref(seed: string) {
  return `WBC-${seed}`;
}

async function main() {
  await prisma.booking.deleteMany();
  await prisma.slotBlock.deleteMany();
  await prisma.masterSchedule.deleteMany();
  await prisma.masterService.deleteMany();
  await prisma.service.deleteMany();
  await prisma.master.deleteMany();
  await prisma.telegramSubscriber.deleteMany();

  const ownerPassword = await bcrypt.hash("WBC2026!", 10);
  await prisma.user.upsert({
    where: { email: "owner@worldbeautyclub.ru" },
    update: {
      passwordHash: ownerPassword,
      name: "Светлана Ерофеева",
      role: "OWNER",
    },
    create: {
      email: "owner@worldbeautyclub.ru",
      name: "Светлана Ерофеева",
      passwordHash: ownerPassword,
      role: "OWNER",
    },
  });

  const servicesData = [
    {
      slug: "manicure-gel",
      name: "Маникюр + покрытие гель-лак",
      description:
        "Комбинированный маникюр, укрепление и покрытие гель-лаком в один тон. Средний сегмент EMI, UNO, COSMO или премиум LUXIO.",
      category: "NAILS",
      durationMin: 90,
      price: 2600,
      sortOrder: 1,
    },
    {
      slug: "spa-manicure",
      name: "SPA-маникюр без покрытия",
      description:
        "Гигиенический маникюр с уходом Nogturne Professional и Spa System: очищение, питание и глубокое увлажнение кожи рук.",
      category: "NAILS",
      durationMin: 75,
      price: 1800,
      sortOrder: 2,
    },
    {
      slug: "smart-pedicure",
      name: "SMART-педикюр женский",
      description:
        "Обработка стоп по технологии SMART: удаление ороговевшей кожи и натоптышей, аккуратная работа с ногтевой пластиной.",
      category: "PODOLOGY",
      durationMin: 90,
      price: 2500,
      sortOrder: 3,
    },
    {
      slug: "nail-extension",
      name: "Наращивание ногтей",
      description:
        "Моделирование длины и формы с укреплением. Подбираем архитектуру, которая подходит вашим натуральным ногтям.",
      category: "NAILS",
      durationMin: 150,
      price: 4000,
      sortOrder: 4,
    },
    {
      slug: "women-haircut",
      name: "Женская стрижка",
      description:
        "Стрижка с учётом структуры волос, формы лица и вашего образа жизни. Мытьё и укладка включены.",
      category: "HAIR",
      durationMin: 60,
      price: 2000,
      sortOrder: 5,
    },
    {
      slug: "men-haircut",
      name: "Мужская модельная стрижка",
      description:
        "Точная форма, работа с текстурами и укладка. Подходит для классических и современных образов.",
      category: "HAIR",
      durationMin: 45,
      price: 1500,
      sortOrder: 6,
    },
    {
      slug: "haircut-spa",
      name: "Стрижка + японский SPA-массаж головы",
      description:
        "Модельная стрижка, питательный уход и расслабляющий массаж кожи головы. Волосы выглядят ухоженными, а вы — отдохнувшими.",
      category: "HAIR",
      durationMin: 90,
      price: 4000,
      sortOrder: 7,
    },
    {
      slug: "promo-hair",
      name: "Акция: стрижка + уход для кожи головы и волос",
      description:
        "Модельная стрижка, пилинг и массаж кожи головы, питательный уход по типу волос. Фиксированная цена на любую длину — 3 950 ₽ вместо 6 000 ₽.",
      category: "HAIR",
      durationMin: 90,
      price: 3950,
      sortOrder: 8,
    },
    {
      slug: "coloring-roots",
      name: "Окрашивание корней",
      description:
        "Освежение цвета у корней с деликатным уходом. Подбираем оттенок под ваш текущий цвет и образ.",
      category: "HAIR",
      durationMin: 90,
      price: 3500,
      sortOrder: 9,
    },
    {
      slug: "airtouch",
      name: "Окрашивание air-touch",
      description:
        "Мягкое растяжение цвета без резких границ. Техника для естественного блонда, света и объёма.",
      category: "HAIR",
      durationMin: 180,
      price: 12000,
      sortOrder: 10,
    },
    {
      slug: "complex-coloring",
      name: "Сложное окрашивание",
      description:
        "Мелирование, шатуш, омбре или балаяж. Многоэтапная работа с цветом и уходом для стойкого результата.",
      category: "HAIR",
      durationMin: 180,
      price: 6000,
      sortOrder: 11,
    },
    {
      slug: "lebel-absolute",
      name: "Lebel «Абсолютное счастье для волос»",
      description:
        "Японская многоэтапная SPA-программа для восстановления волос и кожи головы: увлажнение, плотность и эластичность.",
      category: "HAIR",
      durationMin: 90,
      price: 5500,
      sortOrder: 12,
    },
    {
      slug: "combined-cleansing",
      name: "Комбинированная чистка лица",
      description:
        "Глубокое очищение с учётом состояния кожи: поры, текстура и ровный тон. Завершаем успокаивающим уходом.",
      category: "SKIN",
      durationMin: 90,
      price: 4000,
      sortOrder: 13,
    },
    {
      slug: "face-massage",
      name: "Массаж лица 50 минут",
      description:
        "Скульптурный, буккальный или миофасциальный массаж — подбираем технику под задачу вашей кожи.",
      category: "SKIN",
      durationMin: 50,
      price: 4000,
      sortOrder: 14,
    },
    {
      slug: "peach-peel",
      name: "Peach Peel. Гидролипидный пилинг",
      description:
        "Деликатное обновление кожи: мягко снимает ороговевший слой, выравнивает тон и возвращает сияние.",
      category: "SKIN",
      durationMin: 60,
      price: 4500,
      sortOrder: 15,
    },
    {
      slug: "brow-architecture",
      name: "Архитектура бровей",
      description:
        "Форма по вашим чертам лица, коррекция и окрашивание. Естественный результат без перегруженности.",
      category: "BROWS",
      durationMin: 45,
      price: 1900,
      sortOrder: 16,
    },
    {
      slug: "brow-lamination",
      name: "Ламинирование бровей + архитектура",
      description:
        "Долговременная укладка бровей, коррекция формы и окрашивание. Брови выглядят гуще и ухоженнее.",
      category: "BROWS",
      durationMin: 60,
      price: 3000,
      sortOrder: 17,
    },
    {
      slug: "lash-lamination",
      name: "Ламинирование ресниц + ботокс",
      description:
        "Изгиб, питание и укрепление ресниц. Эффект распахнутого взгляда без наращивания.",
      category: "BROWS",
      durationMin: 90,
      price: 4500,
      sortOrder: 18,
    },
    {
      slug: "permanent-brows",
      name: "Перманентный макияж бровей",
      description:
        "Максимально натуральный эффект: форма и мягкий оттенок, который сохраняется до года и постепенно светлеет.",
      category: "MAKEUP",
      durationMin: 120,
      price: 12000,
      sortOrder: 19,
    },
    {
      slug: "permanent-lips",
      name: "Перманентный макияж губ",
      description:
        "Деликатный оттенок, красивая форма и визуально более свежие, ухоженные губы. Максимально натуральный результат.",
      category: "MAKEUP",
      durationMin: 120,
      price: 12000,
      sortOrder: 20,
    },
    {
      slug: "laser-bikini",
      name: "Лазерная эпиляция: глубокое бикини",
      description:
        "Комфортная процедура на современном оборудовании. Курс и интервалы подбирает специалист после консультации.",
      category: "LASER",
      durationMin: 45,
      price: 3500,
      sortOrder: 21,
    },
    {
      slug: "laser-legs",
      name: "Лазерная эпиляция: ноги полностью",
      description:
        "Обработка ног полностью с индивидуальным подбором параметров и деликатным охлаждением кожи.",
      category: "LASER",
      durationMin: 60,
      price: 3960,
      sortOrder: 22,
    },
    {
      slug: "laser-complex",
      name: "Лазерная эпиляция: комплекс №2",
      description:
        "Бикини + подмышки + голени. Практичный комплекс для регулярного ухода без лишних визитов.",
      category: "LASER",
      durationMin: 75,
      price: 5100,
      sortOrder: 23,
    },
    {
      slug: "podology-pedicure",
      name: "Подологический педикюр",
      description:
        "Комплексная процедура для здоровья стоп и ногтей. Работа с проблемными зонами специалистом с медицинским образованием.",
      category: "PODOLOGY",
      durationMin: 90,
      price: 4000,
      sortOrder: 24,
    },
  ];

  const services = await Promise.all(
    servicesData.map((data) => prisma.service.create({ data })),
  );
  const s = Object.fromEntries(services.map((service) => [service.slug, service]));

  const mastersData = [
    {
      slug: "elvina",
      name: "Эльвина",
      specialty: "Nail-мастер · подолог",
      bio: "Мастер маникюра и педикюра, которую гости отмечают за аккуратность и внимательное отношение. Работает с укреплением, моделированием и уходом за стопами.",
      photoUrl: "/images/wbc/master-1.svg",
      rating: 5,
      reviewsCount: 96,
      experienceYears: 6,
      sortOrder: 1,
      serviceSlugs: [
        "manicure-gel",
        "spa-manicure",
        "smart-pedicure",
        "nail-extension",
        "podology-pedicure",
      ],
    },
    {
      slug: "maria",
      name: "Мария",
      specialty: "Косметолог-эстетист",
      bio: "Косметолог World Beauty Club. Подбирает уход по состоянию кожи, работает с чистками, пилингами, массажем лица и лазерными протоколами.",
      photoUrl: "/images/wbc/master-2.svg",
      rating: 5,
      reviewsCount: 124,
      experienceYears: 8,
      sortOrder: 2,
      serviceSlugs: [
        "combined-cleansing",
        "face-massage",
        "peach-peel",
        "permanent-brows",
        "permanent-lips",
        "laser-bikini",
        "laser-legs",
        "laser-complex",
      ],
    },
    {
      slug: "nadezhda",
      name: "Надежда",
      specialty: "Стилист-колорист",
      bio: "Стилист и колорист с опытом более 10 лет. Создаёт стрижки и цвет, которые легко повторить дома, и бережно относится к структуре волос.",
      photoUrl: "/images/wbc/master-3.svg",
      rating: 5,
      reviewsCount: 169,
      experienceYears: 10,
      sortOrder: 3,
      serviceSlugs: [
        "women-haircut",
        "men-haircut",
        "haircut-spa",
        "promo-hair",
        "coloring-roots",
        "airtouch",
        "complex-coloring",
        "lebel-absolute",
        "brow-architecture",
        "brow-lamination",
        "lash-lamination",
      ],
    },
  ];

  const masters: Record<string, { id: string }> = {};
  for (const data of mastersData) {
    const { serviceSlugs, ...master } = data;
    const created = await prisma.master.create({
      data: {
        ...master,
        services: {
          create: serviceSlugs.map((slug) => ({ serviceId: s[slug].id })),
        },
      },
    });
    masters[data.slug] = created;
  }

  // World Beauty Club работает каждый день 10:00–22:00.
  await prisma.masterSchedule.createMany({
    data: Object.values(masters).flatMap((master) =>
      [1, 2, 3, 4, 5, 6, 7].map((dayOfWeek) => ({
        masterId: master.id,
        dayOfWeek,
        startTime: new Date("1970-01-01T10:00:00.000Z"),
        endTime: new Date("1970-01-01T22:00:00.000Z"),
        isActive: true,
      })),
    ),
  });

  await prisma.booking.createMany({
    data: [
      {
        reference: ref("1041"),
        customerName: "Юлия З.",
        customerPhone: "+7 (916) 204-18-41",
        customerEmail: "yulia@example.com",
        notes: "Маникюр с покрытием, спокойный нюдовый оттенок.",
        startsAt: at(today, "11:00"),
        endsAt: at(today, "12:30"),
        status: "CONFIRMED",
        serviceId: s["manicure-gel"].id,
        masterId: masters["elvina"].id,
      },
      {
        reference: ref("1042"),
        customerName: "Анна К.",
        customerPhone: "+7 (925) 771-30-12",
        startsAt: at(today, "13:30"),
        endsAt: at(today, "15:00"),
        status: "PENDING",
        serviceId: s["combined-cleansing"].id,
        masterId: masters["maria"].id,
      },
      {
        reference: ref("1043"),
        customerName: "Мария Л.",
        customerPhone: "+7 (903) 118-42-90",
        notes: "Чувствительная кожа.",
        startsAt: at(today, "16:00"),
        endsAt: at(today, "17:00"),
        status: "CONFIRMED",
        serviceId: s["face-massage"].id,
        masterId: masters["maria"].id,
      },
      {
        reference: ref("1044"),
        customerName: "Ольга В.",
        customerPhone: "+7 (926) 540-09-77",
        startsAt: at(today, "18:30"),
        endsAt: at(today, "19:30"),
        status: "PENDING",
        serviceId: s["brow-architecture"].id,
        masterId: masters["nadezhda"].id,
      },
      {
        reference: ref("1045"),
        customerName: "Ксения Р.",
        customerPhone: "+7 (915) 333-81-20",
        startsAt: at(tomorrow, "12:00"),
        endsAt: at(tomorrow, "13:00"),
        status: "CONFIRMED",
        serviceId: s["women-haircut"].id,
        masterId: masters["nadezhda"].id,
      },
      {
        reference: ref("1039"),
        customerName: "Ирина Т.",
        customerPhone: "+7 (977) 890-11-05",
        startsAt: at(yesterday, "15:00"),
        endsAt: at(yesterday, "16:30"),
        status: "COMPLETED",
        serviceId: s["podology-pedicure"].id,
        masterId: masters["elvina"].id,
      },
    ],
  });

  await prisma.slotBlock.createMany({
    data: [
      {
        masterId: masters["elvina"].id,
        startsAt: at(today, "15:00"),
        endsAt: at(today, "17:00"),
        reason: "Личное время",
      },
      {
        masterId: masters["maria"].id,
        startsAt: at(tomorrow, "16:00"),
        endsAt: at(tomorrow, "17:30"),
        reason: "Обучение",
      },
    ],
  });

  console.log("Seed complete");
  console.log("Owner login: owner@worldbeautyclub.ru / WBC2026!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
