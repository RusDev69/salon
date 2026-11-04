import { z } from "zod";
import { BOOKING_STATUSES } from "@/lib/constants";
import { normalizePhone } from "@/lib/utils";

export const bookingDetailsSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Как к вам обращаться?")
    .max(80, "Слишком длинное имя"),
  customerPhone: z
    .string()
    .min(1, "Укажите телефон")
    .refine(
      (value) => normalizePhone(value).length === 11,
      "Введите номер полностью",
    ),
  customerEmail: z
    .union([z.literal(""), z.string().email("Проверьте адрес электронной почты")])
    .optional(),
  notes: z.string().max(600, "Слишком длинный комментарий").optional(),
  consent: z
    .boolean()
    .refine(Boolean, "Нужно согласие на обработку персональных данных"),
});

export type BookingDetailsValues = z.infer<typeof bookingDetailsSchema>;

export const loginSchema = z.object({
  email: z.string().email("Проверьте email"),
  password: z.string().min(4, "Введите пароль"),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const bookingRequestSchema = z.object({
  serviceId: z.string().min(1),
  masterId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  customerName: z.string().min(2, "Укажите имя").max(80),
  customerPhone: z.string().min(10, "Укажите телефон").max(30),
  customerEmail: z
    .union([z.string().email("Проверьте email"), z.literal("")])
    .optional(),
  notes: z.string().max(600).optional(),
});

export const bookingStatusSchema = z.object({
  status: z.enum(
    BOOKING_STATUSES.map((status) => status.value) as [
      "PENDING",
      "CONFIRMED",
      "COMPLETED",
      "CANCELLED",
    ],
  ),
});

export const slotToggleSchema = z.object({
  masterId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  occupied: z.boolean(),
});

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Укажите время в формате ЧЧ:ММ");

export const masterScheduleUpdateSchema = z
  .object({
    masterId: z.string().min(1),
    days: z
      .array(
        z.object({
          dayOfWeek: z.number().int().min(1).max(7),
          startTime: timeSchema,
          endTime: timeSchema,
          isActive: z.boolean(),
        }),
      )
      .length(7, "Нужно передать все семь дней"),
  })
  .superRefine((value, ctx) => {
    const seen = new Set<number>();
    for (const day of value.days) {
      if (seen.has(day.dayOfWeek)) {
        ctx.addIssue({
          code: "custom",
          message: "День недели указан дважды",
          path: ["days"],
        });
      }
      seen.add(day.dayOfWeek);

      if (day.isActive && day.startTime >= day.endTime) {
        ctx.addIssue({
          code: "custom",
          message: "Начало смены должно быть раньше окончания",
          path: ["days"],
        });
      }
    }
  });

export const masterInputSchema = z.object({
  name: z.string().min(2, "Укажите имя").max(80),
  specialty: z.string().min(2, "Укажите специализацию").max(80),
  bio: z.string().max(600).default(""),
  photoUrl: z.string().min(1).max(300),
  experienceYears: z.coerce.number().int().min(1).max(60),
  rating: z.coerce.number().min(0).max(5).default(5),
  reviewsCount: z.coerce.number().int().min(0).default(0),
  serviceIds: z.array(z.string()).min(1, "Выберите хотя бы одну услугу"),
  isActive: z.boolean().default(true),
});
