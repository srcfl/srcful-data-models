/**
 * Common types shared across DER models
 */

/**
 * MPPT (Maximum Power Point Tracking) input data
 */
export interface MPPT {
  /** MPPT input voltage */
  V: number;
  /** MPPT input current */
  A: number;
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
  /** Measurement time (epoch) */
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
