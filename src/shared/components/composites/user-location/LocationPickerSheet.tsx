"use client";

import { useMemo, useState, type ReactNode } from "react";
import { keepPreviousData } from "@tanstack/react-query";
import {
  ArrowRightIcon,
  CaretLeftIcon,
  CheckIcon,
  CrosshairIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import BottomSheet from "@/shared/components/composites/bottom-sheet/BottomSheet";
import { Input } from "@/shared/components/primitives/input/Input";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { cn } from "@/shared/utils/className";
import { useQueryCities, useQueryDistricts, useQueryProvinces } from "@/services/domains/locations/hooks/useQueryLocations";
import { useCurrentPosition, useUserLocation } from "@/services/domains/locations/hooks/useUserLocation";
import { useUserLocationStore } from "@/services/domains/locations/store/useUserLocationStore";
import type { ICity, IDistrict, IProvince } from "@/services/domains/locations/types/locations.type";

/** `city` = the user-location root (device position + biggest cities + country search); the rest is province → city → district. */
type TStep = "city" | "province" | "provinceCities" | "district";

/** Same folding as the backend's PersianText.NormalizeName, for filtering a list already on screen. */
const fold = (s: string) => s.replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/‌/g, "").replace(/\s+/g, " ").trim();

const rowClass =
  "flex min-h-12 w-full items-center justify-between gap-3 rounded-[14px] px-3 py-3 text-right text-sm text-foreground hover:bg-surface-hover";

/** Where the picker starts when it opens for an existing value (a branch that already has a city). */
export interface ILocationPickerInitial {
  provincePublicId?: string | null;
  cityPublicId?: string | null;
  districtPublicId?: string | null;
}

interface ILocationPickerSheetProps {
  open: boolean;
  onClose: () => void;
  /**
   * «Pick only» mode (a branch form): province → city → district, the result is handed back and nothing about the
   * user's own location changes — no device-position button, no «پاک کردن».
   */
  onPick?: (city: ICity, district: IDistrict | null) => void;
  title?: string;
  /** Pick mode: open on the current value's province (its city/district highlighted) instead of the province list. */
  initial?: ILocationPickerInitial;
}

/**
 * «موقعیت شما» / a branch's «شهر و محله». The sheet has ONE fixed height for every step: header, path and search stay put
 * and only the list scrolls — loading, empty and long lists never change its size. Each step keeps its own scroll
 * position and search text, so «بازگشت» lands exactly where the user left. The state lives only while the sheet is
 * open and starts from `initial`, so two branches never share a half-finished choice. Nothing is applied until the
 * last tap; «لغو» / closing changes nothing. All places come from the API.
 */
export default function LocationPickerSheet({ open, onClose, onPick, title, initial }: ILocationPickerSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      {open ? <PickerBody onDone={onClose} onPick={onPick} rootTitle={title} initial={initial} /> : null}
    </BottomSheet>
  );
}

function PickerBody({
  onDone,
  onPick,
  rootTitle,
  initial,
}: {
  onDone: () => void;
  onPick?: ILocationPickerSheetProps["onPick"];
  rootTitle?: string;
  initial?: ILocationPickerInitial;
}) {
  const location = useUserLocation();
  const pickOnly = !!onPick;
  const gps = useCurrentPosition();
  const provinces = useQueryProvinces();

  const rootStep: TStep = pickOnly ? "province" : "city";
  const [step, setStep] = useState<TStep>(pickOnly && initial?.provincePublicId ? "provinceCities" : rootStep);
  const [provinceId, setProvinceId] = useState<string | null>(pickOnly ? initial?.provincePublicId ?? null : null);
  const [city, setCity] = useState<ICity | null>(null);
  // One search text per step: going back shows the list exactly as the user left it.
  const [searches, setSearches] = useState<Record<TStep, string>>({ city: "", province: "", provinceCities: "", district: "" });
  const countrySearch = useDebouncedValue(searches.city, 300);

  const province: IProvince | null = provinceId
    ? provinces.data?.data?.find((p) => p.publicId === provinceId) ?? { publicId: provinceId, name: "" }
    : null;

  const finish = (c: ICity, d: IDistrict | null) => {
    if (onPick) onPick(c, d);
    else useUserLocationStore.getState().setManual(c, d);
    onDone();
  };

  const pickProvince = (p: IProvince) => {
    if (p.publicId !== provinceId) {
      // Another province: its city list starts clean (search included); the district step belongs to the old city.
      setSearches((s) => ({ ...s, provinceCities: "", district: "" }));
      setCity(null);
    }
    setProvinceId(p.publicId);
    setStep("provinceCities");
  };

  const pickCity = (c: ICity) => {
    if (!c.hasDistricts) {
      finish(c, null);
      return;
    }
    if (c.publicId !== city?.publicId) setSearches((s) => ({ ...s, district: "" }));
    setCity(c);
    setStep("district");
  };

  const back: TStep | null =
    step === "district" ? (provinceId ? "provinceCities" : rootStep) : step === "provinceCities" ? "province" : step === "province" && !pickOnly ? "city" : null;

  const title =
    step === "province"
      ? pickOnly ? rootTitle ?? "انتخاب استان" : "انتخاب استان"
      : step === "provinceCities"
        ? "انتخاب شهر"
        : step === "district"
          ? "انتخاب محله"
          : rootTitle ?? "موقعیت شما";
  const path = [step !== "city" && step !== "province" ? province?.name : null, step === "district" ? city?.name : null].filter(Boolean).join(" › ");
  const searchLabel = step === "district" ? "جستجوی محله" : step === "province" ? "جستجوی استان" : "جستجوی شهر";

  return (
    // Fixed height (not content-sized): steps, loading and search never resize or move the sheet.
    <div className="flex h-[74dvh] flex-col gap-3">
      <div className="flex shrink-0 items-center gap-2">
        {back ? (
          <button type="button" aria-label="بازگشت" onClick={() => setStep(back)} className="rounded-full p-1.5 text-foreground hover:bg-surface-hover">
            <ArrowRightIcon size={20} />
          </button>
        ) : null}
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[17px] font-bold text-foreground">{title}</h2>
          <p className="h-4 truncate text-xs text-foreground-muted">
            {path || (step === "city" && location.label ? `الان: ${location.label}` : "")}
          </p>
        </div>
        <button type="button" onClick={onDone} className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-foreground-muted hover:bg-surface-hover">
          لغو
        </button>
      </div>

      {step === "city" ? (
        <div className="flex shrink-0 flex-col gap-2">
          <button
            type="button"
            onClick={async () => {
              if (await gps.request()) onDone();
            }}
            disabled={gps.loading}
            className="flex items-center gap-3 rounded-[16px] bg-surface-brand px-4 py-3 text-right text-sm font-bold text-content-brand disabled:opacity-60"
          >
            <CrosshairIcon size={20} weight="bold" />
            {gps.loading ? "در حال دریافت موقعیت…" : "استفاده از موقعیت فعلی من"}
          </button>
          {gps.error ? <p role="alert" className="text-xs text-error">{gps.error}</p> : null}
          {location.mode === "gps" && location.manual ? (
            <button
              type="button"
              onClick={() => {
                useUserLocationStore.getState().stopGps();
                onDone();
              }}
              className="text-right text-xs font-semibold text-primary"
            >
              بازگشت به «{location.manual.district?.name ?? location.manual.city.name}»
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="shrink-0">
        <Input
          value={searches[step]}
          onChange={(e) => setSearches((s) => ({ ...s, [step]: e.target.value }))}
          placeholder={searchLabel}
          aria-label={searchLabel}
          startIcon={<MagnifyingGlassIcon size={18} />}
          className="rounded-[12px]"
        />
      </div>

      {/* Every visited step stays mounted in its own scroll panel; only the active one is visible. */}
      <div className="relative min-h-0 flex-1">
        {!pickOnly ? (
          <Panel active={step === "city"}>
            <CountryCityList
              search={countrySearch}
              onPick={pickCity}
              onBrowseProvinces={() => setStep("province")}
            />
          </Panel>
        ) : null}
        <Panel active={step === "province"}>
          <ProvinceList filter={searches.province} selectedId={provinceId} onPick={pickProvince} />
        </Panel>
        {provinceId ? (
          <Panel key={provinceId} active={step === "provinceCities"}>
            <ProvinceCityList
              provincePublicId={provinceId}
              filter={searches.provinceCities}
              selectedId={city?.publicId ?? (pickOnly ? initial?.cityPublicId ?? null : null)}
              onPick={pickCity}
            />
          </Panel>
        ) : null}
        {city ? (
          <Panel key={city.publicId} active={step === "district"}>
            <DistrictList
              city={city}
              filter={searches.district}
              selectedId={pickOnly && city.publicId === initial?.cityPublicId ? initial?.districtPublicId ?? null : null}
              noneLabel={pickOnly ? "بدون تعیین محله" : `همه‌ی محله‌های ${city.name}`}
              onPick={(d) => finish(city, d)}
            />
          </Panel>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3">
        {step === "city" && location.hasLocation ? (
          <button
            type="button"
            onClick={() => {
              useUserLocationStore.getState().clear();
              onDone();
            }}
            className="flex items-center gap-2 text-xs font-semibold text-error"
          >
            <TrashIcon size={14} />
            پاک کردن موقعیت
          </button>
        ) : (
          <span />
        )}
        {/* ODbL: the place names come from OpenStreetMap and must be credited where they are shown. */}
        <p className="text-[11px] text-foreground-muted">
          نام شهرها و محله‌ها از{" "}
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline">
            © OpenStreetMap contributors
          </a>
        </p>
      </div>
    </div>
  );
}

/** A step's own scroll area. Hidden with `invisible` (not unmounted / display:none) so its scroll position survives. */
function Panel({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <div
      aria-hidden={!active}
      className={cn("absolute inset-0 overflow-y-auto overscroll-contain", active ? "visible" : "pointer-events-none invisible")}
    >
      {children}
    </div>
  );
}

/** Loading takes the same room as a few rows, and errors / empty states sit in the same fixed area: nothing jumps. */
function ListState({ loading, error, onRetry, empty }: { loading: boolean; error: boolean; onRetry: () => void; empty: string | null }) {
  if (loading)
    return (
      <div aria-label="در حال بارگذاری" className="flex flex-col gap-1">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-[14px] bg-surface-hover" />
        ))}
      </div>
    );
  if (error)
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <p className="text-xs text-error">فهرست بارگذاری نشد. اتصال اینترنت را بررسی کنید.</p>
        <button type="button" onClick={onRetry} className="rounded-full bg-background-secondary px-4 py-1.5 text-xs font-bold text-foreground">
          تلاش دوباره
        </button>
      </div>
    );
  return empty ? <p className="py-6 text-center text-xs text-foreground-muted">{empty}</p> : null;
}

function Row({ selected, onClick, children, chevron }: { selected?: boolean; onClick: () => void; children: ReactNode; chevron?: boolean }) {
  return (
    <li>
      <button type="button" onClick={onClick} aria-current={selected || undefined} className={cn(rowClass, selected && "bg-surface-hover font-semibold")}>
        <span className="flex min-w-0 items-center gap-2">{children}</span>
        {selected ? <CheckIcon size={16} className="shrink-0 text-primary" /> : chevron ? <CaretLeftIcon size={16} className="shrink-0 text-foreground-muted" /> : null}
      </button>
    </li>
  );
}

const useFiltered = <T extends { name: string }>(all: T[], filter: string) =>
  useMemo(() => {
    const f = fold(filter);
    return f ? all.filter((x) => fold(x.name).includes(f)) : all;
  }, [all, filter]);

/** User-location root: the biggest cities, or a country-wide search (previous results stay while the next loads). */
function CountryCityList({ search, onPick, onBrowseProvinces }: { search: string; onPick: (c: ICity) => void; onBrowseProvinces: () => void }) {
  const q = useQueryCities({ search }, true, keepPreviousData);
  const items = q.data?.data ?? [];
  const noData = !q.isLoading && !q.isError && items.length === 0;

  return (
    <div className="flex flex-col">
      {!search ? <p className="px-1 pb-1 text-xs font-semibold text-foreground-muted">شهرهای پرجمعیت</p> : null}
      <ListState
        loading={q.isLoading}
        error={q.isError}
        onRetry={() => q.refetch()}
        empty={noData ? (search ? "شهری با این نام پیدا نشد." : "فهرست شهرها هنوز آماده نیست؛ فعلاً از موقعیت فعلی خود استفاده کنید.") : null}
      />
      <ul className={cn("flex flex-col", q.isPlaceholderData && "opacity-60")}>
        {items.map((c) => (
          <Row key={c.publicId} onClick={() => onPick(c)} chevron={c.hasDistricts}>
            <MapPinIcon size={16} className="shrink-0 text-foreground-muted" />
            <span className="truncate">{c.name}</span>
            <span className="truncate text-xs text-foreground-muted">{c.provinceName}</span>
          </Row>
        ))}
      </ul>
      {!noData ? (
        <button type="button" onClick={onBrowseProvinces} className={cn(rowClass, "font-semibold text-primary")}>
          انتخاب از فهرست استان‌ها
          <CaretLeftIcon size={16} />
        </button>
      ) : null}
    </div>
  );
}

function ProvinceList({ filter, selectedId, onPick }: { filter: string; selectedId: string | null; onPick: (p: IProvince) => void }) {
  const q = useQueryProvinces();
  const all = q.data?.data ?? [];
  const items = useFiltered(all, filter);

  return (
    <div className="flex flex-col">
      <ListState
        loading={q.isLoading}
        error={q.isError}
        onRetry={() => q.refetch()}
        empty={!q.isLoading && !q.isError && items.length === 0 ? (all.length === 0 ? "فهرست استان‌ها هنوز آماده نیست؛ فعلاً نام شهر را در فرم بنویسید." : "استانی با این نام پیدا نشد.") : null}
      />
      <ul className="flex flex-col">
        {items.map((p) => (
          <Row key={p.publicId} selected={p.publicId === selectedId} onClick={() => onPick(p)} chevron>
            <span className="truncate">{p.name}</span>
          </Row>
        ))}
      </ul>
    </div>
  );
}

/** All cities of one province, filtered on the device — no request per keystroke. */
function ProvinceCityList({
  provincePublicId,
  filter,
  selectedId,
  onPick,
}: {
  provincePublicId: string;
  filter: string;
  selectedId: string | null;
  onPick: (c: ICity) => void;
}) {
  const q = useQueryCities({ provincePublicId });
  const all = q.data?.data ?? [];
  const items = useFiltered(all, filter);

  return (
    <div className="flex flex-col">
      <ListState
        loading={q.isLoading}
        error={q.isError}
        onRetry={() => q.refetch()}
        empty={!q.isLoading && !q.isError && items.length === 0 ? (all.length === 0 ? "برای این استان شهری ثبت نشده است." : "شهری با این نام پیدا نشد.") : null}
      />
      <ul className="flex flex-col">
        {items.map((c) => (
          <Row key={c.publicId} selected={c.publicId === selectedId} onClick={() => onPick(c)} chevron={c.hasDistricts}>
            <MapPinIcon size={16} className="shrink-0 text-foreground-muted" />
            <span className="truncate">{c.name}</span>
          </Row>
        ))}
      </ul>
    </div>
  );
}

function DistrictList({
  city,
  filter,
  selectedId,
  noneLabel,
  onPick,
}: {
  city: ICity;
  filter: string;
  selectedId: string | null;
  noneLabel: string;
  onPick: (d: IDistrict | null) => void;
}) {
  const q = useQueryDistricts(city.publicId);
  const all = q.data?.data ?? [];
  const items = useFiltered(all, filter);

  return (
    <div className="flex flex-col">
      <ul className="flex flex-col">
        <Row onClick={() => onPick(null)}>
          <span className="truncate font-semibold text-primary">{noneLabel}</span>
        </Row>
      </ul>
      <ListState
        loading={q.isLoading}
        error={q.isError}
        onRetry={() => q.refetch()}
        empty={!q.isLoading && !q.isError && items.length === 0 ? "محله‌ای با این نام پیدا نشد." : null}
      />
      <ul className="flex flex-col">
        {items.map((d) => (
          <Row key={d.publicId} selected={d.publicId === selectedId} onClick={() => onPick(d)}>
            <span className="truncate">{d.name}</span>
          </Row>
        ))}
      </ul>
    </div>
  );
}
