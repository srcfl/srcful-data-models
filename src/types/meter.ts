import type { BaseState, ThreePhaseState } from "./common";

/**
 * Meter Metadata (static configuration)
 *
 * Static configuration for grid meter.
 */
export interface MeterMetadata {
  /** Publishing enabled */
  enabled: boolean;
}

/**
 * Meter Telemetry (live measurements)
 *
 * Live measurements from grid connection point.
 *
 * Sign convention:
 * - Positive W (+) = Import from grid
 * - Negative W (-) = Export to grid
 */
export interface MeterTelemetry extends BaseState, ThreePhaseState {
  /** Grid power (+import, -export) (W) */
  W: number;
  /** Grid frequency (Hz) */
  Hz?: number;
  /** Lifetime grid import (Wh) */
  total_import_Wh?: number;
  /** Lifetime grid export (Wh) */
  total_export_Wh?: number;
}

/**
 * Complete Meter Model
 *
 * Grid connection point, measures net import/export.
 */
export interface MeterModel {
  type: "meter";
  device_sn: string;
  spec: MeterMetadata;
  state: MeterTelemetry;
}
