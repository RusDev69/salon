"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Archive,
  ArrowUpRight,
  Award,
  Check,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Star,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useAdminMasters,
  useArchiveMaster,
  useSaveMaster,
  type MasterPayload,
} from "@/hooks/use-admin";
import { MASTER_PHOTOS, SERVICE_CATEGORIES } from "@/lib/constants";
import type { ApiMaster, ApiService } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";

const EMPTY: MasterPayload = {
  name: "",
  specialty: "",
  bio: "",
  photoUrl: MASTER_PHOTOS[0],
  experienceYears: 5,
  rating: 5,
  reviewsCount: 0,
  serviceIds: [],
  isActive: true,
};

function MasterDialog({
  open,
  onOpenChange,
  master,
  services,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  master: ApiMaster | null;
  services: ApiService[];
}) {
  const [form, setForm] = useState<MasterPayload>(
    master
      ? {
          name: master.name,
          specialty: master.specialty,
          bio: master.bio,
          photoUrl: master.photoUrl,
          experienceYears: master.experienceYears,
          rating: master.rating,
          reviewsCount: master.reviewsCount,
          serviceIds: master.serviceIds,
          isActive: master.isActive ?? true,
        }
      : EMPTY,
  );
  const [error, setError] = useState<string | null>(null);
  const save = useSaveMaster();

  function update<K extends keyof MasterPayload>(key: K, value: MasterPayload[K]) {
    setForm((state) => ({ ...state, [key]: value }));
  }

  function toggleService(id: string) {
    setForm((state) => ({
      ...state,
      serviceIds: state.serviceIds.includes(id)
        ? state.serviceIds.filter((serviceId) => serviceId !== id)
        : [...state.serviceIds, id],
    }));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (form.name.trim().length < 2) return setError("Укажите имя мастера.");
    if (form.specialty.trim().length < 2) return setError("Укажите специализацию.");
    if (form.serviceIds.length === 0) return setError("Выберите хотя бы одну услугу.");

    save.mutate(
      { id: master?.id, payload: form },
      {
        onSuccess: () => {
          toast.success(master ? "Профиль обновлён" : "Мастер добавлен");
          onOpenChange(false);
        },
        onError: (mutationError) => setError(mutationError.message),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{master ? "Профиль мастера" : "Новый мастер"}</DialogTitle>
          <DialogDescription>
            {master
              ? "Измените данные — они сразу обновятся на сайте."
              : "Добавьте специалиста в команду и выберите услуги, которые он выполняет."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="mt-2 space-y-5">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[11px] text-rose-800">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="master-name">Имя</Label>
              <Input
                id="master-name"
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                placeholder="Алина Ветрова"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="master-specialty">Специализация</Label>
              <Input
                id="master-specialty"
                value={form.specialty}
                onChange={(event) => update("specialty", event.target.value)}
                placeholder="Колорист · стилист"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Фото</Label>
            <div className="flex flex-wrap gap-2.5">
              {MASTER_PHOTOS.map((photo) => (
                <button
                  key={photo}
                  type="button"
                  onClick={() => update("photoUrl", photo)}
                  className={cn(
                    "relative h-[72px] w-[56px] overflow-hidden rounded-xl border-2 transition-all",
                    form.photoUrl === photo
                      ? "border-espresso shadow-soft"
                      : "border-transparent opacity-65 hover:opacity-100",
                  )}
                >
                  <Image
                    src={photo}
                    alt=""
                    fill
                    unoptimized
                    sizes="56px"
                    className="object-cover"
                  />
                  {form.photoUrl === photo && (
                    <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-espresso text-cream">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="master-bio">О мастере</Label>
            <Textarea
              id="master-bio"
              value={form.bio}
              onChange={(event) => update("bio", event.target.value)}
              placeholder="Коротко о подходе, опыте и том, что важно гостям"
              className="min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="master-experience">Опыт, лет</Label>
              <Input
                id="master-experience"
                type="number"
                min={1}
                max={60}
                value={form.experienceYears}
                onChange={(event) =>
                  update("experienceYears", Number(event.target.value))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="master-rating">Рейтинг</Label>
              <Input
                id="master-rating"
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={form.rating}
                onChange={(event) => update("rating", Number(event.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="master-reviews">Отзывов</Label>
              <Input
                id="master-reviews"
                type="number"
                min={0}
                value={form.reviewsCount}
                onChange={(event) =>
                  update("reviewsCount", Number(event.target.value))
                }
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <Label>Услуги мастера</Label>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {services.map((service) => {
                const checked = form.serviceIds.includes(service.id);
                const category = SERVICE_CATEGORIES.find(
                  (item) => item.value === service.category,
                )?.label;
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => toggleService(service.id)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all",
                      checked
                        ? "border-espresso/40 bg-white/65"
                        : "border-espresso/8 bg-white/20 hover:border-gold-500/40",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                        checked
                          ? "border-espresso bg-espresso text-cream"
                          : "border-espresso/20",
                      )}
                    >
                      {checked && <Check className="h-2.5 w-2.5" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[10.5px] font-medium text-espresso">
                        {service.name}
                      </span>
                      <span className="block text-[7px] uppercase tracking-[0.08em] text-taupe/55">
                        {category} · {formatPrice(service.price)}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 rounded-xl bg-[#EDF3EC]/60 px-3.5 py-3">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => update("isActive", event.target.checked)}
              className="h-4 w-4 accent-[#14221B]"
            />
            <span className="text-[10.5px] text-espresso">
              Показывать мастера на сайте и в онлайн-записи
            </span>
          </label>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {master ? "Сохранить" : "Добавить мастера"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function MastersManager({ services }: { services: ApiService[] }) {
  const mastersQuery = useAdminMasters();
  const archive = useArchiveMaster();
  const [editor, setEditor] = useState<{ open: boolean; master: ApiMaster | null }>({
    open: false,
    master: null,
  });
  const [archiveTarget, setArchiveTarget] = useState<ApiMaster | null>(null);

  const masters = mastersQuery.data ?? [];
  const active = masters.filter((master) => master.isActive);
  const archived = masters.filter((master) => !master.isActive);

  function restore(master: ApiMaster) {
    archive.mutate(
      { id: master.id, active: true },
      {
        onSuccess: () => toast.success("Мастер снова в команде"),
        onError: (error) => toast.error(error.message),
      },
    );
  }

  function hide() {
    if (!archiveTarget) return;
    archive.mutate(
      { id: archiveTarget.id, active: false },
      {
        onSuccess: () => {
          toast.success("Мастер скрыт с сайта");
          setArchiveTarget(null);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[9px] uppercase tracking-[0.14em] text-taupe/55">
          {active.length} активных · {archived.length} в архиве
        </p>
        <Button onClick={() => setEditor({ open: true, master: null })}>
          <Plus className="h-4 w-4" />
          Добавить мастера
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {mastersQuery.isLoading &&
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[280px] rounded-[26px]" />
          ))}

        {active.map((master) => (
          <article
            key={master.id}
            className="group overflow-hidden rounded-[26px] border border-white/70 bg-ivory/80 shadow-[0_20px_50px_-44px_rgba(20,34,27,.4)] transition-all hover:-translate-y-0.5 hover:shadow-soft"
          >
            <div className="flex gap-4 p-4">
              <div className="relative h-[112px] w-[84px] shrink-0 overflow-hidden rounded-[50px_50px_16px_16px] bg-sand">
                <Image
                  src={master.photoUrl}
                  alt={master.name}
                  fill
                  unoptimized
                  sizes="84px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="min-w-0 flex-1 py-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-xl leading-tight text-espresso">
                      {master.name}
                    </h3>
                    <p className="mt-1 text-[7.5px] font-semibold uppercase tracking-[0.14em] text-rose-600">
                      {master.specialty}
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-gold-300/15 px-2 py-1 text-[8px] text-gold-600">
                    <Star className="h-2.5 w-2.5 fill-gold-400 text-gold-400" />
                    {master.rating.toFixed(1)}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-[9.5px] leading-4 text-taupe">
                  {master.bio}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[8px] text-taupe/60">
                  <span className="flex items-center gap-1">
                    <Award className="h-2.5 w-2.5 text-gold-500" />
                    {master.experienceYears} лет опыта
                  </span>
                  <span>{master.reviewsCount} отзывов</span>
                </div>
              </div>
            </div>

            <div className="px-4 pb-4">
              <div className="flex flex-wrap gap-1">
                {master.serviceIds.slice(0, 3).map((id) => {
                  const service = services.find((item) => item.id === id);
                  if (!service) return null;
                  return (
                    <span
                      key={id}
                      className="rounded-full bg-[#EDF3EC] px-2 py-1 text-[7px] text-espresso/55"
                    >
                      {service.name}
                    </span>
                  );
                })}
                {master.serviceIds.length > 3 && (
                  <span className="rounded-full bg-[#EDF3EC] px-2 py-1 text-[7px] text-espresso/45">
                    +{master.serviceIds.length - 3}
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-center gap-1.5 border-t border-espresso/8 pt-3">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 flex-1 text-[9px]"
                  onClick={() => setEditor({ open: true, master })}
                >
                  <Pencil className="h-3 w-3" />
                  Изменить
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2.5 text-[9px] text-taupe"
                >
                  <a href={`/booking?master=${master.slug}`} target="_blank" rel="noreferrer">
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2.5 text-[9px] text-taupe hover:text-rose-600"
                  onClick={() => setArchiveTarget(master)}
                  title="Скрыть мастера"
                >
                  <Archive className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!mastersQuery.isLoading && active.length === 0 && (
        <div className="rounded-[26px] border border-dashed border-espresso/15 bg-ivory/60 p-14 text-center">
          <UsersRound className="mx-auto h-8 w-8 text-gold-500" strokeWidth={1.3} />
          <p className="mt-4 font-display text-2xl text-espresso">
            В команде пока никого
          </p>
          <p className="mt-2 text-[11px] text-taupe">
            Добавьте первого мастера, чтобы открыть онлайн-запись.
          </p>
          <Button
            className="mt-5"
            onClick={() => setEditor({ open: true, master: null })}
          >
            <Plus className="h-4 w-4" />
            Добавить мастера
          </Button>
        </div>
      )}

      {archived.length > 0 && (
        <div className="rounded-[26px] border border-white/60 bg-ivory/55 p-5">
          <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-taupe/55">
            Архив · {archived.length}
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {archived.map((master) => (
              <div
                key={master.id}
                className="flex items-center gap-3 rounded-2xl bg-white/40 p-3"
              >
                <span className="relative h-9 w-9 overflow-hidden rounded-full bg-sand opacity-50 grayscale">
                  <Image
                    src={master.photoUrl}
                    alt=""
                    fill
                    unoptimized
                    sizes="36px"
                    className="object-cover"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10.5px] text-espresso/60">
                    {master.name}
                  </p>
                  <p className="text-[7.5px] uppercase tracking-[0.08em] text-taupe/40">
                    скрыт с сайта
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => restore(master)}
                  className="flex items-center gap-1 text-[8px] font-semibold uppercase tracking-[0.08em] text-gold-600 hover:underline"
                >
                  <RotateCcw className="h-3 w-3" />
                  Вернуть
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <MasterDialog
        key={`${editor.master?.id ?? "new"}-${editor.open}`}
        open={editor.open}
        onOpenChange={(open) => setEditor((state) => ({ ...state, open }))}
        master={editor.master}
        services={services}
      />

      <Dialog
        open={Boolean(archiveTarget)}
        onOpenChange={(open) => !open && setArchiveTarget(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <Archive className="h-5 w-5" />
            </span>
            <DialogTitle className="mt-2">Скрыть мастера?</DialogTitle>
            <DialogDescription>
              {archiveTarget?.name} исчезнет с сайта и из онлайн-записи. История
              визитов и отзывы сохранятся — профиль можно вернуть в любой момент.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchiveTarget(null)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              disabled={archive.isPending}
              onClick={hide}
            >
              {archive.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Archive className="h-4 w-4" />
              )}
              Скрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

