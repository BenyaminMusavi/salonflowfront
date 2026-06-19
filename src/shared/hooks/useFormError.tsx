"use client";

import * as React from "react";

interface IFormErrorContext {
  generalError: string;
  setGeneralError: (error: string) => void;
  clearError: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const FormErrorContext = React.createContext<IFormErrorContext | undefined>(
  undefined,
);

interface IFormErrorProviderProps {
  children: React.ReactNode;
}

export function FormErrorProvider({ children }: IFormErrorProviderProps) {
  const [generalError, setGeneralError] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const clearError = React.useCallback(() => {
    setGeneralError("");
  }, []);

  const value = React.useMemo(
    () => ({ generalError, setGeneralError, clearError, isLoading, setIsLoading }),
    [generalError, clearError, isLoading],
  );

  return (
    <FormErrorContext.Provider value={value}>
      {children}
    </FormErrorContext.Provider>
  );
}

export function useFormError(): IFormErrorContext {
  const context = React.useContext(FormErrorContext);
  if (!context) {
    throw new Error("useFormError must be used within a FormErrorProvider");
  }
  return context;
}
