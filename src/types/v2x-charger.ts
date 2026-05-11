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
  /** Number of phases (1 or 3) */
  phases?: number;
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
  // ── AC side (charger grid interface) ────────────────────────────
  /**
   * @deprecated since 1.2.0 — use `W_AC`.
   *
   * AC active power (+charge / -V2G).  Kept as an optional alias
   * for backwards compatibility.
   */
  W?: number;
  /** @deprecated since 1.2.0 — use `A_AC` */
  A?: number;
  /** @deprecated since 1.2.0 — use `V_AC` */
  V?: number;
  /** @deprecated since 1.2.0 — use `Hz_AC` */
  Hz?: number;
  /** AC active power total (+charge / -V2G) */
  W_AC?: number;
  /** AC grid current total */
  A_AC?: number;
  /** AC grid voltage (average across phases) */
  V_AC?: number;
  /** AC grid frequency */
  Hz_AC?: number;

  // ── DC side (charger ↔ EV) ──────────────────────────────────────
  /** @deprecated since 1.2.0 — use `W_DC` */
  dc_W?: number;
  /** @deprecated since 1.2.0 — use `V_DC` */
  dc_V?: number;
  /** @deprecated since 1.2.0 — use `A_DC` */
  dc_A?: number;
  /** DC power to/from EV */
  W_DC?: number;
  /** DC link voltage */
  V_DC?: number;
  /** DC link current */
  A_DC?: number;

  // ── EV state ────────────────────────────────────────────────────
  /** EV state of charge (fraction 0..1) */
  vehicle_soc_fract?: number;
  /** @deprecated since 1.2.0 — use `ev_target_energy_req_Wh_DC` */
  ev_target_energy_req_Wh?: number;
  /** @deprecated since 1.2.0 — use `ev_max_energy_req_Wh_DC` */
  ev_max_energy_req_Wh?: number;
  /** @deprecated since 1.2.0 — use `ev_min_energy_req_Wh_DC` */
  ev_min_energy_req_Wh?: number;
  /** Energy needed to reach target SoC (DC, EV-side) */
  ev_target_energy_req_Wh_DC?: number;
  /** Empty space available for charging (DC, EV-side) */
  ev_max_energy_req_Wh_DC?: number;
  /** Energy available for V2G export (DC, EV-side) */
  ev_min_energy_req_Wh_DC?: number;

  // ── Session + lifetime energy ───────────────────────────────────
  // Convention: charger-AC-grid energy carries `_AC` (what the meter
  // would see).  EV-side stored energy uses `_DC` (what the BMS reports).
  // Charging-session totals are reported at the AC-side cut here.
  /** @deprecated since 1.2.0 — use `session_charge_Wh_AC` */
  session_charge_Wh?: number;
  /** @deprecated since 1.2.0 — use `session_discharge_Wh_AC` */
  session_discharge_Wh?: number;
  /** @deprecated since 1.2.0 — use `total_charge_Wh_AC` */
  total_charge_Wh?: number;
  /** @deprecated since 1.2.0 — use `total_discharge_Wh_AC` */
  total_discharge_Wh?: number;
  /** Energy charged this session (AC, grid-side) */
  session_charge_Wh_AC?: number;
  /** Energy discharged this session (AC, grid-side) */
  session_discharge_Wh_AC?: number;
  /** Lifetime energy delivered to EV (AC, grid-side) */
  total_charge_Wh_AC?: number;
  /** Lifetime energy exported (V2G) (AC, grid-side) */
  total_discharge_Wh_AC?: number;

  // ── Charger status / control ────────────────────────────────────
  /** Charger status */
  status?: V2XStatus | string;
  /** Communication protocol (e.g. ISO15118) */
  protocol?: string;
  /** scheduled (car) or dynamic (EMS) */
  control_mode?: string;
  /** Vehicle connected */
  plug_connected?: boolean;
  /** @deprecated since 1.2.0 — use `upper_limit_W_AC` */
  upper_limit_W?: [number, number, number];
  /** @deprecated since 1.2.0 — use `lower_limit_W_AC` */
  lower_limit_W?: [number, number, number];
  /** Charge limits [min, 0, max] (AC; W) */
  upper_limit_W_AC?: [number, number, number];
  /** Discharge limits [-max, 0, -min] (AC; W) */
  lower_limit_W_AC?: [number, number, number];
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
