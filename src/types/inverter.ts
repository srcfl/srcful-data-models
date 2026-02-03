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
  /** Current AC active power (W) */
  W: number;
  /** Current AC apparent power (VA) */
  VA?: number;
  /** Current AC reactive power (VAR) */
  VAR?: number;
  /** AC frequency (Hz) */
  Hz?: number;
  /** DC input power (W) */
  dc_W?: number;
  /** DC input voltage (V) */
  dc_V?: number;
  /** DC input current (A) */
  dc_A?: number;
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
