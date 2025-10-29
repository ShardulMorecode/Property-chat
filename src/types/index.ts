export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  properties?: PropertyResult[];
}

export interface PropertyResult {
  project_id: string;
  project_name: string;
  project_type: string;
  status: string;
  bhk_type: string;
  price_min: number;
  price_max: number;
  carpet_area_min: number;
  carpet_area_max: number;
  address: string;
  landmark: string;
  pincode: string;
  bathrooms: number;
  balcony: number;
  possession_date: string;
  project_summary: string;
}

export interface SearchFilters {
  projectName?: string;
  bhk?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string; // READY_TO_MOVE or UNDER_CONSTRUCTION
  city?: string;
  locality?: string;
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  message: string;
  properties: PropertyResult[];
  filters: SearchFilters;
}