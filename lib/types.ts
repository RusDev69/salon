export type ApiService = {
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

export type ApiMaster = {
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
  serviceIds: string[];
};

export type ApiBooking = {
  id: string;
  reference: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  notes: string | null;
  startsAt: string;
  endsAt: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  serviceId: string;
  masterId: string;
  createdAt: string;
  service: ApiService;
  master: ApiMaster;
};

export type AvailabilityResponse = {
  date: string;
  masterId: string;
  serviceId: string;
  slots: string[];
  closed: boolean;
  fetchedAt: string;
};

export type AdminSlotState =
  | "AVAILABLE"
  | "BOOKED"
  | "BLOCKED"
  | "PAST"
  | "CLOSED";

export type AdminSlot = {
  time: string;
  state: AdminSlotState;
  bookingId?: string;
  customerName?: string;
  serviceName?: string;
  blockId?: string;
  blockReason?: string | null;
};

export type SlotsResponse = {
  date: string;
  masterId: string;
  slots: AdminSlot[];
};

export type ApiScheduleDay = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

export type MasterScheduleResponse = {
  masterId: string;
  days: ApiScheduleDay[];
};

export type AdminStats = {
  todayCount: number;
  pendingCount: number;
  weekRevenue: number;
  occupancy: number;
  totalBookings: number;
};
