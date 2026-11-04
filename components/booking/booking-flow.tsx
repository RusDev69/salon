"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BookingStepper } from "@/components/booking/booking-stepper";
import { BookingSummary } from "@/components/booking/booking-summary";
import { StepDetails } from "@/components/booking/step-details";
import { StepMaster } from "@/components/booking/step-master";
import { StepSchedule } from "@/components/booking/step-schedule";
import { StepService } from "@/components/booking/step-service";
import { useCreateBooking } from "@/hooks/use-booking";
import { ApiError } from "@/lib/api";
import type { ApiMaster, ApiService } from "@/lib/types";
import type { BookingDetailsValues } from "@/lib/validators";
import {
  useBookingStore,
  type BookingStep,
} from "@/store/booking-store";

const slide = {
  initial: { opacity: 0, x: 18 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -18 },
};

export function BookingFlow({
  services,
  masters,
  initialServiceSlug,
  initialMasterSlug,
}: {
  services: ApiService[];
  masters: ApiMaster[];
  initialServiceSlug?: string;
  initialMasterSlug?: string;
}) {
  const reduce = useReducedMotion();
  const router = useRouter();
  const queryClient = useQueryClient();
  const initialized = useRef(false);
  const previousStep = useRef<BookingStep>(1);

  const {
    step,
    serviceId,
    masterId,
    date,
    time,
    customerName,
    customerPhone,
    customerEmail,
    notes,
    setService,
    setMaster,
    setDate,
    setTime,
    setContact,
    goTo,
    next,
    back,
    reset,
  } = useBookingStore();

  const service = services.find((item) => item.id === serviceId) ?? null;
  const master = masters.find((item) => item.id === masterId) ?? null;
  const availableMasters = service
    ? masters.filter((item) => item.serviceIds.includes(service.id))
    : masters;

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const presetService = initialServiceSlug
      ? services.find((item) => item.slug === initialServiceSlug)
      : null;
    const presetMaster = initialMasterSlug
      ? masters.find((item) => item.slug === initialMasterSlug)
      : null;

    reset();

    if (presetService) {
      useBookingStore.setState({
        serviceId: presetService.id,
        step: 2,
      });
    }

    if (presetMaster) {
      const validForService =
        !presetService || presetMaster.serviceIds.includes(presetService.id);
      if (validForService) {
        useBookingStore.setState({
          masterId: presetMaster.id,
          step: presetService ? 3 : 1,
        });
      }
    }
  }, [initialMasterSlug, initialServiceSlug, masters, reset, services]);

  useEffect(() => {
    if (previousStep.current !== step) {
      previousStep.current = step;
      if (step > 1) {
        document
          .getElementById("booking-flow")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [step]);

  const mutation = useCreateBooking();

  function canNavigate(target: BookingStep) {
    if (target === 1) return true;
    if (target === 2) return Boolean(service);
    if (target === 3) return Boolean(service && master);
    return Boolean(service && master && date && time);
  }

  function handleService(id: string) {
    setService(id);
    const nextMaster = masters.find((item) => item.id === masterId);
    if (nextMaster && !nextMaster.serviceIds.includes(id)) {
      useBookingStore.setState({ masterId: null });
    }
  }

  function handleMaster(id: string) {
    setMaster(id);
  }

  function handleNavigate(target: BookingStep) {
    if (canNavigate(target)) goTo(target);
  }

  function handleConfirm(details?: BookingDetailsValues) {
    if (!service || !master || !date || !time) return;

    mutation.mutate(
      {
        serviceId: service.id,
        masterId: master.id,
        date,
        time,
        customerName: details?.customerName ?? customerName,
        customerPhone: details?.customerPhone ?? customerPhone,
        customerEmail: details?.customerEmail ?? customerEmail,
        notes: details?.notes ?? notes,
      },
      {
        onSuccess: (booking) => {
          // The success screen is a separate route. sessionStorage keeps the
          // details off the URL (no guest data in analytics/referrers) while
          // still allowing an instant client-side transition.
          try {
            sessionStorage.setItem("wbc:last-booking", JSON.stringify(booking));
          } catch {
            // Private mode / storage disabled: the success page shows a
            // graceful fallback with the reference number.
          }
          queryClient.invalidateQueries({ queryKey: ["availability"] });
          toast.success("Запись создана — ждём вас в World Beauty Club");
          router.replace(
            `/booking/success?ref=${encodeURIComponent(booking.reference)}`,
          );
        },
        onError: (error) => {
          if (error instanceof ApiError && error.status === 409) {
            setTime(null);
            goTo(3);
            queryClient.invalidateQueries({ queryKey: ["availability"] });
            toast.error("Это время только что заняли. Выберите другой слот.");
          } else {
            toast.error(error.message);
          }
        },
      },
    );
  }

  return (
    <div id="booking-flow" className="container-wide scroll-mt-24 pb-20">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_390px]">
        <div>
          <BookingStepper
            current={step}
            canNavigate={canNavigate}
            onNavigate={handleNavigate}
          />

          <div className="mt-4 rounded-[32px] border border-white/70 bg-ivory/85 p-5 shadow-soft backdrop-blur-md sm:p-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                variants={reduce ? undefined : slide}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {step === 1 && (
                  <StepService
                    services={services}
                    selected={serviceId}
                    onSelect={handleService}
                    onContinue={() => serviceId && next()}
                  />
                )}

                {step === 2 && service && (
                  <StepMaster
                    service={service}
                    masters={availableMasters}
                    selected={masterId}
                    onSelect={handleMaster}
                    onBack={back}
                    onContinue={() => masterId && next()}
                  />
                )}

                {step === 3 && service && master && (
                  <StepSchedule
                    service={service}
                    master={master}
                    date={date}
                    time={time}
                    onDate={setDate}
                    onTime={setTime}
                    onBack={back}
                    onContinue={() => date && time && next()}
                  />
                )}

                {step === 4 && service && master && date && time && (
                  <StepDetails
                    service={service}
                    master={master}
                    date={date}
                    time={time}
                    customerName={customerName}
                    customerPhone={customerPhone}
                    customerEmail={customerEmail}
                    notes={notes}
                    setContact={setContact}
                    onBack={back}
                    onSubmit={handleConfirm}
                    isPending={mutation.isPending}
                    error={mutation.error?.message ?? null}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <BookingSummary
          step={step}
          service={service}
          master={master}
          date={date}
          time={time}
          onChangeStep={handleNavigate}
        />
      </div>
    </div>
  );
}
