import type { BaseState, ThreePhaseState } from "./common";

/**
 * Meter Metadata (static configuration)
 *
 * Static configuration for grid meter.
 */
export interface MeterMetadata {
  /** Publishing enabled */
  enabled: boolean;
  /** Number of phases (1 or 3) */
  phases?: number;
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
  /**
   * @deprecated since 1.2.0 — use `W_AC`.
   *
   * Grid active power (+import / -export, W).  Kept as an optional
   * alias for backwards compatibility; producers SHOULD emit `W_AC`.
   */
  W?: number;
  /** @deprecated since 1.2.0 — use `Hz_AC` */
  Hz?: number;
  /** @deprecated since 1.2.0 — use `total_import_Wh_AC` */
  total_import_Wh?: number;
  /** @deprecated since 1.2.0 — use `total_export_Wh_AC` */
  total_export_Wh?: number;
  /** Grid active power (AC; +import / -export) */
  W_AC?: number;
  /** Grid frequency (AC) */
  Hz_AC?: number;
  /** Lifetime grid import (AC) */
  total_import_Wh_AC?: number;
  /** Lifetime grid export (AC) */
  total_export_Wh_AC?: number;
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
