import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import {
  ICreateOfferingRequest,
  ICreatePricingRuleRequest,
  IStaffServicesSyncRequest,
  IUpdateOfferingRequest,
  TCatalogOfferingEntity,
  TCatalogOfferingsEntity,
  TCatalogStaffServicesEntity,
  TPricingRuleEntity,
  TPricingRulesEntity,
} from "./types/catalog.type";

class CatalogService {
  async getOfferings(includeInactive = true) {
    return await axiosInstance.get<unknown, TCatalogOfferingsEntity>(
      API_ADDRESS.CATALOG.OFFERINGS,
      { params: { includeInactive } }
    );
  }

  async getOfferingById(id: number) {
    return await axiosInstance.get<unknown, TCatalogOfferingEntity>(
      API_ADDRESS.CATALOG.OFFERING_BY_ID(id)
    );
  }

  async createOffering(body: ICreateOfferingRequest) {
    return await axiosInstance.post<unknown, TCatalogOfferingEntity>(
      API_ADDRESS.CATALOG.OFFERINGS,
      body
    );
  }

  async updateOffering(id: number, body: IUpdateOfferingRequest) {
    return await axiosInstance.put<unknown, TCatalogOfferingEntity>(
      API_ADDRESS.CATALOG.OFFERING_BY_ID(id),
      body
    );
  }

  async patchOfferingActive(id: number, isActive: boolean) {
    return await axiosInstance.patch<unknown, void>(
      API_ADDRESS.CATALOG.OFFERING_ACTIVE(id),
      null,
      { params: { isActive } }
    );
  }

  async deleteOffering(id: number) {
    return await axiosInstance.delete<unknown, void>(
      API_ADDRESS.CATALOG.OFFERING_BY_ID(id)
    );
  }

  async getStaffServices(staffMemberId: number) {
    return await axiosInstance.get<unknown, TCatalogStaffServicesEntity>(
      API_ADDRESS.CATALOG.STAFF_SERVICES(staffMemberId)
    );
  }

  async syncStaffServices(
    staffMemberId: number,
    body: IStaffServicesSyncRequest
  ) {
    return await axiosInstance.put<unknown, TCatalogStaffServicesEntity>(
      API_ADDRESS.CATALOG.STAFF_SERVICES(staffMemberId),
      body
    );
  }

  async getPricingRules() {
    return await axiosInstance.get<unknown, TPricingRulesEntity>(
      API_ADDRESS.CATALOG.PRICING_RULES
    );
  }

  async createPricingRule(body: ICreatePricingRuleRequest) {
    return await axiosInstance.post<unknown, TPricingRuleEntity>(
      API_ADDRESS.CATALOG.PRICING_RULES,
      body
    );
  }

  async updatePricingRule(id: number, body: Record<string, unknown>) {
    return await axiosInstance.put<unknown, TPricingRuleEntity>(
      API_ADDRESS.CATALOG.PRICING_RULE_BY_ID(id),
      body
    );
  }

  async deletePricingRule(id: number) {
    return await axiosInstance.delete<unknown, void>(
      API_ADDRESS.CATALOG.PRICING_RULE_BY_ID(id)
    );
  }
}

const catalogService = new CatalogService();
export default catalogService;

