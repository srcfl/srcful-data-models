import type { BaseState, ThreePhaseState } from "./common";
import type { V2XStatus } from "../enums/v2x-status";

/**
 * V2X Charger Metadata (static configuration)
 *
 * Static configuration for bidirectional EV charger.
 */
export interface V2XChargerMetadata {
  /** Max charging power (W) */
  max_charge_power_W: number;
  /** Max V2G discharge power (W) */
  max_discharge_power_W: number;
  /** Min charging power (W) */
  min_charge_power_W: number;
  /** Min V2G discharge power (W) */
  min_discharge_power_W: number;
  /** EV battery capacity (Wh) */
  capacity_Wh: number;
  /** Publishing enabled */
  enabled: boolean;
  /** Can accept power commands */
  controllable: boolean;
  /** Supports V2G */
  bidirectional: boolean;
}

/**
 * V2X Charger Telemetry (live measurements)
 *
 * Live measurements from bidirectional EV charger.
 *
 * Sign convention:
 * - Positive W (+) = Charging EV (import)
 * - Negative W (-) = V2G discharge (export)
 */
export interface V2XChargerTelemetry extends BaseState, ThreePhaseState {
  /** AC power (+charge, -V2G) (W) */
  W: number;
  /** AC grid current (total) (A) */
  A?: number;
  /** AC grid voltage (average) (V) */
  V?: number;
  /** Grid frequency (Hz) */
  Hz?: number;
  /** DC power to/from EV (W) */
  dc_W?: number;
  /** DC link voltage (V) */
  dc_V?: number;
  /** DC link current (A) */
  dc_A?: number;
  /** EV state of charge (0-1) */
  vehicle_soc_fract?: number;
  /** Energy needed to reach target SoC (Wh) */
  ev_target_energy_req_Wh?: number;
  /** Empty space available for charging (Wh) */
  ev_max_energy_req_Wh?: number;
  /** Energy available for V2G export (Wh) */
  ev_min_energy_req_Wh?: number;
  /** Energy charged this session (Wh) */
  session_charge_Wh?: number;
  /** Energy discharged this session (Wh) */
  session_discharge_Wh?: number;
  /** Lifetime energy delivered to EV (Wh) */
  total_charge_Wh?: number;
  /** Lifetime energy exported (V2G) (Wh) */
  total_discharge_Wh?: number;
  /** Charger status */
  status?: V2XStatus | string;
  /** Communication protocol (e.g. ISO15118) */
  protocol?: string;
  /** scheduled (car) or dynamic (EMS) */
  control_mode?: string;
  /** Vehicle connected */
  plug_connected?: boolean;
  /** Charge limits [min, 0, max] (W) */
  upper_limit_W?: [number, number, number];
  /** Discharge limits [-max, 0, -min] (W) */
  lower_limit_W?: [number, number, number];
}

/**
 * Complete V2X Charger Model
 *
 * Bidirectional AC/DC, connects EV to grid.
 * Supports both charging and V2G (Vehicle-to-Grid) discharge.
 */
export interface V2XChargerModel {
  type: "v2x_charger";
  device_sn: string;
  spec: V2XChargerMetadata;
  state: V2XChargerTelemetry;
}
