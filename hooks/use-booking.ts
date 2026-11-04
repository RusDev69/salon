"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { ApiBooking, AvailabilityResponse } from "@/lib/types";

export function useAvailability(params: {
  masterId: string | null;
  serviceId: string | null;
  date: string | null;
}) {
  const { masterId, serviceId, date } = params;

  return useQuery({
    queryKey: ["availability", masterId, serviceId, date],
    queryFn: () =>
      apiFetch<AvailabilityResponse>(
        `/api/availability?masterId=${masterId}&serviceId=${serviceId}&date=${date}`,
      ),
    enabled: Boolean(masterId && serviceId && date),
    refetchInterval: 15_000,
    staleTime: 5_000,
    retry: 1,
  });
}

export type BookingPayload = {
  serviceId: string;
  masterId: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
};

export function useCreateBooking() {
  return useMutation({
    mutationFn: (payload: BookingPayload) =>
      apiFetch<ApiBooking>("/api/bookings", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });
}
