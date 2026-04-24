
export type TFile = {
  previewUrl: string;
  originalUrl: string;
  id: string;
};

export type TProvider = {
  id: number;
  name: string;
  logo: TFile;
};

export type TResponse<T> = {
  data: T;
  links?: TLink;
  serverTime?: string;
  meta?: TMeta;
};

export type TMeta = {
  currentPage?: number;
  from?: number;
  lastPage?: number;
  path?: string;
  perPage?: number;
  total?: number;
  to?: number;
};

export type TEditable = {
  editable: string[];
};

type TLink = {
  first: string;
  last: string;
  prev: string;
  next: string;
};

export type TPaginationParam = {
  page?: number;
  limit?: number;
};

export type TGeneralError = {
  data?: TError;
  status: number;
};

export enum TErrorTypeEnum {
  'validation_error' = 'validation_error',
  'inquiry_error' = 'inquiry_error',
  'authentication_error' = 'authentication_error',
  'server_error' = 'server_error',
  'suspended' = 'suspended',
  // ----------- for seller select account card --------------
  'order_not_exists' = 'order_not_exists',
  'credit_account_required' = 'credit_account_required',
}

export type TError = {
  errors?: FieldErrors;
  message?: string;
  type: TErrorTypeEnum;
};

interface FieldErrors {
  [key: string]: string[];
}

export type TEmptyResponse = {};

export type TIdAndName = {
  id: number;
  name: string;
};

export interface IHasNextStep {
  onNextStep?: () => void;
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
