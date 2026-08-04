import { TResponse } from "@/services/common/data-types/SharedDataTypes";

export interface IZReportStaffCommission {
  staffMemberId: number;
  staffName: string;
  commissionTotal: number;
}

export interface IZReport {
  date: string;
  salonId: number;
  cashTotal: number;
  cardTotal: number;
  onlineTotal: number;
  paymentsTotal: number;
  tipsTotal: number;
  staffCommissionTotal: number;
  staffCommissions?: IZReportStaffCommission[];
}

export type TZReportEntity = TResponse<IZReport>;

