import { TResponse } from "@/services/common/data-types/SharedDataTypes";

/** Reference data comes only from the API (OpenStreetMap, ODbL) — never hardcoded here. */
export interface IProvince {
  publicId: string;
  name: string;
}

export interface ICity {
  publicId: string;
  name: string;
  provincePublicId: string;
  provinceName: string;
  /** The city's centre point in the source data (map centering only), not its boundary. */
  latitude: number;
  longitude: number;
  /** false = no districts on file yet: search covers the whole city. */
  hasDistricts: boolean;
}

export interface IDistrict {
  publicId: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface ILocationPreference {
  city: ICity;
  district?: IDistrict | null;
  updatedAt: string;
}

export interface ISaveLocationPreferenceRequest {
  cityPublicId: string;
  /** Omit = the whole city. */
  districtPublicId?: string;
}

export type TProvincesEntity = TResponse<IProvince[]>;
export type TCitiesEntity = TResponse<ICity[]>;
export type TDistrictsEntity = TResponse<IDistrict[]>;
export type TLocationPreferenceEntity = TResponse<ILocationPreference> | undefined;
