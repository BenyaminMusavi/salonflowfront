"use client";

import { create } from "zustand";
import type { ICustomer } from "../types/customers.type";

interface ICustomerPreviewState {
  byPublicId: Record<string, Pick<ICustomer, "publicId" | "fullName" | "phone">>;
  remember: (customer: Pick<ICustomer, "publicId" | "fullName" | "phone">) => void;
}

/**
 * In-memory name/phone of customers picked from the list, so the customer page can show them
 * (there is no "customer by publicId" endpoint yet). Never persisted and never put in a URL.
 */
export const useCustomerPreviewStore = create<ICustomerPreviewState>((set) => ({
  byPublicId: {},
  remember: (customer) =>
    set((s) => ({ byPublicId: { ...s.byPublicId, [customer.publicId]: customer } })),
}));
