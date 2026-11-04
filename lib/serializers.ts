import type { ApiBooking, ApiMaster, ApiService } from "@/lib/types";

type ServiceRecord = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  durationMin: number;
  price: number;
  isActive?: boolean;
  sortOrder?: number;
};

type MasterRecord = {
  id: string;
  slug: string;
  name: string;
  specialty: string;
  bio: string;
  photoUrl: string;
  rating: number;
  reviewsCount: number;
  experienceYears: number;
  isActive?: boolean;
  sortOrder?: number;
  services?: { serviceId: string }[];
};

type BookingRecord = {
  id: string;
  reference: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  notes: string | null;
  startsAt: Date;
  endsAt: Date;
  status: string;
  serviceId: string;
  masterId: string;
  createdAt: Date;
  service: ServiceRecord;
  master: MasterRecord;
};

export function serializeService(service: ServiceRecord): ApiService {
  return {
    id: service.id,
    slug: service.slug,
    name: service.name,
    description: service.description,
    category: service.category,
    durationMin: service.durationMin,
    price: service.price,
    isActive: service.isActive,
    sortOrder: service.sortOrder,
  };
}

export function serializeMaster(master: MasterRecord): ApiMaster {
  return {
    id: master.id,
    slug: master.slug,
    name: master.name,
    specialty: master.specialty,
    bio: master.bio,
    photoUrl: master.photoUrl,
    rating: master.rating,
    reviewsCount: master.reviewsCount,
    experienceYears: master.experienceYears,
    isActive: master.isActive,
    sortOrder: master.sortOrder,
    serviceIds: master.services?.map((item) => item.serviceId) ?? [],
  };
}

export function serializeBooking(booking: BookingRecord): ApiBooking {
  return {
    id: booking.id,
    reference: booking.reference,
    customerName: booking.customerName,
    customerPhone: booking.customerPhone,
    customerEmail: booking.customerEmail,
    notes: booking.notes,
    startsAt: booking.startsAt.toISOString(),
    endsAt: booking.endsAt.toISOString(),
    status: booking.status as ApiBooking["status"],
    serviceId: booking.serviceId,
    masterId: booking.masterId,
    createdAt: booking.createdAt.toISOString(),
    service: serializeService(booking.service),
    master: serializeMaster(booking.master),
  };
}
