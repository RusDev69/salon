export const BRAND = {
  name: "WORLD BEAUTY CLUB",
  shortName: "WBC",
  fullName: "World Beauty Club",
  tagline: "Красота без границ",
  phone: "+7 (925) 318-32-10",
  phoneHref: "tel:+79253183210",
  address: "Москва, Варшавское шоссе, 122А",
  addressShort: "Варшавское шоссе, 122А",
  hours: "Ежедневно, 10:00–22:00",
  telegram: "https://t.me/+79253183210",
  whatsapp: "https://wa.me/79253183210",
  vk: "https://vk.ru/worldbeautyclub",
  mapUrl: "https://yandex.ru/maps/org/98135813149",
  email: "owner@worldbeautyclub.ru",
  legalName: "ИП Ерофеева Светлана Михайловна",
  rating: 5.0,
  reviewCount: 389,
  serviceCount: 169,
  founded: 2018,
};

export const NAV_LINKS = [
  { href: "/#services", label: "Каталог" },
  { href: "/#masters", label: "Мастера" },
  { href: "/#philosophy", label: "О нас" },
  { href: "/#reviews", label: "Отзывы" },
  { href: "/#contacts", label: "Контакты" },
];

export const SERVICE_CATEGORIES = [
  { value: "ALL", label: "Все услуги" },
  { value: "HAIR", label: "Волосы" },
  { value: "NAILS", label: "Ногти" },
  { value: "SKIN", label: "Косметология" },
  { value: "BROWS", label: "Брови и ресницы" },
  { value: "MAKEUP", label: "Перманентный макияж" },
  { value: "LASER", label: "Лазерная эпиляция" },
  { value: "PODOLOGY", label: "Подология" },
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number]["value"];

export const BOOKING_STATUSES = [
  { value: "PENDING", label: "Ожидает" },
  { value: "CONFIRMED", label: "Подтверждена" },
  { value: "COMPLETED", label: "Завершена" },
  { value: "CANCELLED", label: "Отменена" },
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number]["value"];

export const STATUS_STYLES: Record<
  BookingStatus,
  { label: string; className: string; dot: string }
> = {
  PENDING: {
    label: "Ожидает",
    className: "bg-amber-50 text-amber-800 border-amber-200/70",
    dot: "bg-amber-500",
  },
  CONFIRMED: {
    label: "Подтверждена",
    className: "bg-emerald-50 text-emerald-800 border-emerald-200/70",
    dot: "bg-emerald-500",
  },
  COMPLETED: {
    label: "Завершена",
    className: "bg-stone-100 text-stone-700 border-stone-200",
    dot: "bg-stone-500",
  },
  CANCELLED: {
    label: "Отменена",
    className: "bg-rose-50 text-rose-700 border-rose-200/80",
    dot: "bg-rose-400",
  },
};

export const MASTER_PHOTOS = [
  "/images/wbc/master-1.svg",
  "/images/wbc/master-2.svg",
  "/images/wbc/master-3.svg",
];

export const TESTIMONIALS = [
  {
    name: "Юля З.",
    service: "Маникюр + гель-лак · Эльвина",
    text: "Отличный салон и мастер Эльвина. Сделали всё чётко по времени, без спешки. Форма идеальная, покрытие ровное, без затеков. Во время процедуры сделали увлажняющий спа-уход для рук — очень приятно.",
    rating: 5,
  },
  {
    name: "Jim L.",
    service: "Косметология · Мария",
    text: "Прекрасное впечатление. Я была у Марии-косметолога — всем довольна, хожу постоянно, спасибо!",
    rating: 5,
  },
  {
    name: "Варвара",
    service: "Мастер Надежда · косметолог Мария",
    text: "Огромное спасибо мастеру Надежде и косметологу Марии, очень профессиональный подход и приятное общение, придём ещё, спасибо.",
    rating: 5,
  },
  {
    name: "платон",
    service: "World Beauty Club",
    text: "Крутой салон.",
    rating: 5,
  },
] as const;
