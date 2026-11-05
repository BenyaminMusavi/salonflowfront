"use client";

import { useMemo, useState } from "react";
import {
  ArrowRightIcon,
  CaretLeftIcon,
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

type TStep = "city" | "province" | "provinceCities" | "district";

/** Same folding as the backend's PersianText.NormalizeName, for filtering a list already on screen. */
const fold = (s: string) => s.replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/‌/g, "").replace(/\s+/g, " ").trim();

const rowClass =
  "flex w-full items-center justify-between gap-3 rounded-[14px] px-3 py-3 text-right text-sm text-foreground hover:bg-surface-hover";

interface ILocationPickerSheetProps {
  open: boolean;
  onClose: () => void;
  /**
   * «Pick only» mode (e.g. a branch form): the chosen city/district is handed back and nothing about the user's own
   * location changes — no device-position button, no «پاک کردن».
   */
  onPick?: (city: ICity, district: IDistrict | null) => void;
  title?: string;
}

/**
 * «موقعیت شما»: the device position (only on the user's tap), or province → city → district by hand. A manual choice is
 * saved (this browser; also the account when logged in); the device position is used for this visit only.
 * All places come from the API — nothing geographic is hardcoded here.
 */
export default function LocationPickerSheet({ open, onClose, onPick, title }: ILocationPickerSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      {open ? <PickerBody onDone={onClose} onPick={onPick} rootTitle={title} /> : null}
    </BottomSheet>
  );
}

function PickerBody({ onDone, onPick, rootTitle }: { onDone: () => void; onPick?: ILocationPickerSheetProps["onPick"]; rootTitle?: string }) {
  const location = useUserLocation();
  const { stopGps, clear } = useUserLocationStore.getState();
  const pickOnly = !!onPick;
  const setManual = (c: ICity, d: IDistrict | null) =>
    onPick ? onPick(c, d) : useUserLocationStore.getState().setManual(c, d);
  const gps = useCurrentPosition();

  const [step, setStep] = useState<TStep>("city");
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search, 300);
  const [province, setProvince] = useState<IProvince | null>(null);
  const [city, setCity] = useState<ICity | null>(null);

  const go = (next: TStep) => {
    setSearch("");
    setStep(next);
  };

  const pickCity = (c: ICity) => {
    if (c.hasDistricts) {
      setCity(c);
      go("district");
      return;
    }
    setManual(c, null);
    onDone();
  };

  const useMyPosition = async () => {
    if (await gps.request()) onDone();
  };

  const title =
    step === "province" ? "انتخاب استان" : step === "provinceCities" ? province?.name : step === "district" ? city?.name : rootTitle ?? "موقعیت شما";
  const searchLabel = step === "district" ? "جستجوی محله" : step === "province" ? "جستجوی استان" : "جستجوی شهر";
  const back = step === "province" ? "city" : step === "provinceCities" ? "province" : step === "district" ? (province ? "provinceCities" : "city") : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {back ? (
          <button type="button" aria-label="بازگشت" onClick={() => go(back)} className="rounded-full p-1.5 text-foreground hover:bg-surface-hover">
            <ArrowRightIcon size={20} />
          </button>
        ) : null}
        <div className="min-w-0">
          <h2 className="truncate text-[17px] font-bold text-foreground">{title}</h2>
          {step === "city" && !pickOnly && location.label ? (
            <p className="text-xs text-foreground-muted">الان: {location.label}</p>
          ) : null}
        </div>
      </div>

      {step === "city" && !pickOnly ? (
        <>
          <button
            type="button"
            onClick={useMyPosition}
            disabled={gps.loading}
            className="flex items-center gap-3 rounded-[16px] bg-surface-brand px-4 py-3 text-right text-sm font-bold text-content-brand disabled:opacity-60"
          >
            <CrosshairIcon size={20} weight="bold" />
            {gps.loading ? "در حال دریافت موقعیت…" : "استفاده از موقعیت فعلی من"}
          </button>
          {gps.error ? <p role="alert" className="text-xs text-error">{gps.error}</p> : null}
          {location.mode === "gps" && location.manual ? (
            <button type="button" onClick={() => { stopGps(); onDone(); }} className="text-right text-xs font-semibold text-primary">
              بازگشت به «{location.manual.district?.name ?? location.manual.city.name}»
            </button>
          ) : null}
        </>
      ) : null}

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={searchLabel}
        aria-label={searchLabel}
        startIcon={<MagnifyingGlassIcon size={18} />}
        className="rounded-[12px]"
      />

      {step === "city" ? <CityList search={debounced} onPick={pickCity} onBrowseProvinces={() => go("province")} pickOnly={pickOnly} /> : null}
      {step === "province" ? (
        <ProvinceList
          filter={search}
          onPick={(p) => {
            setProvince(p);
            go("provinceCities");
          }}
        />
      ) : null}
      {step === "provinceCities" && province ? <CityList provincePublicId={province.publicId} filter={search} onPick={pickCity} /> : null}
      {step === "district" && city ? (
        <DistrictList
          city={city}
          filter={search}
          onPick={(d) => {
            setManual(city, d);
            onDone();
          }}
        />
      ) : null}

      {step === "city" && !pickOnly && location.hasLocation ? (
        <button
          type="button"
          onClick={() => {
            clear();
            onDone();
          }}
          className="flex items-center gap-2 self-start text-xs font-semibold text-error"
        >
          <TrashIcon size={14} />
          پاک کردن موقعیت
        </button>
      ) : null}

      {/* ODbL: the place names come from OpenStreetMap and must be credited where they are shown. */}
      <p className="text-[11px] text-foreground-muted">
        نام شهرها و محله‌ها از{" "}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline">
          © OpenStreetMap contributors
        </a>
      </p>
    </div>
  );
}

function ListState({ loading, error, onRetry, empty }: { loading: boolean; error: boolean; onRetry: () => void; empty: string | null }) {
  if (loading) return <p className="py-4 text-center text-xs text-foreground-muted">در حال بارگذاری…</p>;
  if (error)
    return (
      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <p className="text-xs text-error">فهرست بارگذاری نشد. اتصال اینترنت را بررسی کنید.</p>
        <button type="button" onClick={onRetry} className="rounded-full bg-background-secondary px-4 py-1.5 text-xs font-bold text-foreground">
          تلاش دوباره
        </button>
      </div>
    );
  return empty ? <p className="py-4 text-center text-xs text-foreground-muted">{empty}</p> : null;
}

function CityList({
  search,
  filter,
  provincePublicId,
  onPick,
  onBrowseProvinces,
  pickOnly,
}: {
  search?: string;
  filter?: string;
  provincePublicId?: string;
  onPick: (c: ICity) => void;
  onBrowseProvinces?: () => void;
  pickOnly?: boolean;
}) {
  const q = useQueryCities({ provincePublicId, search: provincePublicId ? undefined : search });
  const all = q.data?.data ?? [];
  const items = useMemo(() => {
    const f = fold(filter ?? "");
    return f ? all.filter((c) => fold(c.name).includes(f)) : all;
  }, [all, filter]);
  const noData = !q.isLoading && !q.isError && all.length === 0;

  return (
    <div className="flex flex-col">
      {!provincePublicId && !search ? <p className="px-1 pb-1 text-xs font-semibold text-foreground-muted">شهرهای پرجمعیت</p> : null}
      <ListState
        loading={q.isLoading}
        error={q.isError}
        onRetry={() => q.refetch()}
        empty={
          noData
            ? search
              ? "شهری با این نام پیدا نشد."
              : pickOnly
                ? "فهرست شهرها هنوز آماده نیست؛ فعلاً نام شهر را در فرم بنویسید."
                : "فهرست شهرها هنوز آماده نیست؛ فعلاً از موقعیت فعلی خود استفاده کنید."
            : items.length === 0 && !q.isLoading
              ? "شهری با این نام پیدا نشد."
              : null
        }
      />
      <ul className="flex flex-col">
        {items.map((c) => (
          <li key={c.publicId}>
            <button type="button" onClick={() => onPick(c)} className={rowClass}>
              <span className="flex min-w-0 items-center gap-2">
                <MapPinIcon size={16} className="shrink-0 text-foreground-muted" />
                <span className="truncate">{c.name}</span>
                {!provincePublicId ? <span className="truncate text-xs text-foreground-muted">{c.provinceName}</span> : null}
              </span>
              {c.hasDistricts ? <CaretLeftIcon size={16} className="shrink-0 text-foreground-muted" /> : null}
            </button>
          </li>
        ))}
      </ul>
      {onBrowseProvinces && !noData ? (
        <button type="button" onClick={onBrowseProvinces} className={cn(rowClass, "font-semibold text-primary")}>
          انتخاب از فهرست استان‌ها
          <CaretLeftIcon size={16} />
        </button>
      ) : null}
    </div>
  );
}

function ProvinceList({ filter, onPick }: { filter: string; onPick: (p: IProvince) => void }) {
  const q = useQueryProvinces();
  const all = q.data?.data ?? [];
  const items = useMemo(() => {
    const f = fold(filter);
    return f ? all.filter((p) => fold(p.name).includes(f)) : all;
  }, [all, filter]);

  return (
    <div className="flex flex-col">
      <ListState
        loading={q.isLoading}
        error={q.isError}
        onRetry={() => q.refetch()}
        empty={!q.isLoading && !q.isError && items.length === 0 ? (all.length === 0 ? "فهرست استان‌ها هنوز آماده نیست." : "استانی با این نام پیدا نشد.") : null}
      />
      <ul className="flex flex-col">
        {items.map((p) => (
          <li key={p.publicId}>
            <button type="button" onClick={() => onPick(p)} className={rowClass}>
              {p.name}
              <CaretLeftIcon size={16} className="text-foreground-muted" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DistrictList({ city, filter, onPick }: { city: ICity; filter: string; onPick: (d: IDistrict | null) => void }) {
  const q = useQueryDistricts(city.publicId);
  const all = q.data?.data ?? [];
  const items = useMemo(() => {
    const f = fold(filter);
    return f ? all.filter((d) => fold(d.name).includes(f)) : all;
  }, [all, filter]);

  return (
    <div className="flex flex-col">
      <button type="button" onClick={() => onPick(null)} className={cn(rowClass, "font-semibold text-primary")}>
        همه‌ی محله‌های {city.name}
      </button>
      <ListState
        loading={q.isLoading}
        error={q.isError}
        onRetry={() => q.refetch()}
        empty={!q.isLoading && !q.isError && items.length === 0 ? "محله‌ای با این نام پیدا نشد." : null}
      />
      <ul className="flex flex-col">
        {items.map((d) => (
          <li key={d.publicId}>
            <button type="button" onClick={() => onPick(d)} className={rowClass}>
              {d.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
