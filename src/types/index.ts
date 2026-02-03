// Common types
export type { MPPT, BaseState, ThreePhaseState } from "./common";

// PV types
export type { PVMetadata, PVTelemetry, PVModel } from "./pv";

// Inverter types
export type {
  InverterMetadata,
  InverterTelemetry,
  InverterModel,
} from "./inverter";

// Battery types
export type { BatteryMetadata, BatteryTelemetry, BatteryModel } from "./battery";

// Meter types
export type { MeterMetadata, MeterTelemetry, MeterModel } from "./meter";

// V2X Charger types
export type {
  V2XChargerMetadata,
  V2XChargerTelemetry,
  V2XChargerModel,
} from "./v2x-charger";

// Union types for all DER models
import type { PVModel } from "./pv";
import type { InverterModel } from "./inverter";
import type { BatteryModel } from "./battery";
import type { MeterModel } from "./meter";
import type { V2XChargerModel } from "./v2x-charger";

/**
 * Union type for all complete DER models
 */
export type DERModel =
  | PVModel
  | InverterModel
  | BatteryModel
  | MeterModel
  | V2XChargerModel;

/**
 * Device configuration as persisted to storage
 */
export interface DeviceConfig {
  type: string;
  ip?: string;
  port?: number;
  unit_id?: number;
  profile?: string;
  sn: string;
  ders: DERConfigEntry[];
}

/**
 * DER configuration entry in device config
 */
export interface DERConfigEntry {
  type: string;
  enabled: boolean;
  rated_power?: number;
  installed_power?: number;
  capacity?: number;
}
