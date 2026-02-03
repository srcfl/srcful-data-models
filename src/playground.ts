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
  mppt: [
    { V: 380, A: 12.5 },
    { V: 375, A: 7.5 },
  ],
  lower_limit_W: -5000, // Curtailed to 5kW export
  heatsink_C: 42.5,
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
  W: 7500,
  VA: 7600,
  VAR: 150,
  Hz: 50.01,
  dc_W: 7800,
  dc_V: 480,
  dc_A: 16.25,
  L1_V: 230.5,
  L1_A: 10.8,
  L1_W: 2500,
  L2_V: 231.0,
  L2_A: 10.9,
  L2_W: 2520,
  L3_V: 229.8,
  L3_A: 10.7,
  L3_W: 2480,
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
  enabled: true,
  controllable: true,
};

const batteryTelemetry: BatteryTelemetry = {
  W: -2500, // Negative = discharging
  V: 52.1,
  A: -48.0,
  SoC_nom_fract: 0.65, // 65% charge
  heatsink_C: 32.0,
  upper_limit_W: 5000,
  lower_limit_W: -5000,
  total_charge_Wh: 12500000,
  total_discharge_Wh: 11800000,
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
};

const meterTelemetry: MeterTelemetry = {
  W: 1500, // Positive = importing from grid
  Hz: 50.02,
  L1_V: 230.5,
  L1_A: 6.5,
  L1_W: 500,
  L2_V: 231.0,
  L2_A: 6.5,
  L2_W: 500,
  L3_V: 229.8,
  L3_A: 6.5,
  L3_W: 500,
  total_import_Wh: 15600000,
  total_export_Wh: 8200000,
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
};

const v2xTelemetry: V2XChargerTelemetry = {
  W: -7000, // Negative = V2G discharging
  A: 30.4,
  V: 230.0,
  Hz: 50.01,
  dc_W: -6800,
  dc_V: 400,
  dc_A: -17,
  vehicle_soc_fract: 0.8,
  ev_target_energy_req_Wh: 20000,
  ev_max_energy_req_Wh: 15000,
  ev_min_energy_req_Wh: 40000,
  session_charge_Wh: 0,
  session_discharge_Wh: 5400,
  total_charge_Wh: 125000,
  total_discharge_Wh: 48000,
  status: V2XStatus.Discharging,
  protocol: "ISO15118",
  control_mode: "dynamic",
  plug_connected: true,
  upper_limit_W: [1400, 0, 11000],
  lower_limit_W: [-11000, 0, -1400],
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
  switch (der.type) {
    case "pv":
      return `PV generating ${Math.abs(der.state.W)}W from ${der.spec.installed_power_W}W capacity`;
    case "inverter":
      return `Inverter outputting ${der.state.W}W AC (${der.spec.phases}-phase)`;
    case "battery":
      const action = der.state.W < 0 ? "discharging" : "charging";
      return `Battery ${action} at ${Math.abs(der.state.W)}W, SoC: ${((der.state.SoC_nom_fract ?? 0) * 100).toFixed(0)}%`;
    case "meter":
      const direction = der.state.W > 0 ? "importing" : "exporting";
      return `Meter ${direction} ${Math.abs(der.state.W)}W`;
    case "v2x_charger":
      return `V2X Charger: ${der.state.status}, vehicle at ${((der.state.vehicle_soc_fract ?? 0) * 100).toFixed(0)}% SoC`;
  }
}

for (const model of allModels) {
  console.log(`  • ${describeDER(model)}`);
}

console.log("\n✅ Playground complete!\n");
