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
  /**
   * @deprecated since 1.2.0 — use `W_DC`.
   *
   * Power (W; +charge / -discharge, Sourceful sign).  Kept as an
   * optional alias for backwards compatibility.
   */
  W?: number;
  /** @deprecated since 1.2.0 — use `V_DC` */
  V?: number;
  /** @deprecated since 1.2.0 — use `A_DC` */
  A?: number;
  /** Battery power (DC; +charge / -discharge, Sourceful sign) */
  W_DC?: number;
  /** Battery voltage (DC) */
  V_DC?: number;
  /** Battery current (DC; +charge / -discharge) */
  A_DC?: number;
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
  /** @deprecated since 1.2.0 — use `upper_limit_W_DC` */
  upper_limit_W?: number;
  /** @deprecated since 1.2.0 — use `lower_limit_W_DC` */
  lower_limit_W?: number;
  /** Max instantaneous charge power right now (DC; ≥ 0) */
  upper_limit_W_DC?: number;
  /** Max instantaneous discharge power right now (DC; ≤ 0) */
  lower_limit_W_DC?: number;
  /** @deprecated since 1.2.0 — use `total_charge_Wh_DC` */
  total_charge_Wh?: number;
  /** @deprecated since 1.2.0 — use `total_discharge_Wh_DC` */
  total_discharge_Wh?: number;
  /** @deprecated since 1.2.0 — use `available_charge_Wh_DC` */
  available_charge_Wh?: number;
  /** @deprecated since 1.2.0 — use `available_discharge_Wh_DC` */
  available_discharge_Wh?: number;
  /** Lifetime energy charged (DC) */
  total_charge_Wh_DC?: number;
  /** Lifetime energy discharged (DC) */
  total_discharge_Wh_DC?: number;
  /**
   * Available energy headroom in the charge direction (DC; ≥ 0).
   *
   * "How many Wh the battery can still absorb before hitting the
   * upper SoC band edge".  Driver-emitted, or derived from
   * `(SoC_max − SoC_now) × capacity` when the BMS doesn't report
   * it directly.  Flower maps to `energy_downwards`.
   */
  available_charge_Wh_DC?: number;
  /**
   * Available energy headroom in the discharge direction (DC; ≥ 0).
   *
   * "How many Wh the battery can still deliver before hitting the
   * lower SoC band edge".  Flower maps to `energy_upwards`.
   */
  available_discharge_Wh_DC?: number;
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
