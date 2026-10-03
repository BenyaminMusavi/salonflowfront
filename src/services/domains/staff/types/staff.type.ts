import type { TResponse } from "@/services/common/data-types/SharedDataTypes";
import type { StaffInvitationStatus } from "@/services/common/enums/domain-enums";

/** API `TimeOnly` range («HH:mm:ss»). */
export interface ITimeRange {
  start: string;
  end: string;
}

/** GET /api/staff row — everyone in the salon, pending invitations included. */
export interface IStaffListItem {
  publicId: string;
  staffMemberId: number;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  color: string | null;
  isOwner: boolean;
  hasLoggedIn: boolean;
  invitationStatus: StaffInvitationStatus;
  branch: { publicId: string; name: string | null } | null;
  servicesCount: number;
  today: { isOff: boolean; ranges: ITimeRange[]; appointmentsCount: number } | null;
}

/** GET /api/staff/me — the caller's staff member in the active salon. */
export interface IMyStaff {
  publicId: string;
  staffMemberId: number;
  fullName: string | null;
  branchPublicId: string | null;
}

export interface IInviteStaffRequest {
  phone: string;
  branchPublicId: string;
  offeringPublicIds: string[];
}

export interface IUpdateStaffRequest {
  branchPublicId?: string | null;
  color?: string | null;
}

/** Appointment that falls outside new hours / on a new day off — reported, never cancelled. */
export interface IScheduleConflict {
  appointmentPublicId: string;
  customerName: string | null;
  startTime: string;
  endTime: string;
}

export interface IWeeklyDay {
  /** 0 = Saturday … 6 = Friday. */
  dayOfWeek: number;
  isOff: boolean;
  /** One range, or two for a split shift (the gap is the break). */
  ranges: ITimeRange[];
}

export interface IWeeklySchedule {
  days: IWeeklyDay[];
  conflicts: IScheduleConflict[];
}

export interface IScheduleExceptionRequest {
  from: string;
  to: string;
  type: "off" | "hours";
  ranges: ITimeRange[];
  note?: string | null;
}

export interface IScheduleExceptionResult {
  daysCount: number;
  affectedAppointmentsCount: number;
  affectedAppointments: IScheduleConflict[];
}

/** GET /api/schedules/team row — one person's working hours per day of the range. */
export interface ITeamScheduleRow {
  staff: { publicId: string; staffMemberId: number; fullName: string | null; color: string | null };
  days: { date: string; isOff: boolean; isException: boolean; ranges: ITimeRange[]; appointmentsCount: number }[];
}

export type TStaffListEntity = TResponse<IStaffListItem[]>;
export type TStaffItemEntity = TResponse<IStaffListItem>;
export type TMyStaffEntity = TResponse<IMyStaff>;
export type TRemovalImpactEntity = TResponse<{ futureAppointmentsCount: number }>;
export type TWeeklyScheduleEntity = TResponse<IWeeklySchedule>;
export type TScheduleExceptionEntity = TResponse<IScheduleExceptionResult>;
export type TTeamScheduleEntity = TResponse<ITeamScheduleRow[]>;
