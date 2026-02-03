import type { BaseState } from "./common";

/**
 * Battery Metadata (static configuration)
 *
 * Static configuration for battery storage system.
 */
export interface BatteryMetadata {
  /** Max charge/discharge power (W) */
  rated_power_W: number;
  /** Total energy capacity (kWh) */
  capacity_kWh: number;
  /** Minimum allowed SoC fraction (0-1) */
  min_soc_fract?: number;
  /** Maximum allowed SoC fraction (0-1) */
  max_soc_fract?: number;
  /** Publishing enabled */
  enabled: boolean;
  /** Can accept power commands */
  controllable: boolean;
}

/**
 * Battery Telemetry (live measurements)
 *
 * Live measurements from battery storage system.
 *
 * Sign convention:
 * - Positive W (+) = Charging (import)
 * - Negative W (-) = Discharging (export)
 */
export interface BatteryTelemetry extends BaseState {
  /** Power (+charge, -discharge) (W) */
  W: number;
  /** Battery voltage (V) */
  V?: number;
  /** Current (+charge, -discharge) (A) */
  A?: number;
  /** State of charge fraction (0-1) */
  SoC_nom_fract?: number;
  /** State of health fraction (0-1) */
  SoH_fract?: number;
  /** Heatsink temperature (°C) */
  heatsink_C?: number;
  /** Max charge power now (W) */
  upper_limit_W?: number;
  /** Max discharge power now (negative) (W) */
  lower_limit_W?: number;
  /** Lifetime energy charged (Wh) */
  total_charge_Wh?: number;
  /** Lifetime energy discharged (Wh) */
  total_discharge_Wh?: number;
}

/**
 * Complete Battery Model
 *
 * DC storage, charges/discharges through inverter (or dedicated BMS).
 */
export interface BatteryModel {
  type: "battery";
  device_sn: string;
  spec: BatteryMetadata;
  state: BatteryTelemetry;
}
