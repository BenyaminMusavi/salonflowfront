import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ReviewModerationStatus } from "@/services/common/enums/domain-enums";

export interface IStoredAppointmentReview {
  reviewId: number;
  moderationStatus: number;
  rating?: number;
}

interface IMyReviewsState {
  byAppointmentId: Record<string, IStoredAppointmentReview>;
  setForAppointment: (
    appointmentId: string,
    review: IStoredAppointmentReview
  ) => void;
  getForAppointment: (
    appointmentId: string
  ) => IStoredAppointmentReview | undefined;
  clear: () => void;
}

export const useMyReviewsStore = create<IMyReviewsState>()(
  persist(
    (set, get) => ({
      byAppointmentId: {},
      setForAppointment: (appointmentId, review) =>
        set((s) => ({
          byAppointmentId: {
            ...s.byAppointmentId,
            [String(appointmentId)]: review,
          },
        })),
      getForAppointment: (appointmentId) =>
        get().byAppointmentId[String(appointmentId)],
      clear: () => set({ byAppointmentId: {} }),
    }),
    {
      name: "salon_flow_my_reviews",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export function moderationStatusLabel(status: number): string {
  switch (status) {
    case ReviewModerationStatus.Pending:
      return "در انتظار تأیید";
    case ReviewModerationStatus.Approved:
      return "تأیید شده";
    case ReviewModerationStatus.Rejected:
      return "رد شده";
    default:
      return "نامشخص";
  }
}
