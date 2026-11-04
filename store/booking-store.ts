import { create } from "zustand";

export type BookingStep = 1 | 2 | 3 | 4;

type BookingState = {
  step: BookingStep;
  serviceId: string | null;
  masterId: string | null;
  date: string | null;
  time: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes: string;
  setService: (serviceId: string) => void;
  setMaster: (masterId: string) => void;
  setDate: (date: string | null) => void;
  setTime: (time: string | null) => void;
  setContact: (field: "customerName" | "customerPhone" | "customerEmail" | "notes", value: string) => void;
  goTo: (step: BookingStep) => void;
  next: () => void;
  back: () => void;
  reset: () => void;
  preselect: (ids: { serviceId?: string; masterId?: string }) => void;
};

const initial = {
  step: 1 as BookingStep,
  serviceId: null,
  masterId: null,
  date: null,
  time: null,
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  notes: "",
};

export const useBookingStore = create<BookingState>((set) => ({
  ...initial,
  setService: (serviceId) =>
    set((state) => ({
      serviceId,
      masterId: state.masterId,
      date: null,
      time: null,
    })),
  setMaster: (masterId) =>
    set({ masterId, date: null, time: null }),
  setDate: (date) => set({ date, time: null }),
  setTime: (time) => set({ time }),
  setContact: (field, value) => set({ [field]: value }),
  goTo: (step) => set({ step }),
  next: () =>
    set((state) => ({
      step: Math.min(state.step + 1, 4) as BookingStep,
    })),
  back: () =>
    set((state) => ({
      step: Math.max(state.step - 1, 1) as BookingStep,
    })),
  reset: () => set({ ...initial }),
  preselect: (ids) =>
    set((state) => ({
      serviceId: ids.serviceId ?? state.serviceId,
      masterId: ids.masterId ?? state.masterId,
      step: 1,
    })),
}));
