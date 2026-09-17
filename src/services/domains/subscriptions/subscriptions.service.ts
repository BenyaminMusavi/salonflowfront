import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import {
  ICheckoutPreviewRequest,
  ICheckoutRequest,
  ICreatePlanCampaignRequest,
  ICreatePromoCodeRequest,
  IMarkInvoicePaidRequest,
  IStartTrialRequest,
  IUpdatePlanCampaignRequest,
  IUpdatePromoCodeRequest,
  TCheckoutEntity,
  TCheckoutPreviewEntity,
  TEntitlementEntity,
  TPlanCampaignEntity,
  TPlanCampaignsEntity,
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

  /** Admin-only — planId filters to one plan's campaigns, omit for all. */
  async listCampaigns(planId?: number) {
    return await axiosInstance.get<unknown, TPlanCampaignsEntity>(
      API_ADDRESS.SUBSCRIPTIONS.CAMPAIGNS,
      { params: { planId } }
    );
  }

  async createCampaign(data: ICreatePlanCampaignRequest) {
    return await axiosInstance.post<unknown, TPlanCampaignEntity>(
      API_ADDRESS.SUBSCRIPTIONS.CAMPAIGNS,
      data
    );
  }

  async updateCampaign(campaignId: number, data: IUpdatePlanCampaignRequest) {
    return await axiosInstance.put<unknown, TPlanCampaignEntity>(
      API_ADDRESS.SUBSCRIPTIONS.CAMPAIGN_BY_ID(campaignId),
      data
    );
  }

  async activateCampaign(campaignId: number) {
    return await axiosInstance.post<unknown, void>(
      API_ADDRESS.SUBSCRIPTIONS.CAMPAIGN_ACTIVATE(campaignId)
    );
  }

  async deactivateCampaign(campaignId: number) {
    return await axiosInstance.post<unknown, void>(
      API_ADDRESS.SUBSCRIPTIONS.CAMPAIGN_DEACTIVATE(campaignId)
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
