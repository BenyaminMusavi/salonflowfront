import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { GenderType } from "@/services/common/enums/domain-enums";
import {
  IOnboardingBranch,
  IOnboardingService,
  IOnboardingStaff,
  ISaveBasicInfoRequest,
  IScheduleDay,
} from "@/services/domains/salons/types/onboarding.type";

const defaultSchedule = (): IScheduleDay[] =>
  Array.from({ length: 7 }, (_, dayOfWeek) => ({
    dayOfWeek,
    isOffDay: dayOfWeek === 5, // Friday off by default
    startTime: dayOfWeek === 5 ? null : "09:00:00",
    endTime: dayOfWeek === 5 ? null : "18:00:00",
  }));

/** Persisted drafts may lack offeringPublicIds; treat missing as []. */
export function normalizeOnboardingStaff(
  staff: Partial<IOnboardingStaff>[]
): IOnboardingStaff[] {
  return staff.map((s) => ({
    publicId: s.publicId ?? null,
    branchPublicId: s.branchPublicId ?? "",
    isCreator: Boolean(s.isCreator),
    phoneNumber: s.phoneNumber ?? null,
    offeringPublicIds: Array.isArray(s.offeringPublicIds)
      ? s.offeringPublicIds.map(String).filter(Boolean)
      : [],
  }));
}

interface IOnboardingDraftState {
  salonPublicId: string | null;
  step: number;
  submitted: boolean;
  basicInfo: Omit<ISaveBasicInfoRequest, "publicId">;
  branches: IOnboardingBranch[];
  services: IOnboardingService[];
  staff: IOnboardingStaff[];
  schedule: IScheduleDay[];
  setSalonPublicId: (id: string | null) => void;
  setStep: (step: number) => void;
  setSubmitted: (v: boolean) => void;
  setBasicInfo: (info: Partial<Omit<ISaveBasicInfoRequest, "publicId">>) => void;
  setBranches: (branches: IOnboardingBranch[]) => void;
  setServices: (services: IOnboardingService[]) => void;
  setStaff: (staff: IOnboardingStaff[]) => void;
  setSchedule: (days: IScheduleDay[]) => void;
  reset: () => void;
}

const initial = {
  salonPublicId: null as string | null,
  step: 1,
  submitted: false,
  basicInfo: {
    name: "",
    description: "",
    instagramHandle: "",
    whatsappNumber: "",
    websiteUrl: "",
  },
  branches: [] as IOnboardingBranch[],
  services: [] as IOnboardingService[],
  staff: [] as IOnboardingStaff[],
  schedule: defaultSchedule(),
};

export const useOnboardingDraftStore = create<IOnboardingDraftState>()(
  persist(
    (set) => ({
      ...initial,
      setSalonPublicId: (salonPublicId) => set({ salonPublicId }),
      setStep: (step) => set({ step }),
      setSubmitted: (submitted) => set({ submitted }),
      setBasicInfo: (info) =>
        set((s) => ({ basicInfo: { ...s.basicInfo, ...info } })),
      setBranches: (branches) => set({ branches }),
      setServices: (services) => set({ services }),
      setStaff: (staff) => set({ staff: normalizeOnboardingStaff(staff) }),
      setSchedule: (schedule) => set({ schedule }),
      reset: () => set({ ...initial, schedule: defaultSchedule() }),
    }),
    {
      name: "salon_flow_onboarding_draft",
      storage: createJSONStorage(() => localStorage),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<IOnboardingDraftState>;
        return {
          ...current,
          ...p,
          staff: normalizeOnboardingStaff(p.staff ?? current.staff ?? []),
        };
      },
    }
  )
);

export const DAY_LABELS = [
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
  "شنبه",
];

/** Matches guide §5.4 GenderType: 1 Male, 2 Female, 3 Mixed. */
export const GENDER_TYPE_OPTIONS = [
  { value: GenderType.Male, label: "آقایان" },
  { value: GenderType.Female, label: "بانوان" },
  { value: GenderType.Mixed, label: "هردو" },
] as const;
