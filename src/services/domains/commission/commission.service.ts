import axiosInstance from "@/services/common/http/axios-instance";
import { API_ADDRESS } from "@/services/common/apiAddress";
import {
  TCommissionPlanEntity,
  TCommissionPlansEntity,
  TCommissionRuleEntity,
} from "./types/commission.type";

class CommissionService {
  async getPlans() {
    return await axiosInstance.get<unknown, TCommissionPlansEntity>(
      API_ADDRESS.COMMISSION.PLANS
    );
  }

  async createPlan(body: Record<string, unknown>) {
    return await axiosInstance.post<unknown, TCommissionPlanEntity>(
      API_ADDRESS.COMMISSION.PLANS,
      body
    );
  }

  async updatePlan(id: number, body: Record<string, unknown>) {
    return await axiosInstance.put<unknown, TCommissionPlanEntity>(
      API_ADDRESS.COMMISSION.PLAN_BY_ID(id),
      body
    );
  }

  async deletePlan(id: number) {
    return await axiosInstance.delete<unknown, void>(
      API_ADDRESS.COMMISSION.PLAN_BY_ID(id)
    );
  }

  async createRule(planId: number, body: Record<string, unknown>) {
    return await axiosInstance.post<unknown, TCommissionRuleEntity>(
      API_ADDRESS.COMMISSION.RULES(planId),
      body
    );
  }

  async updateRule(planId: number, ruleId: number, body: Record<string, unknown>) {
    return await axiosInstance.put<unknown, TCommissionRuleEntity>(
      API_ADDRESS.COMMISSION.RULE_BY_ID(planId, ruleId),
      body
    );
  }

  async deleteRule(planId: number, ruleId: number) {
    return await axiosInstance.delete<unknown, void>(
      API_ADDRESS.COMMISSION.RULE_BY_ID(planId, ruleId)
    );
  }
}

const commissionService = new CommissionService();
export default commissionService;

