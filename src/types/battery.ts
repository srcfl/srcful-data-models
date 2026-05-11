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
  /** Power (W; +charge / -discharge, Sourceful sign) */
  W: number;
  /** Battery voltage (V) */
  V?: number;
  /** Battery current (A; +charge / -discharge) */
  A?: number;
  /** State of charge (fraction 0..1, nominal capacity basis) */
  SoC_nom_fract?: number;
  /** State of health (fraction 0..1) */
  SoH_fract?: number;
  /**
   * Battery cell / pack temperature (°C).
   *
   * This is NOT a heatsink — a battery is a chemical cell stack with
   * its own thermal sensors.  Inverter heatsink temperature lives on
   * `InverterTelemetry.heatsink_C`.
   */
  temperature_C?: number;
  /** Max instantaneous charge power right now (W; ≥ 0) */
  upper_limit_W?: number;
  /** Max instantaneous discharge power right now (W; ≤ 0) */
  lower_limit_W?: number;
  /** Lifetime energy charged (Wh) */
  total_charge_Wh?: number;
  /** Lifetime energy discharged (Wh) */
  total_discharge_Wh?: number;
  /**
   * Available energy headroom in the charge direction (Wh; ≥ 0).
   *
   * "How many Wh the battery can still absorb before hitting the
   * upper SoC band edge".  Driver-emitted, or derived from
   * `(SoC_max − SoC_now) × capacity` when the BMS doesn't report
   * it directly.  Flower maps to `energy_downwards`.
   */
  available_charge_Wh?: number;
  /**
   * Available energy headroom in the discharge direction (Wh; ≥ 0).
   *
   * "How many Wh the battery can still deliver before hitting the
   * lower SoC band edge".  Flower maps to `energy_upwards`.
   */
  available_discharge_Wh?: number;
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
