import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import {
  ICheckoutRequest,
  IStartTrialRequest,
  TCheckoutEntity,
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

  async getMyInvoices() {
    return await axiosInstance.get<unknown, TPlatformInvoicesEntity>(
      API_ADDRESS.SUBSCRIPTIONS.INVOICES_ME
    );
  }
}

const subscriptionsService = new SubscriptionsService();
export default subscriptionsService;
