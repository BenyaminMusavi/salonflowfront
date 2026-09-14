import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import {
  ICheckoutPreviewRequest,
  ICheckoutRequest,
  IMarkInvoicePaidRequest,
  IStartTrialRequest,
  TCheckoutEntity,
  TCheckoutPreviewEntity,
  TEntitlementEntity,
  TPlatformInvoicesEntity,
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
}

const subscriptionsService = new SubscriptionsService();
export default subscriptionsService;
