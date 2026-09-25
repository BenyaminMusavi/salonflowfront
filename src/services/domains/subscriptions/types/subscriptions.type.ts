import { TPagedResult, TResponse } from "@/services/common/data-types/SharedDataTypes";
import {
  PlatformInvoiceStatus,
  PromoDiscountType,
  SubscriptionStatus,
} from "@/services/common/enums/domain-enums";

/** Public plan (`GET /api/subscriptions/plans`, active plans only). Amounts are in RIALS. */
export interface ISubscriptionPlan {
  id: number;
  publicId?: string;
  name: string;
  description?: string | null;
  durationMonths: number;
  /** RIALS */
  price: number;
  currency?: string;
  maxSalons: number;
  trialDays?: number;
  sortOrder?: number;
  /** Price after the plan discount, in RIALS — what checkout charges. null = no discount. */
  campaignPrice?: number | null;
  /** Discount title, e.g. «افتتاحیه». */
  campaignName?: string | null;
  discountPercent?: number | null;
  /** UTC ISO; null = no end date. */
  discountEndsAt?: string | null;
  discountRemainingDays?: number | null;
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

/** A plan's single percentage discount (admin view). `endsAt`/`remainingDays` null = no end date. */
export interface IAdminPlanDiscount {
  name: string;
  percent: number;
  /** UTC ISO */
  startsAt: string;
  endsAt: string | null;
  remainingDays: number | null;
  /** false = scheduled: startsAt hasn't arrived yet. */
  isEffectiveNow: boolean;
  /** Price after the discount, in RIALS — always show this, never compute it client-side. */
  finalPrice: number;
}

/** `GET/POST/PUT /api/admin/subscription-plans` — every amount is in RIALS (currency "IRR"). */
export interface IAdminSubscriptionPlan {
  publicId: string;
  name: string;
  description: string | null;
  durationMonths: number;
  /** RIALS */
  price: number;
  currency: string;
  maxSalons: number;
  trialDays: number;
  sortOrder: number;
  isActive: boolean;
  activeSubscriberCount: number;
  discount: IAdminPlanDiscount | null;
}

/** Create / edit a plan. `price` in RIALS. Omitted optional fields keep their value on edit. */
export interface IAdminSaveSubscriptionPlanRequest {
  name: string;
  description?: string | null;
  durationMonths: number;
  price: number;
  maxSalons?: number;
  trialDays?: number;
  sortOrder?: number;
}

/** Sets (replaces) the plan's discount. No `durationDays` = no end date; no `startsAt` = now. */
export interface IAdminSetPlanDiscountRequest {
  name: string;
  percent: number;
  durationDays?: number | null;
  startsAt?: string | null;
}

export type TAdminSubscriptionPlansEntity = TResponse<IAdminSubscriptionPlan[]>;
export type TAdminSubscriptionPlanEntity = TResponse<IAdminSubscriptionPlan>;

/** Admin platform-wide promo code — `GET/POST/PUT /api/subscriptions/promos`. Distinct from a
 * plan campaign: a promo is a code the buyer types in, not an automatic price override. */
export interface IPromoCode {
  id: number;
  code: string;
  discountType: PromoDiscountType;
  discountValue: number;
  maxRedemptions: number | null;
  usedCount: number;
  /** ISO datetime, or null for no start restriction. */
  startsAt: string | null;
  /** ISO datetime, or null for no end restriction. */
  endsAt: string | null;
  isActive: boolean;
  /** null = valid for every plan. */
  planId: number | null;
}

export interface ICreatePromoCodeRequest {
  code: string;
  discountType: PromoDiscountType;
  discountValue: number;
  maxRedemptions?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
  planId?: number | null;
}

export interface IUpdatePromoCodeRequest {
  discountType: PromoDiscountType;
  discountValue: number;
  maxRedemptions?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
}

export type TPromoCodesEntity = TResponse<IPromoCode[]>;
export type TPromoCodeEntity = TResponse<IPromoCode>;
