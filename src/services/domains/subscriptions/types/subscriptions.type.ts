import { TPagedResult, TResponse } from "@/services/common/data-types/SharedDataTypes";
import {
  PlatformInvoiceStatus,
  SubscriptionStatus,
} from "@/services/common/enums/domain-enums";

export interface ISubscriptionPlan {
  id: number;
  publicId?: string;
  name: string;
  description?: string | null;
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

export interface ICheckoutPreviewRequest {
  planId: number;
  promoCode?: string | null;
}

/** Pure calculation — no invoice is created. `discountAmount` is campaign + code combined. */
export interface ICheckoutPreviewResult {
  planId: number;
  valid: boolean;
  originalPrice: number;
  finalPrice: number;
  discountAmount: number;
  campaignDiscount?: number;
  promoDiscount?: number;
  campaignName?: string | null;
  promoCode?: string | null;
  currency?: string;
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
export type TCheckoutPreviewEntity = TResponse<ICheckoutPreviewResult>;
export type TPlatformInvoicesEntity = TResponse<IPlatformInvoice[]>;

/** Admin overview — `GET /api/admin/subscriptions`. Subscriptions are owner-level, not
 * per-salon, so `salonName` is best-effort from the owner's salons and may be null if
 * they haven't created one yet. */
export interface IAdminSubscriptionListItem {
  ownerName: string;
  ownerPhone: string;
  salonName: string | null;
  planName: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string | null;
  isTrial: boolean;
}

export interface IAdminSubscriptionsParams {
  page?: number;
  pageSize?: number;
  status?: SubscriptionStatus;
  search?: string;
}

/** Admin platform-invoice overview — `GET /api/admin/subscriptions/invoices`. */
export interface IAdminPlatformInvoiceListItem {
  id: number;
  invoiceNumber: string;
  ownerName: string;
  ownerPhone: string;
  grandTotal: number;
  currency: string;
  status: PlatformInvoiceStatus;
  paidAt: string | null;
}

export interface IAdminPlatformInvoicesParams {
  page?: number;
  pageSize?: number;
  status?: PlatformInvoiceStatus;
  search?: string;
}

export interface IMarkInvoicePaidRequest {
  paymentMethodNote?: string;
  externalPaymentRef?: string | null;
}

export type TAdminSubscriptionsEntity = TResponse<TPagedResult<IAdminSubscriptionListItem>>;
export type TAdminPlatformInvoicesListEntity = TResponse<
  TPagedResult<IAdminPlatformInvoiceListItem>
>;
