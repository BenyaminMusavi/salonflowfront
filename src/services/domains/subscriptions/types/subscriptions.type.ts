import { TResponse } from "@/services/common/data-types/SharedDataTypes";
import {
  PlatformInvoiceStatus,
  SubscriptionStatus,
} from "@/services/common/enums/domain-enums";

export interface ISubscriptionPlan {
  id: number;
  publicId?: string;
  name: string;
  durationMonths: number;
  price: number;
  currency?: string;
  maxSalons: number;
  trialDays?: number;
  campaignPrice?: number | null;
  campaignName?: string | null;
}

export interface ISubscription {
  id?: number;
  planId?: number;
  planName?: string;
  status: SubscriptionStatus | number;
  startsAt?: string | null;
  endDate?: string | null;
  trialEndsAt?: string | null;
  maxSalons?: number;
}

export interface ISubscriptionEntitlement {
  isEntitled: boolean;
  maxSalons: number;
  ownedSalonCount: number;
  status?: SubscriptionStatus | number | null;
  startsAt?: string | null;
  endDate?: string | null;
  trialEndsAt?: string | null;
  planId?: number | null;
  planName?: string | null;
}

export interface IStartTrialRequest {
  planId: number;
}

export interface ICheckoutRequest {
  planId: number;
  promoCode?: string | null;
}

export interface IPlatformInvoice {
  id: number;
  planId?: number;
  planName?: string;
  amount?: number;
  status: PlatformInvoiceStatus | number;
  createdAt?: string;
  promoCode?: string | null;
}

export type TSubscriptionPlansEntity = TResponse<ISubscriptionPlan[]>;
export type TSubscriptionEntity = TResponse<ISubscription | null>;
export type TEntitlementEntity = TResponse<ISubscriptionEntitlement>;
export type TCheckoutEntity = TResponse<IPlatformInvoice>;
export type TPlatformInvoicesEntity = TResponse<IPlatformInvoice[]>;
