// RMA Enriched Data Type
export interface RMAEnriched {
  rma_id: string;
  sku_id: string;
  site_id: string;
  reason_code: string;
  rma_date: string;
  under_warranty: boolean;
  vendor: string;
  category: string;
  technology: string;
  unit_weight_kg: number;
  unit_volume_m3: number;
  std_cost_usd: number;
  supplier_nominal_lead_time_days: number;
  region: string;
  country: string;
  site_type: string;
  operator: string;
  latitude: number;
  longitude: number;
}

// Sites Enriched Data Type
export interface SiteEnriched {
  site_id: string;
  region: string;
  country: string;
  site_type: string;
  operator: string;
  latitude: number;
  longitude: number;
  DOA: number;
  FIRMWARE: number;
  INTERMITTENT: number;
  MECH_DAMAGE: number;
  NO_POWER: number;
  OTHER: number;
  OVERHEAT: number;
  RF_FAULT: number;
}

// SKU Health Data Type
export interface SKUHealth {
  sku_id: string;
  total_returns: number;
  avg_inventory: number;
  total_shipped_qty: number;
  failure_rate: number;
  vendor: string;
  category: string;
  technology: string;
  unit_weight_kg: number;
  unit_volume_m3: number;
  std_cost_usd: number;
  supplier_nominal_lead_time_days: number;
  DOA: number;
  FIRMWARE: number;
  INTERMITTENT: number;
  MECH_DAMAGE: number;
  NO_POWER: number;
  OTHER: number;
  OVERHEAT: number;
  RF_FAULT: number;
}

// Anomalies Data Type
export interface Anomaly {
  site_id: string;
  rma_date: string;
  rma_count: number;
  rolling_mean: number;
  rolling_std: number;
  z_score: number;
  deviation: number;
  pct_change: number;
  severity: 'Critical' | 'High' | 'Medium' | 'Normal';
  consecutive_count: number;
  region: string;
  site_type: string;
  country: string;
  operator: string;
  week_number: number;
  year: number;
}

// Reason Codes Union Type
export type ReasonCode = "DOA" | "FIRMWARE" | "INTERMITTENT" | "MECH_DAMAGE" | "NO_POWER" | "OTHER" | "OVERHEAT" | "RF_FAULT";

// Regions Union Type
export type Region = "APAC" | "EMEA" | "AMER";

// Site Types Union Type
export type SiteType = "Cell Site" | "Warehouse" | "Integration Center";

// Technology Types Union Type
export type Technology = "4G" | "5G" | "Dual (4G/5G)";
