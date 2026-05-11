/**
 * Common types shared across DER models
 */

/**
 * MPPT (Maximum Power Point Tracking) input data.
 *
 * All fields are optional — some drivers report only per-MPPT power
 * (`W`), others report per-MPPT voltage + current (`V`/`A`) without
 * power, and a few report all three.  Consumers should treat absence
 * as "device doesn't expose this", not "value is zero".
 *
 * Naming convention (v1.2.0+): MPPT inputs are DC.  Explicit `_DC`
 * suffixed fields are the canonical names going forward.  The bare
 * `V`/`A`/`W` fields are kept as `@deprecated` aliases for backwards
 * compatibility — both forms are valid; producers SHOULD emit the
 * `_DC` form, consumers SHOULD accept either.
 */
export interface MPPT {
  /** @deprecated since 1.2.0 — use `V_DC` */
  V?: number;
  /** @deprecated since 1.2.0 — use `A_DC` */
  A?: number;
  /**
   * @deprecated since 1.2.0 — use `W_DC`.
   *
   * Sourceful sign convention: negative = generating (current flows
   * OUT of the PV input towards the inverter).
   */
  W?: number;
  /** Input voltage (DC) */
  V_DC?: number;
  /** Input current (DC) */
  A_DC?: number;
  /**
   * Input power (DC).
   *
   * Sourceful sign convention: negative = generating (current flows
   * OUT of the PV input towards the inverter).
   */
  W_DC?: number;
}

/**
 * Base spec fields shared by most DER types
 */
export interface BaseSpec {
  /** Publishing enabled */
  enabled: boolean;
}

/**
 * Base state fields shared by most DER types
 */
export interface BaseState {
  /** Measurement time — Unix epoch in **milliseconds** */
  timestamp: number;
}

/**
 * Three-phase voltage, current, and power measurements (AC side).
 *
 * Naming convention (v1.2.0+): AC fields carry an explicit `_AC`
 * suffix.  The bare `L*_V`/`L*_A`/`L*_W` fields are kept as
 * `@deprecated` aliases for backwards compatibility — both forms
 * are valid; producers SHOULD emit the `_AC` form, consumers SHOULD
 * accept either.
 */
export interface ThreePhaseState {
  /** @deprecated since 1.2.0 — use `L1_V_AC` */
  L1_V?: number;
  /** @deprecated since 1.2.0 — use `L1_A_AC` */
  L1_A?: number;
  /** @deprecated since 1.2.0 — use `L1_W_AC` */
  L1_W?: number;
  /** @deprecated since 1.2.0 — use `L2_V_AC` */
  L2_V?: number;
  /** @deprecated since 1.2.0 — use `L2_A_AC` */
  L2_A?: number;
  /** @deprecated since 1.2.0 — use `L2_W_AC` */
  L2_W?: number;
  /** @deprecated since 1.2.0 — use `L3_V_AC` */
  L3_V?: number;
  /** @deprecated since 1.2.0 — use `L3_A_AC` */
  L3_A?: number;
  /** @deprecated since 1.2.0 — use `L3_W_AC` */
  L3_W?: number;
  /** Phase 1 voltage (AC) */
  L1_V_AC?: number;
  /** Phase 1 current (AC) */
  L1_A_AC?: number;
  /** Phase 1 active power (AC) */
  L1_W_AC?: number;
  /** Phase 2 voltage (AC) */
  L2_V_AC?: number;
  /** Phase 2 current (AC) */
  L2_A_AC?: number;
  /** Phase 2 active power (AC) */
  L2_W_AC?: number;
  /** Phase 3 voltage (AC) */
  L3_V_AC?: number;
  /** Phase 3 current (AC) */
  L3_A_AC?: number;
  /** Phase 3 active power (AC) */
  L3_W_AC?: number;
}
