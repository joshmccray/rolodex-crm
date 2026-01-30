import { Request } from 'express';

export interface JWTPayload {
  userId: string;
  organizationId: string;
  role: 'owner' | 'admin' | 'agent';
  email: string;
}

export interface AuthenticatedRequest extends Request {
  ctx: {
    userId: string;
    organizationId: string;
    role: 'owner' | 'admin' | 'agent';
    email: string;
  };
}

export interface SparkTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

export interface SparkListing {
  ListingKey: string;
  StandardStatus: string;
  ClosePrice?: number;
  CloseDate?: string;
  ListPrice?: number;
  StreetNumber?: string;
  StreetDirPrefix?: string;
  StreetName?: string;
  StreetSuffix?: string;
  City?: string;
  StateOrProvince?: string;
  PostalCode?: string;
  Latitude?: number;
  Longitude?: number;
  BedroomsTotal?: number;
  BathroomsTotalInteger?: number;
  LivingArea?: number;
  YearBuilt?: number;
  PropertySubType?: string;
  DaysOnMarket?: number;
  Media?: Array<{ MediaURL: string }>;
}

export interface RentCastAVMResponse {
  price: number;
  priceRangeLow: number;
  priceRangeHigh: number;
  pricePerSquareFoot?: number;
  comparables?: RentCastComparable[];
  subjectProperty?: RentCastProperty;
}

export interface RentCastComparable {
  id: string;
  formattedAddress: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  price: number;
  squareFootage: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  distance: number;
  saleDate?: string;
}

export interface RentCastProperty {
  id: string;
  formattedAddress: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  county: string;
  latitude: number;
  longitude: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  lotSize?: number;
  yearBuilt: number;
  assessedValue?: number;
  lastSaleDate?: string;
  lastSalePrice?: number;
  ownerOccupied?: boolean;
}

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

export interface CreateOrganizationInput {
  name: string;
  slug: string;
  mlsRegion?: string;
  ownerEmail: string;
  ownerName: string;
  ownerPassword: string;
}

export interface CreateLeadInput {
  name: string;
  email?: string;
  phone?: string;
  propertyAddress: string;
  propertyCity?: string;
  propertyState?: string;
  propertyZip?: string;
  temperature?: 'hot' | 'warm' | 'cold';
  leadType?: 'buying' | 'selling' | 'both';
  priceRangeLow?: number;
  priceRangeHigh?: number;
  notifyNearbySales?: boolean;
  notifyValueChanges?: boolean;
  searchRadiusMiles?: number;
  alertFrequency?: string;
  notes?: string;
}

export interface UpdateLeadInput extends Partial<CreateLeadInput> {
  latitude?: number;
  longitude?: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}
