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
 */
export interface MPPT {
  /** Input voltage (V) */
  V?: number;
  /** Input current (A) */
  A?: number;
  /**
   * Input power (W).
   *
   * Sourceful sign convention: negative = generating (current flows
   * OUT of the PV input towards the inverter).
   */
  W?: number;
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
 * Three-phase voltage, current, and power measurements
 */
export interface ThreePhaseState {
  /** Phase 1 voltage */
  L1_V?: number;
  /** Phase 1 current */
  L1_A?: number;
  /** Phase 1 power */
  L1_W?: number;
  /** Phase 2 voltage */
  L2_V?: number;
  /** Phase 2 current */
  L2_A?: number;
  /** Phase 2 power */
  L2_W?: number;
  /** Phase 3 voltage */
  L3_V?: number;
  /** Phase 3 current */
  L3_A?: number;
  /** Phase 3 power */
  L3_W?: number;
}
