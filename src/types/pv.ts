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
 */
export interface PVTelemetry extends BaseState {
  /** Current power (negative = generating) (W) */
  W: number;
  /** Array of MPPT inputs (variable N) */
  mppt?: MPPT[];
  /** Max export/curtailment limit (negative) (W) */
  lower_limit_W?: number;
  /** Heatsink temperature (°C) */
  heatsink_C?: number;
  /** Lifetime energy produced (Wh) */
  total_generation_Wh?: number;
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
