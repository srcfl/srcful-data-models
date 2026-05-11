import type { BaseState, ThreePhaseState } from "./common";

/**
 * Inverter Metadata (static configuration) - AC Interface
 *
 * Static configuration for the inverter.
 * The Inverter is the AC conversion point - it takes DC from PV
 * (and possibly battery) and outputs AC.
 */
export interface InverterMetadata {
  /** Rated AC active power (W) */
  rated_power_W: number;
  /** Rated AC apparent power (VA) */
  rated_power_VA: number;
  /** Number of phases (1 or 3) */
  phases: number;
  /** Publishing enabled */
  enabled: boolean;
}

/**
 * Inverter Telemetry (live measurements) - AC Interface
 *
 * Live measurements from the inverter.
 * Provides AC measurements and rated capacity information.
 */
export interface InverterTelemetry extends BaseState, ThreePhaseState {
  /** @deprecated since 1.2.0 — use `W_AC` */
  W?: number;
  /** @deprecated since 1.2.0 — use `VA_AC` */
  VA?: number;
  /** @deprecated since 1.2.0 — use `VAR_AC` */
  VAR?: number;
  /** @deprecated since 1.2.0 — use `Hz_AC` */
  Hz?: number;
  /** @deprecated since 1.2.0 — use `W_DC` */
  dc_W?: number;
  /** @deprecated since 1.2.0 — use `V_DC` */
  dc_V?: number;
  /** @deprecated since 1.2.0 — use `A_DC` */
  dc_A?: number;
  /** AC active power total */
  W_AC?: number;
  /** AC apparent power total */
  VA_AC?: number;
  /** AC reactive power total */
  VAR_AC?: number;
  /** AC frequency */
  Hz_AC?: number;
  /** DC input power */
  W_DC?: number;
  /** DC input voltage */
  V_DC?: number;
  /** DC input current */
  A_DC?: number;
  /** Heatsink temperature (°C) */
  heatsink_C?: number;
}

/**
 * Complete Inverter Model (AC Interface)
 *
 * The Inverter is the AC conversion point - it takes DC from PV
 * (and possibly battery) and outputs AC. This provides AC measurements
 * and rated capacity information.
 */
export interface InverterModel {
  type: "inverter";
  device_sn: string;
  spec: InverterMetadata;
  state: InverterTelemetry;
}
