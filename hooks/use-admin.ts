"use client";

import {
  keepPreviousData,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type {
  ApiBooking,
  ApiMaster,
  ApiScheduleDay,
  MasterScheduleResponse,
  SlotsResponse,
} from "@/lib/types";

export type BookingFilters = {
  status?: string;
  date?: string;
  q?: string;
};

export function useAdminBookings(filters: BookingFilters) {
  return useQuery({
    queryKey: ["admin-bookings", filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.date) params.set("date", filters.date);
      if (filters.q) params.set("q", filters.q);
      return apiFetch<ApiBooking[]>(`/api/admin/bookings?${params.toString()}`);
    },
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiFetch<ApiBooking>(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-slots"] });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
  });
}

export function useAdminSlots(masterId: string | null, date: string | null) {
  return useQuery({
    queryKey: ["admin-slots", masterId, date],
    queryFn: () =>
      apiFetch<SlotsResponse>(
        `/api/admin/slots?masterId=${masterId}&date=${date}`,
      ),
    enabled: Boolean(masterId && date),
    refetchInterval: 30_000,
    placeholderData: keepPreviousData,
  });
}

/** Parallel availability queries for the owner's week grid. */
export function useAdminWeekSlots(masterId: string | null, dates: string[]) {
  return useQueries({
    queries: dates.map((date) => ({
      queryKey: ["admin-slots", masterId, date],
      queryFn: () =>
        apiFetch<SlotsResponse>(
          `/api/admin/slots?masterId=${masterId}&date=${date}`,
        ),
      enabled: Boolean(masterId && date),
      refetchInterval: 30_000,
      staleTime: 10_000,
    })),
  });
}

export function useToggleSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      masterId: string;
      date: string;
      time: string;
      occupied: boolean;
    }) =>
      apiFetch<{ ok: boolean; occupied: boolean }>("/api/admin/slots", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      // Prefix match refreshes both the day grid and every week-grid cell.
      queryClient.invalidateQueries({ queryKey: ["admin-slots"] });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
  });
}

export function useMasterSchedule(masterId: string | null) {
  return useQuery({
    queryKey: ["master-schedule", masterId],
    queryFn: () =>
      apiFetch<MasterScheduleResponse>(
        `/api/admin/schedules?masterId=${masterId}`,
      ),
    enabled: Boolean(masterId),
  });
}

export function useSaveMasterSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      masterId,
      days,
    }: {
      masterId: string;
      days: ApiScheduleDay[];
    }) =>
      apiFetch<MasterScheduleResponse>("/api/admin/schedules", {
        method: "PUT",
        body: JSON.stringify({ masterId, days }),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["master-schedule", variables.masterId],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-slots"] });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
  });
}

export function useAdminMasters() {
  return useQuery({
    queryKey: ["admin-masters"],
    queryFn: () => apiFetch<ApiMaster[]>("/api/admin/masters"),
    refetchInterval: 60_000,
  });
}

export type MasterPayload = {
  name: string;
  specialty: string;
  bio: string;
  photoUrl: string;
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  serviceIds: string[];
  isActive: boolean;
};

export function useSaveMaster() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: MasterPayload }) =>
      apiFetch<ApiMaster>(id ? `/api/admin/masters/${id}` : "/api/admin/masters", {
        method: id ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-masters"] });
    },
  });
}

export function useArchiveMaster() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      if (active) {
        return apiFetch<ApiMaster>(`/api/admin/masters/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ isActive: true }),
        });
      }
      return apiFetch<ApiMaster>(`/api/admin/masters/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-masters"] });
    },
  });
}
