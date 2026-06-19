"use client";

import { createContext, useContext } from "react";

const FormLoadingContext = createContext(false);

export function FormLoadingProvider({
  children,
  isLoading,
}: {
  children: React.ReactNode;
  isLoading: boolean;
}) {
  return (
    <FormLoadingContext.Provider value={isLoading}>
      {children}
    </FormLoadingContext.Provider>
  );
}

export function useFormLoading() {
  return useContext(FormLoadingContext);
}
