import type { BaseState, MPPT } from "./common";

/**
 * PV Metadata (static configuration) - DC Side
 *
 * Static configuration for solar PV system.
 * Represents the DC solar generation - the panels and MPPT inputs.
 */
export interface PVMetadata {
  /** Total panel DC capacity (W) */
  installed_power_W: number;
  /** Publishing enabled */
  enabled: boolean;
  /** Can accept curtailment commands */
  controllable: boolean;
}

/**
 * PV Telemetry (live measurements) - DC Side
 *
 * Live measurements from solar PV system.
 *
 * Sign convention: PV generation is negative W (export direction).
 * `lower_limit_W` limits how much can be exported (curtailment).
 *
 * `heatsink_C` does NOT live here — heatsink temperature is a
 * property of the inverter's AC-conversion stage, not the PV array.
 * See `InverterTelemetry.heatsink_C`.
 */
export interface PVTelemetry extends BaseState {
  /**
   * @deprecated since 1.2.0 — use `W_DC`.
   *
   * Current power (W; negative = generating, Sourceful sign).  Kept
   * as an optional alias for backwards compatibility.
   */
  W?: number;
  /** @deprecated since 1.2.0 — use `lower_limit_W_DC` */
  lower_limit_W?: number;
  /** @deprecated since 1.2.0 — use `total_generation_Wh_DC` */
  total_generation_Wh?: number;
  /** Total DC PV power (negative = generating, Sourceful sign) */
  W_DC?: number;
  /** Array of MPPT inputs (length = device's MPPT count) */
  mppts?: MPPT[];
  /**
   * Curtailment limit (DC; negative — the most-negative power the
   * inverter is allowed to draw from PV).  Only meaningful for
   * controllable / dispatchable inverters.
   */
  lower_limit_W_DC?: number;
  /** Lifetime energy generated (DC) */
  total_generation_Wh_DC?: number;
}

/**
 * Complete PV Model (DC Side)
 *
 * PV represents the DC solar generation - the panels and MPPT inputs.
 * This is purely the DC side before AC conversion.
 */
export interface PVModel {
  type: "pv";
  device_sn: string;
  spec: PVMetadata;
  state: PVTelemetry;
}
