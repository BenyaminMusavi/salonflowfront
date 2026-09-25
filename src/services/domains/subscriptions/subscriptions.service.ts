import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import {
  IAdminSaveSubscriptionPlanRequest,
  IAdminSetPlanDiscountRequest,
  ICheckoutPreviewRequest,
  ICheckoutRequest,
  ICreatePromoCodeRequest,
  IMarkInvoicePaidRequest,
  IStartTrialRequest,
  IUpdatePromoCodeRequest,
  TAdminSubscriptionPlanEntity,
  TAdminSubscriptionPlansEntity,
  TCheckoutEntity,
  TCheckoutPreviewEntity,
  TEntitlementEntity,
  TPlatformInvoicesEntity,
  TPromoCodeEntity,
  TPromoCodesEntity,
  TSubscriptionEntity,
  TSubscriptionPlansEntity,
} from "./types/subscriptions.type";

class SubscriptionsService {
  async getPlans() {
    return await axiosInstance.get<unknown, TSubscriptionPlansEntity>(
      API_ADDRESS.SUBSCRIPTIONS.PLANS
    );
  }

  /** May be 204 with no body when user has no subscription. */
  async getMe() {
    const data = await axiosInstance.get<unknown, TSubscriptionEntity | "" | null>(
      API_ADDRESS.SUBSCRIPTIONS.ME
    );
    if (data == null || data === "") {
      return { data: null } as TSubscriptionEntity;
    }
    return data as TSubscriptionEntity;
  }

  async getEntitlement() {
    return await axiosInstance.get<unknown, TEntitlementEntity>(
      API_ADDRESS.SUBSCRIPTIONS.ENTITLEMENT
    );
  }

  /** Salon-scoped entitlement — for Staff, whose own personal subscription is never purchased. */
  async getEntitlementForSalon(salonId: number) {
    return await axiosInstance.get<unknown, TEntitlementEntity>(
      `${API_ADDRESS.SUBSCRIPTIONS.ENTITLEMENT_BY_SALON}/${salonId}`
    );
  }

  async startTrial(body: IStartTrialRequest) {
    return await axiosInstance.post<unknown, TSubscriptionEntity>(
      API_ADDRESS.SUBSCRIPTIONS.TRIAL,
      body
    );
  }

  async checkout(body: ICheckoutRequest) {
    return await axiosInstance.post<unknown, TCheckoutEntity>(
      API_ADDRESS.SUBSCRIPTIONS.CHECKOUT,
      body
    );
  }

  /** Pure calculation, no invoice created — used to validate a promo code and preview its price before checkout. */
  async previewCheckout(body: ICheckoutPreviewRequest) {
    return await axiosInstance.post<unknown, TCheckoutPreviewEntity>(
      API_ADDRESS.SUBSCRIPTIONS.CHECKOUT_PREVIEW,
      body
    );
  }

  async getMyInvoices() {
    return await axiosInstance.get<unknown, TPlatformInvoicesEntity>(
      API_ADDRESS.SUBSCRIPTIONS.INVOICES_ME
    );
  }

  /** Admin-only — records payment on a platform invoice and activates the subscription. */
  async markInvoicePaid(invoiceId: number, data: IMarkInvoicePaidRequest) {
    return await axiosInstance.post<unknown, void>(
      API_ADDRESS.SUBSCRIPTIONS.INVOICE_MARK_PAID(invoiceId),
      data
    );
  }

  /* ---------- Admin: subscription plans (amounts in RIALS) ---------- */

  /** All plans, active and inactive, with subscriber counts and their discount. */
  async listAdminPlans() {
    return await axiosInstance.get<unknown, TAdminSubscriptionPlansEntity>(
      API_ADDRESS.ADMIN.SUBSCRIPTION_PLANS
    );
  }

  /** New plans are active immediately. */
  async createAdminPlan(data: IAdminSaveSubscriptionPlanRequest) {
    return await axiosInstance.post<unknown, TAdminSubscriptionPlanEntity>(
      API_ADDRESS.ADMIN.SUBSCRIPTION_PLANS,
      data
    );
  }

  /** Price/duration changes only affect future purchases. */
  async updateAdminPlan(planPublicId: string, data: IAdminSaveSubscriptionPlanRequest) {
    return await axiosInstance.put<unknown, TAdminSubscriptionPlanEntity>(
      API_ADDRESS.ADMIN.SUBSCRIPTION_PLAN_BY_ID(planPublicId),
      data
    );
  }

  async activateAdminPlan(planPublicId: string) {
    return await axiosInstance.post<unknown, TAdminSubscriptionPlanEntity>(
      API_ADDRESS.ADMIN.SUBSCRIPTION_PLAN_ACTIVATE(planPublicId)
    );
  }

  /** Hides the plan from purchase; current subscribers keep it until their period ends. */
  async deactivateAdminPlan(planPublicId: string) {
    return await axiosInstance.post<unknown, TAdminSubscriptionPlanEntity>(
      API_ADDRESS.ADMIN.SUBSCRIPTION_PLAN_DEACTIVATE(planPublicId)
    );
  }

  /** One discount per plan — setting a new one replaces the old. */
  async setAdminPlanDiscount(planPublicId: string, data: IAdminSetPlanDiscountRequest) {
    return await axiosInstance.put<unknown, TAdminSubscriptionPlanEntity>(
      API_ADDRESS.ADMIN.SUBSCRIPTION_PLAN_DISCOUNT(planPublicId),
      data
    );
  }

  async removeAdminPlanDiscount(planPublicId: string) {
    return await axiosInstance.delete<unknown, TAdminSubscriptionPlanEntity>(
      API_ADDRESS.ADMIN.SUBSCRIPTION_PLAN_DISCOUNT(planPublicId)
    );
  }

  /** Admin-only — planId filters to codes scoped to one plan, omit for all. */
  async listPromos(planId?: number) {
    return await axiosInstance.get<unknown, TPromoCodesEntity>(
      API_ADDRESS.SUBSCRIPTIONS.PROMOS,
      { params: { planId } }
    );
  }

  async createPromo(data: ICreatePromoCodeRequest) {
    return await axiosInstance.post<unknown, TPromoCodeEntity>(
      API_ADDRESS.SUBSCRIPTIONS.PROMOS,
      data
    );
  }

  async updatePromo(promoId: number, data: IUpdatePromoCodeRequest) {
    return await axiosInstance.put<unknown, TPromoCodeEntity>(
      API_ADDRESS.SUBSCRIPTIONS.PROMO_BY_ID(promoId),
      data
    );
  }

  async activatePromo(promoId: number) {
    return await axiosInstance.post<unknown, void>(
      API_ADDRESS.SUBSCRIPTIONS.PROMO_ACTIVATE(promoId)
    );
  }

  async deactivatePromo(promoId: number) {
    return await axiosInstance.post<unknown, void>(
      API_ADDRESS.SUBSCRIPTIONS.PROMO_DEACTIVATE(promoId)
    );
  }
}

const subscriptionsService = new SubscriptionsService();
export default subscriptionsService;
