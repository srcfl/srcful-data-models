/**
 * Playground - Run with: npm run playground
 *
 * Demonstrates all DER types with example data
 */

import {
  DERType,
  V2XStatus,
  type PVMetadata,
  type PVTelemetry,
  type PVModel,
  type InverterMetadata,
  type InverterTelemetry,
  type InverterModel,
  type BatteryMetadata,
  type BatteryTelemetry,
  type BatteryModel,
  type MeterMetadata,
  type MeterTelemetry,
  type MeterModel,
  type V2XChargerMetadata,
  type V2XChargerTelemetry,
  type V2XChargerModel,
  type DERModel,
} from "./index";

// ============================================================
// PV (Solar) Example
// ============================================================
const pvMetadata: PVMetadata = {
  installed_power_W: 12000,
  enabled: true,
  controllable: true,
};

const pvTelemetry: PVTelemetry = {
  W: -7500, // Negative = generating
  mppts: [
    { V: 380, A: 12.5, W: -4750 },
    { V: 375, A: 7.5, W: -2750 },
  ],
  lower_limit_W: -5000, // Curtailed to 5kW export
  total_generation_Wh: 45230000,
  timestamp: Date.now(),
};

const pvModel: PVModel = {
  type: "pv",
  device_sn: "SG123456",
  spec: pvMetadata,
  state: pvTelemetry,
};

// ============================================================
// Inverter Example
// ============================================================
const inverterMetadata: InverterMetadata = {
  rated_power_W: 10000,
  rated_power_VA: 10000,
  phases: 3,
  enabled: true,
};

const inverterTelemetry: InverterTelemetry = {
  W_AC: 7500,
  VA_AC: 7600,
  VAR_AC: 150,
  Hz_AC: 50.01,
  dc_W: 7800,
  dc_V: 480,
  dc_A: 16.25,
  L1_V_AC: 230.5,
  L1_A_AC: 10.8,
  L1_W_AC: 2500,
  L2_V_AC: 231.0,
  L2_A_AC: 10.9,
  L2_W_AC: 2520,
  L3_V_AC: 229.8,
  L3_A_AC: 10.7,
  L3_W_AC: 2480,
  heatsink_C: 45.2,
  timestamp: Date.now(),
};

const inverterModel: InverterModel = {
  type: "inverter",
  device_sn: "SG123456",
  spec: inverterMetadata,
  state: inverterTelemetry,
};

// ============================================================
// Battery Example
// ============================================================
const batteryMetadata: BatteryMetadata = {
  rated_power_W: 5000,
  capacity_kWh: 13.5,
  min_soc_fract: 0.1,
  max_soc_fract: 0.95,
  enabled: true,
  controllable: true,
};

const batteryTelemetry: BatteryTelemetry = {
  W: -2500, // Negative = discharging
  V: 52.1,
  A: -48.0,
  SoC_nom_fract: 0.65, // 65% charge
  SoH_fract: 0.92,
  temperature_C: 32.0, // battery pack temp — renamed from heatsink_C
  upper_limit_W: 5000,
  lower_limit_W: -5000,
  total_charge_Wh: 12500000,
  total_discharge_Wh: 11800000,
  available_charge_Wh: 4050000, // (max_soc - soc) × capacity = (0.95-0.65) × 13.5kWh
  available_discharge_Wh: 7425000, // (soc - min_soc) × capacity = (0.65-0.10) × 13.5kWh
  timestamp: Date.now(),
};

const batteryModel: BatteryModel = {
  type: "battery",
  device_sn: "SG123456",
  spec: batteryMetadata,
  state: batteryTelemetry,
};

// ============================================================
// Meter Example
// ============================================================
const meterMetadata: MeterMetadata = {
  enabled: true,
  phases: 3,
};

const meterTelemetry: MeterTelemetry = {
  W_AC: 1500, // Positive = importing from grid
  Hz_AC: 50.02,
  L1_V_AC: 230.5,
  L1_A_AC: 6.5,
  L1_W_AC: 500,
  L2_V_AC: 231.0,
  L2_A_AC: 6.5,
  L2_W_AC: 500,
  L3_V_AC: 229.8,
  L3_A_AC: 6.5,
  L3_W_AC: 500,
  total_import_Wh_AC: 15600000,
  total_export_Wh_AC: 8200000,
  timestamp: Date.now(),
};

const meterModel: MeterModel = {
  type: "meter",
  device_sn: "SG123456",
  spec: meterMetadata,
  state: meterTelemetry,
};

// ============================================================
// V2X Charger Example
// ============================================================
const v2xMetadata: V2XChargerMetadata = {
  max_charge_power_W: 11000,
  max_discharge_power_W: 11000,
  min_charge_power_W: 1400,
  min_discharge_power_W: 1400,
  capacity_Wh: 77000,
  enabled: true,
  controllable: true,
  bidirectional: true,
  phases: 3,
};

const v2xTelemetry: V2XChargerTelemetry = {
  W_AC: -7000, // Negative = V2G discharging
  A_AC: 30.4,
  V_AC: 230.0,
  Hz_AC: 50.01,
  W_DC: -6800,
  V_DC: 400,
  A_DC: -17,
  vehicle_soc_fract: 0.8,
  ev_target_energy_req_Wh_DC: 20000,
  ev_max_energy_req_Wh_DC: 15000,
  ev_min_energy_req_Wh_DC: 40000,
  session_charge_Wh_AC: 0,
  session_discharge_Wh_AC: 5400,
  total_charge_Wh_AC: 125000,
  total_discharge_Wh_AC: 48000,
  status: V2XStatus.Discharging,
  protocol: "ISO15118",
  control_mode: "dynamic",
  plug_connected: true,
  upper_limit_W_AC: [1400, 0, 11000],
  lower_limit_W_AC: [-11000, 0, -1400],
  timestamp: Date.now(),
};

const v2xModel: V2XChargerModel = {
  type: "v2x_charger",
  device_sn: "AMBIBOX001",
  spec: v2xMetadata,
  state: v2xTelemetry,
};

// ============================================================
// Print all models
// ============================================================
console.log("=".repeat(60));
console.log("SOURCEFUL ENERGY DATA MODELS - PLAYGROUND");
console.log("=".repeat(60));

console.log("\n📊 DER Types:", Object.values(DERType));
console.log("🔌 V2X Statuses:", Object.values(V2XStatus));

const allModels: DERModel[] = [
  pvModel,
  inverterModel,
  batteryModel,
  meterModel,
  v2xModel,
];

for (const model of allModels) {
  console.log("\n" + "-".repeat(60));
  console.log(`${model.type.toUpperCase()} (${model.device_sn})`);
  console.log("-".repeat(60));
  console.log("METADATA (spec):", JSON.stringify(model.spec, null, 2));
  console.log("TELEMETRY (state):", JSON.stringify(model.state, null, 2));
}

// ============================================================
// Example: Working with the union type
// ============================================================
console.log("\n" + "=".repeat(60));
console.log("WORKING WITH UNION TYPES");
console.log("=".repeat(60));

function describeDER(der: DERModel): string {
  // Prefer the new explicit `_AC` / `_DC` field; fall back to the
  // legacy bare field for v1.1.0-and-earlier producers.
  switch (der.type) {
    case "pv": {
      const w = der.state.W_DC ?? der.state.W ?? 0;
      return `PV generating ${Math.abs(w)}W from ${der.spec.installed_power_W}W capacity`;
    }
    case "inverter": {
      const w = der.state.W_AC ?? der.state.W ?? 0;
      return `Inverter outputting ${w}W AC (${der.spec.phases}-phase)`;
    }
    case "battery": {
      const w = der.state.W_DC ?? der.state.W ?? 0;
      const action = w < 0 ? "discharging" : "charging";
      return `Battery ${action} at ${Math.abs(w)}W, SoC: ${((der.state.SoC_nom_fract ?? 0) * 100).toFixed(0)}%`;
    }
    case "meter": {
      const w = der.state.W_AC ?? der.state.W ?? 0;
      const direction = w > 0 ? "importing" : "exporting";
      return `Meter ${direction} ${Math.abs(w)}W`;
    }
    case "v2x_charger":
      return `V2X Charger: ${der.state.status}, vehicle at ${((der.state.vehicle_soc_fract ?? 0) * 100).toFixed(0)}% SoC`;
  }
}

for (const model of allModels) {
  console.log(`  • ${describeDER(model)}`);
}

console.log("\n✅ Playground complete!\n");
