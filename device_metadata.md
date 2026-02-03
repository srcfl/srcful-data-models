# Device Metadata vs Telemetry Architecture

This document explains how metadata (static configuration) is separated from telemetry (live measurements) in the firmware.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DEVICE (BaseDevice)                            │
├─────────────────────────────────┬───────────────────────────────────────────┤
│         METADATA                │              TELEMETRY                    │
│    (Static Configuration)       │          (Live Measurements)              │
├─────────────────────────────────┼───────────────────────────────────────────┤
│                                 │                                           │
│  ┌─────────────────────────┐    │    ┌─────────────────────────┐            │
│  │   PVMetadata (DC)       │    │    │     PVData (DC)         │            │
│  │  - installed_power_W    │    │    │  - W (negative=gen)     │            │
│  │  - enabled              │    │    │  - mppt[] {V, A}        │            │
│  │  - controllable         │    │    │  - lower_limit_W        │            │
│  └─────────────────────────┘    │    │  - total_generation_Wh  │            │
│                                 │    └─────────────────────────┘            │
│  ┌─────────────────────────┐    │    ┌─────────────────────────┐            │
│  │  InverterMetadata (AC)  │    │    │   InverterData (AC)     │            │
│  │  - rated_power_W        │    │    │  - W, VA, VAR, Hz       │            │
│  │  - rated_power_VA       │    │    │  - L1/L2/L3 V/A/W       │            │
│  │  - phases               │    │    │  - heatsink_C           │            │
│  │  - enabled              │    │    │                         │            │
│  └─────────────────────────┘    │    └─────────────────────────┘            │
│                                 │                                           │
│  ┌─────────────────────────┐    │    ┌─────────────────────────┐            │
│  │   BatteryMetadata       │    │    │     BatteryData         │            │
│  │  - rated_power_W        │    │    │  - W, V, A              │            │
│  │  - capacity_kWh         │    │    │  - SoC_nom_fract        │            │
│  │  - enabled, controllable│    │    │  - upper/lower_limit_W  │            │
│  └─────────────────────────┘    │    └─────────────────────────┘            │
│                                 │                                           │
│  ┌─────────────────────────┐    │    ┌─────────────────────────┐            │
│  │    MeterMetadata        │    │    │      MeterData          │            │
│  │  - enabled              │    │    │  - W, Hz                │            │
│  └─────────────────────────┘    │    │  - L1/L2/L3 V/A/W       │            │
│                                 │    │  - total_import/export  │            │
│                                 │    └─────────────────────────┘            │
│  ┌─────────────────────────┐    │    ┌─────────────────────────┐            │
│  │   V2XChargerMetadata    │    │    │    V2XChargerData       │            │
│  │  - max_charge_power_W   │    │    │  - W, dc_W              │            │
│  │  - max_discharge_power_W│    │    │  - vehicle_soc_fract    │            │
│  │  - capacity_Wh          │    │    │  - status, protocol     │            │
│  │  - enabled, controllable│    │    │  - upper/lower_limit_W  │            │
│  └─────────────────────────┘    │    └─────────────────────────┘            │
│                                 │                                           │
└─────────────────────────────────┴───────────────────────────────────────────┘
         │                                          │
         │ Persisted to SPIFFS                      │ Ephemeral (in memory)
         ▼                                          ▼
┌─────────────────────────┐              ┌─────────────────────────┐
│ /spiffs/devices/        │              │     DERData             │
│   {hash}.json           │              │  (container class)      │
│                         │              │  - holds all 5 types    │
│ {                       │              │  - created per harvest  │
│   "ders": [             │              │  - stored in            │
│     {"type":"pv",...},  │              │    latestDERData        │
│     {"type":"inverter"},│              └─────────────────────────┘
│     {"type":"battery"}, │
│     ...                 │
│   ]                     │
│ }                       │
└─────────────────────────┘
```

## DER Physical Topology

The DER types map to physical energy flow in the system:

```
                              DC Side                    AC Side
                         ┌──────────────┐          ┌──────────────┐
    ☀️ Solar Panels ────>│      PV      │ ── DC ──>│              │
                         │  (DC input)  │          │   INVERTER   │──── AC ────┐
                         │  mppt[], dc_W│          │  (AC output) │            │
                         └──────────────┘          │  W, VA, Hz   │            │
                                                   │  L1/L2/L3    │            │
                         ┌──────────────┐          │              │            │
    🔋 Battery Pack ────>│   BATTERY    │ ── DC ──>│              │            │
                         │  (storage)   │<── DC ───│              │            │
                         │  SoC, V, A   │          └──────────────┘            │
                         └──────────────┘                                      │
                                                                               │
                         ┌──────────────┐                                      │
    🚗 EV Vehicle ──────>│ V2X CHARGER  │ ───────────────── AC ────────────────┤
                         │  (bidirect)  │                                      │
                         │  dc_W, ac_W  │                                      │
                         └──────────────┘                                      │
                                                                               │
                                                   ┌──────────────┐            │
                                              ─────│    METER     │<───────────┘
                                             Grid  │ (grid point) │
                                              ─────│ import/export│
                                                   └──────────────┘
```

**Key relationships:**

- **PV** → DC generation from solar panels, measured at MPPT inputs
- **Inverter** → AC conversion point, outputs to grid, may serve PV + Battery
- **Battery** → DC storage, charges/discharges through inverter (or dedicated BMS)
- **V2X Charger** → Bidirectional AC/DC, connects EV to grid
- **Meter** → Grid connection point, measures net import/export

## Sign Convention

### Power Direction

| DER Type     | Positive W (+)         | Negative W (-)         |
| ------------ | ---------------------- | ---------------------- |
| **PV**       | n/a (always generates) | Generation/export      |
| **Inverter** | n/a                    | n/a                    |
| **Battery**  | Charging (import)      | Discharging (export)   |
| **Meter**    | Import from grid       | Export to grid         |
| **V2X**      | Charging EV (import)   | V2G discharge (export) |

**Rule of thumb:** Negative = export/generation direction, Positive = import/charge direction

### Limit Fields

| DER Type    | Limit Field     | Meaning                              |
| ----------- | --------------- | ------------------------------------ |
| **PV**      | `lower_limit_W` | Max export/curtailment (e.g. -5000W) |
| **Battery** | `upper_limit_W` | Max charge power (e.g. +5000W)       |
| **Battery** | `lower_limit_W` | Max discharge power (e.g. -5000W)    |
| **V2X**     | `upper_limit_W` | Charge limits [min, 0, max]          |
| **V2X**     | `lower_limit_W` | Discharge limits [-max, 0, -min]     |

## Data Flow

```
                                    HARVEST CYCLE (~1s)
                                           │
                                           ▼
┌──────────────┐    readHarvest()    ┌──────────────┐
│    Device    │ ──────────────────> │   Profile    │
│  (Modbus/    │                     │   decode()   │
│   MQTT/P1)   │                     └──────┬───────┘
└──────────────┘                            │
                                            │ Raw telemetry
                                            ▼
                                   ┌──────────────────┐
                                   │  Device-level    │
                                   │  limits applied  │
                                   │  (SoC thresholds)│
                                   └────────┬─────────┘
                                            │
                                            ▼
                                   ┌──────────────────┐
                                   │  Metadata limits │◄─── BatteryMetadata.ratedPowerW
                                   │  applied (if not │◄─── PVMetadata.ratedPowerW
                                   │  already set)    │
                                   └────────┬─────────┘
                                            │
                                            ▼
                                   ┌──────────────────┐
                                   │  latestDERData   │──► /api/devices/{sn}/data/json
                                   │  (snapshot)      │
                                   └────────┬─────────┘
                                            │
                                            ▼
                                   ┌──────────────────┐
                                   │ PublishHarvest   │
                                   │ Task             │
                                   └────────┬─────────┘
                                            │
                        ┌───────────────────┼───────────────────┐
                        ▼                   ▼                   ▼
               publishEnabled?      publishEnabled?      publishEnabled?
                   (PV)              (Battery)            (Meter)
                        │                   │                   │
                        ▼                   ▼                   ▼
                   ┌─────────────────────────────────────────────┐
                   │              MQTT Message Pool              │
                   │         (only enabled DERs published)       │
                   └─────────────────────────────────────────────┘
```

## Comparison Table

| Aspect           | Metadata                          | Telemetry                |
| ---------------- | --------------------------------- | ------------------------ |
| **Source**       | User configuration (API/cloud)    | Device sensors/registers |
| **Storage**      | SPIFFS (`/spiffs/devices/*.json`) | Memory only              |
| **Lifetime**     | Persists across reboots           | Lost on restart          |
| **Update freq**  | Rare (provisioning)               | Every harvest (~1s)      |
| **Example data** | `rated_power_W: 5000`             | `W: 2345`                |
| **Purpose**      | Define capabilities & limits      | Report current state     |

## Metadata Fields by DER Type

| DER Type        | Metadata Fields                                                                         | Used For                  |
| --------------- | --------------------------------------------------------------------------------------- | ------------------------- |
| **PV**          | `installed_power_W`, `enabled`, `controllable`                                          | DC capacity, curtailment  |
| **Inverter**    | `rated_power_W`, `rated_power_VA`, `phases`, `enabled`                                  | AC capacity tracking      |
| **Battery**     | `rated_power_W`, `capacity_kWh`, `enabled`, `controllable`                              | Charge/discharge limits   |
| **Meter**       | `enabled`                                                                               | Enable/disable publishing |
| **V2X Charger** | `max_charge_power_W`, `max_discharge_power_W`, `capacity_Wh`, `enabled`, `controllable` | Control validation        |

## Limit Priority

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  1. Device/Profile sets limit (SoC at threshold)                            │
│     e.g., Solis SoC=5% → lower_limit_W = 0                                  │
│     HIGHEST PRIORITY - device constraints always respected                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  2. Metadata fallback (if flag not already set)                             │
│     e.g., BatteryMetadata.ratedPowerW → upper_limit_W                       │
│     Applied by modbus_device.cpp after profile decode                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  3. No limit set (flag unset, field unused)                                 │
│     LOWEST PRIORITY - no constraint applied                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Key Files

| Component                  | File                                                 | Lines   |
| -------------------------- | ---------------------------------------------------- | ------- |
| Metadata classes           | `components/data_models/data_models.h`               | 301-416 |
| Telemetry classes          | `components/data_models/data_models.h`               | 130-299 |
| Metadata storage in device | `fw_controller/src/devices/base_device.h`            | 99-102  |
| Metadata loading           | `fw_controller/src/devices/base_device.cpp`          | 63-118  |
| Metadata → limits          | `fw_controller/src/devices/modbus/modbus_device.cpp` | 264-299 |
| Publish gating             | `fw_controller/src/tasks/publish_harvest_task.cpp`   | 19-46   |
| Config persistence         | `fw_controller/src/config/device_config_store.cpp`   | -       |

## Configuration JSON Format

Device configurations are persisted with metadata in the `ders` array:

```json
{
  "type": "modbus_tcp",
  "ip": "192.168.1.100",
  "port": 502,
  "unit_id": 1,
  "profile": "sungrow",
  "sn": "SG123456",
  "ders": [
    {
      "type": "PV",
      "enabled": true,
      "rated_power": 10000.0,
      "installed_power": 10000.0
    },
    {
      "type": "battery",
      "enabled": true,
      "rated_power": 5000.0,
      "capacity": 13.5
    },
    {
      "type": "meter",
      "enabled": true
    }
  ]
}
```

## How Metadata is Applied

In `modbus_device.cpp`, after the profile decodes raw register values into telemetry:

```cpp
// Battery limit calculation using metadata
if (batteryPtr && getBatteryMetadata().getHasType()) {
    float ratedPower = getBatteryMetadata().getRatedPowerW();

    // Only set if profile didn't already (device SoC constraints take precedence)
    if (!batteryPtr->hasFlag(dm::BatteryValueFlag::lower_limit_W)) {
        batteryPtr->lower_limit_W = (soc <= 0.05f) ? 0.0f : -ratedPower;
        batteryPtr->setFlag(dm::BatteryValueFlag::lower_limit_W);
    }

    if (!batteryPtr->hasFlag(dm::BatteryValueFlag::upper_limit_W)) {
        batteryPtr->upper_limit_W = (soc >= 0.95f) ? 0.0f : ratedPower;
        batteryPtr->setFlag(dm::BatteryValueFlag::upper_limit_W);
    }
}
```

## Publishing Gate

In `publish_harvest_task.cpp`, metadata controls what gets published:

```cpp
if (data.getPV() && device->getPVMetadata().getPublishEnabled()) {
    // Only publish PV telemetry if metadata says enabled
}
if (data.getBattery() && device->getBatteryMetadata().getPublishEnabled()) {
    // Only publish battery telemetry if metadata says enabled
}
// Same pattern for Meter and Charger
```

This ensures users can selectively enable/disable publishing of specific DER types without disconnecting the device.

---

## Complete Device Models

When building APIs or backend services, you often need both metadata (specs) and telemetry (state) together. This section defines unified models that combine both.

> **Note:** The field names below use snake_case (e.g., `rated_power_W`) which is the target format for external APIs. The firmware's internal storage format (shown in "Configuration JSON Format" above) may use slightly different names.

### Design Principles

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMPLETE DER MODEL                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────┐    ┌───────────────────────────────┐    │
│  │            SPEC               │    │            STATE              │    │
│  │       (from metadata)         │    │       (from telemetry)        │    │
│  ├───────────────────────────────┤    ├───────────────────────────────┤    │
│  │ • rated_power_W               │    │ • W (current power)           │    │
│  │ • capacity_kWh                │    │ • SoC_nom_fract               │    │
│  │ • enabled                     │    │ • V, A                        │    │
│  │ • controllable                │    │ • upper_limit_W, lower_limit_W│    │
│  └───────────────────────────────┘    └───────────────────────────────┘    │
│                                                                             │
│  spec = what the device CAN do (static, from user config)                   │
│  state = what the device IS doing (dynamic, from sensors)                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Complete PV Model (DC Side)

PV represents the DC solar generation - the panels and MPPT inputs. This is purely the DC side before AC conversion.

> **Sign convention:** PV generation is negative W (export direction). `lower_limit_W` limits how much can be exported (curtailment).

```
┌─────────────────────────────────────────────────────────────────┐
│                      PV (DC Side)                               │
├─────────────────────────────────────────────────────────────────┤
│  SPEC (metadata)           │  STATE (telemetry)                 │
│  ─────────────────────     │  ──────────────────────            │
│  installed_power_W: 12000  │  W: -7500 (generating)             │
│  enabled: true             │  mppt: [                           │
│  controllable: true        │    {V: 380, A: 12.5},              │
│                            │    {V: 375, A: 7.5}                │
│                            │  ]                                 │
│                            │  lower_limit_W: -5000 (curtailed)  │
│                            │  heatsink_C: 42.5                  │
│                            │  total_generation_Wh: 45230000     │
│                            │  timestamp: 1706284800             │
└─────────────────────────────────────────────────────────────────┘
```

**JSON Structure:**

```json
{
  "type": "pv",
  "device_sn": "SG123456",
  "spec": {
    "installed_power_W": 12000,
    "enabled": true,
    "controllable": true
  },
  "state": {
    "W": -7500,
    "mppt": [
      { "V": 380, "A": 12.5 },
      { "V": 375, "A": 7.5 }
    ],
    "lower_limit_W": -5000,
    "heatsink_C": 42.5,
    "total_generation_Wh": 45230000,
    "timestamp": 1706284800
  }
}
```

### Complete Inverter Model (AC Interface)

The Inverter is the AC conversion point - it takes DC from PV (and possibly battery) and outputs AC. This provides AC measurements and rated capacity information.

```
┌─────────────────────────────────────────────────────────────────┐
│                      INVERTER (AC Interface)                    │
├─────────────────────────────────────────────────────────────────┤
│  SPEC (metadata)           │  STATE (telemetry)                 │
│  ─────────────────────     │  ──────────────────────            │
│  rated_power_W: 10000      │  W: 7500                           │
│  rated_power_VA: 10000     │  VA: 7600                          │
│  phases: 3                 │  VAR: 150                          │
│  enabled: true             │  Hz: 50.01                         │
│                            │  L1_V: 230.5, L1_A: 10.8, L1_W: 2500│
│                            │  L2_V: 231.0, L2_A: 10.9, L2_W: 2520│
│                            │  L3_V: 229.8, L3_A: 10.7, L3_W: 2480│
│                            │  heatsink_C: 45.2                  │
│                            │  timestamp: 1706284800             │
└─────────────────────────────────────────────────────────────────┘
```

**JSON Structure:**

```json
{
  "type": "inverter",
  "device_sn": "SG123456",
  "spec": {
    "rated_power_W": 10000,
    "rated_power_VA": 10000,
    "phases": 3,
    "enabled": true
  },
  "state": {
    "W": 7500,
    "VA": 7600,
    "VAR": 150,
    "Hz": 50.01,
    "L1_V": 230.5,
    "L1_A": 10.8,
    "L1_W": 2500,
    "L2_V": 231.0,
    "L2_A": 10.9,
    "L2_W": 2520,
    "L3_V": 229.8,
    "L3_A": 10.7,
    "L3_W": 2480,
    "heatsink_C": 45.2,
    "timestamp": 1706284800
  }
}
```

### Complete Battery Model

```
┌─────────────────────────────────────────────────────────────────┐
│                       BATTERY                                   │
├─────────────────────────────────────────────────────────────────┤
│  SPEC (metadata)           │  STATE (telemetry)                 │
│  ─────────────────────     │  ──────────────────────            │
│  rated_power_W: 5000       │  W: -2500 (discharging)            │
│  capacity_kWh: 13.5        │  V: 52.1                           │
│  enabled: true             │  A: -48.0                          │
│                            │  SoC_nom_fract: 0.65               │
│                            │  heatsink_C: 32.0                  │
│                            │  upper_limit_W: 5000               │
│                            │  lower_limit_W: -5000              │
│                            │  total_charge_Wh: 12500000         │
│                            │  total_discharge_Wh: 11800000      │
│                            │  timestamp: 1706284800             │
└─────────────────────────────────────────────────────────────────┘
```

**JSON Structure:**

```json
{
  "type": "battery",
  "device_sn": "SG123456",
  "spec": {
    "rated_power_W": 5000,
    "capacity_kWh": 13.5,
    "enabled": true,
    "controllable": true
  },
  "state": {
    "W": -2500,
    "V": 52.1,
    "A": -48.0,
    "SoC_nom_fract": 0.65,
    "heatsink_C": 32.0,
    "upper_limit_W": 5000,
    "lower_limit_W": -5000,
    "total_charge_Wh": 12500000,
    "total_discharge_Wh": 11800000,
    "timestamp": 1706284800
  }
}
```

### Complete Meter Model

```
┌─────────────────────────────────────────────────────────────────┐
│                        METER                                    │
├─────────────────────────────────────────────────────────────────┤
│  SPEC (metadata)           │  STATE (telemetry)                 │
│  ─────────────────────     │  ──────────────────────            │
│  enabled: true             │  W: 1500 (importing)               │
│                            │  Hz: 50.02                         │
│                            │  L1_V: 230.5, L1_A: 6.5, L1_W: 500 │
│                            │  L2_V: 231.0, L2_A: 6.5, L2_W: 500 │
│                            │  L3_V: 229.8, L3_A: 6.5, L3_W: 500 │
│                            │  total_import_Wh: 15600000         │
│                            │  total_export_Wh: 8200000          │
│                            │  timestamp: 1706284800             │
└─────────────────────────────────────────────────────────────────┘
```

**JSON Structure:**

```json
{
  "type": "meter",
  "device_sn": "SG123456",
  "spec": {
    "enabled": true
  },
  "state": {
    "W": 1500,
    "Hz": 50.02,
    "L1_V": 230.5,
    "L1_A": 6.5,
    "L1_W": 500,
    "L2_V": 231.0,
    "L2_A": 6.5,
    "L2_W": 500,
    "L3_V": 229.8,
    "L3_A": 6.5,
    "L3_W": 500,
    "total_import_Wh": 15600000,
    "total_export_Wh": 8200000,
    "timestamp": 1706284800
  }
}
```

### Complete V2X Charger Model

```
┌─────────────────────────────────────────────────────────────────┐
│                      V2X CHARGER                                │
├─────────────────────────────────────────────────────────────────┤
│  SPEC (metadata)           │  STATE (telemetry)                 │
│  ─────────────────────     │  ──────────────────────            │
│  max_charge_power_W: 11000 │  W: -7000, A: 30.4, V: 230, Hz: 50 │
│  max_discharge_power_W:    │  dc_W: -6800, dc_V: 400, dc_A: -17 │
│    11000                   │  L1/L2/L3 V/A/W (phase values)     │
│  min_charge_power_W: 1400  │  vehicle_soc_fract: 0.80           │
│  min_discharge_power_W:    │  ev_target/max/min_energy_req_Wh   │
│    1400                    │  session_charge/discharge_Wh       │
│  capacity_Wh: 77000        │  total_charge/discharge_Wh         │
│  enabled: true             │  status: "discharging"             │
│                            │  protocol: "ISO15118"              │
│                            │  control_mode: "dynamic"           │
│                            │  plug_connected: true              │
│                            │  upper_limit_W: [1400, 0, 11000]   │
│                            │  lower_limit_W: [-11000, 0, -1400] │
└─────────────────────────────────────────────────────────────────┘
```

**JSON Structure:**

```json
{
  "type": "v2x_charger",
  "device_sn": "AMBIBOX001",
  "spec": {
    "max_charge_power_W": 11000,
    "max_discharge_power_W": 11000,
    "min_charge_power_W": 1400,
    "min_discharge_power_W": 1400,
    "capacity_Wh": 77000,
    "enabled": true,
    "controllable": true,
    "bidirectional": true
  },
  "state": {
    "W": -7000,
    "A": 30.4,
    "V": 230.0,
    "Hz": 50.01,
    "dc_W": -6800,
    "dc_V": 400,
    "dc_A": -17,
    "vehicle_soc_fract": 0.8,
    "ev_target_energy_req_Wh": 20000,
    "ev_max_energy_req_Wh": 15000,
    "ev_min_energy_req_Wh": 40000,
    "session_charge_Wh": 0,
    "session_discharge_Wh": 5400,
    "total_charge_Wh": 125000,
    "total_discharge_Wh": 48000,
    "status": "discharging",
    "protocol": "ISO15118",
    "control_mode": "dynamic",
    "plug_connected": true,
    "upper_limit_W": [1400, 0, 11000],
    "lower_limit_W": [-11000, 0, -1400],
    "timestamp": 1706284800
  }
}
```

### Field Reference Tables

#### PV Fields (DC Side)

| Category  | Field               | Type  | Unit  | Description                             |
| --------- | ------------------- | ----- | ----- | --------------------------------------- |
| **spec**  | installed_power_W   | float | W     | Total panel DC capacity                 |
| **spec**  | enabled             | bool  | -     | Publishing enabled                      |
| **spec**  | controllable        | bool  | -     | Can accept curtailment commands         |
| **state** | W                   | int   | W     | Current power (negative = generating)   |
| **state** | mppt                | array | -     | Array of MPPT inputs (variable N)       |
| **state** | mppt[].V            | float | V     | MPPT input voltage                      |
| **state** | mppt[].A            | float | A     | MPPT input current                      |
| **state** | lower_limit_W       | int32 | W     | Max export/curtailment limit (negative) |
| **state** | heatsink_C          | float | °C    | Heatsink temperature                    |
| **state** | total_generation_Wh | int64 | Wh    | Lifetime energy produced                |
| **state** | timestamp           | int64 | epoch | Measurement time                        |

#### Inverter Fields (AC Interface)

| Category  | Field          | Type  | Unit  | Description               |
| --------- | -------------- | ----- | ----- | ------------------------- |
| **spec**  | rated_power_W  | float | W     | Rated AC active power     |
| **spec**  | rated_power_VA | float | VA    | Rated AC apparent power   |
| **spec**  | phases         | int   | -     | Number of phases (1 or 3) |
| **spec**  | enabled        | bool  | -     | Publishing enabled        |
| **state** | W              | float | W     | Current AC active power   |
| **state** | VA             | float | VA    | Current AC apparent power |
| **state** | VAR            | float | VAR   | Current AC reactive power |
| **state** | Hz             | float | Hz    | AC frequency              |
| **state** | L1_V           | float | V     | Phase 1 voltage           |
| **state** | L1_A           | float | A     | Phase 1 current           |
| **state** | L1_W           | float | W     | Phase 1 power             |
| **state** | L2_V           | float | V     | Phase 2 voltage           |
| **state** | L2_A           | float | A     | Phase 2 current           |
| **state** | L2_W           | float | W     | Phase 2 power             |
| **state** | L3_V           | float | V     | Phase 3 voltage           |
| **state** | L3_A           | float | A     | Phase 3 current           |
| **state** | L3_W           | float | W     | Phase 3 power             |
| **state** | heatsink_C     | float | °C    | Heatsink temperature      |
| **state** | timestamp      | int64 | epoch | Measurement time          |

#### Battery Fields

| Category  | Field              | Type  | Unit  | Description                        |
| --------- | ------------------ | ----- | ----- | ---------------------------------- |
| **spec**  | rated_power_W      | float | W     | Max charge/discharge power         |
| **spec**  | capacity_kWh       | float | kWh   | Total energy capacity              |
| **spec**  | enabled            | bool  | -     | Publishing enabled                 |
| **spec**  | controllable       | bool  | -     | Can accept power commands          |
| **state** | W                  | int   | W     | Power (+charge, -discharge)        |
| **state** | V                  | float | V     | Battery voltage                    |
| **state** | A                  | float | A     | Current (+charge, -discharge)      |
| **state** | SoC_nom_fract      | float | 0-1   | State of charge fraction           |
| **state** | heatsink_C         | float | °C    | Heatsink temperature               |
| **state** | upper_limit_W      | int32 | W     | Max charge power now               |
| **state** | lower_limit_W      | int32 | W     | Max discharge power now (negative) |
| **state** | total_charge_Wh    | int64 | Wh    | Lifetime energy charged            |
| **state** | total_discharge_Wh | int64 | Wh    | Lifetime energy discharged         |
| **state** | timestamp          | int64 | epoch | Measurement time                   |

#### Meter Fields

| Category  | Field           | Type  | Unit  | Description                   |
| --------- | --------------- | ----- | ----- | ----------------------------- |
| **spec**  | enabled         | bool  | -     | Publishing enabled            |
| **state** | W               | int   | W     | Grid power (+import, -export) |
| **state** | Hz              | float | Hz    | Grid frequency                |
| **state** | L1_V            | float | V     | Phase 1 voltage               |
| **state** | L1_A            | float | A     | Phase 1 current               |
| **state** | L1_W            | float | W     | Phase 1 power                 |
| **state** | L2_V            | float | V     | Phase 2 voltage               |
| **state** | L2_A            | float | A     | Phase 2 current               |
| **state** | L2_W            | float | W     | Phase 2 power                 |
| **state** | L3_V            | float | V     | Phase 3 voltage               |
| **state** | L3_A            | float | A     | Phase 3 current               |
| **state** | L3_W            | float | W     | Phase 3 power                 |
| **state** | total_import_Wh | int64 | Wh    | Lifetime grid import          |
| **state** | total_export_Wh | int64 | Wh    | Lifetime grid export          |
| **state** | timestamp       | int64 | epoch | Measurement time              |

#### V2X Charger Fields

| Category  | Field                   | Type     | Unit  | Description                            |
| --------- | ----------------------- | -------- | ----- | -------------------------------------- |
| **spec**  | max_charge_power_W      | float    | W     | Max charging power                     |
| **spec**  | max_discharge_power_W   | float    | W     | Max V2G discharge power                |
| **spec**  | min_charge_power_W      | float    | W     | Min charging power                     |
| **spec**  | min_discharge_power_W   | float    | W     | Min V2G discharge power                |
| **spec**  | capacity_Wh             | float    | Wh    | EV battery capacity                    |
| **spec**  | enabled                 | bool     | -     | Publishing enabled                     |
| **spec**  | controllable            | bool     | -     | Can accept power commands              |
| **spec**  | bidirectional           | bool     | -     | Supports V2G                           |
| **state** | W                       | int32    | W     | AC power (+charge, -V2G)               |
| **state** | A                       | float    | A     | AC grid current (total)                |
| **state** | V                       | float    | V     | AC grid voltage (average)              |
| **state** | Hz                      | float    | Hz    | Grid frequency                         |
| **state** | dc_W                    | int32    | W     | DC power to/from EV                    |
| **state** | dc_V                    | float    | V     | DC link voltage                        |
| **state** | dc_A                    | float    | A     | DC link current                        |
| **state** | L1_V                    | float    | V     | Phase 1 voltage                        |
| **state** | L1_A                    | float    | A     | Phase 1 current                        |
| **state** | L1_W                    | float    | W     | Phase 1 power                          |
| **state** | L2_V                    | float    | V     | Phase 2 voltage                        |
| **state** | L2_A                    | float    | A     | Phase 2 current                        |
| **state** | L2_W                    | float    | W     | Phase 2 power                          |
| **state** | L3_V                    | float    | V     | Phase 3 voltage                        |
| **state** | L3_A                    | float    | A     | Phase 3 current                        |
| **state** | L3_W                    | float    | W     | Phase 3 power                          |
| **state** | vehicle_soc_fract       | float    | 0-1   | EV state of charge                     |
| **state** | ev_target_energy_req_Wh | int32    | Wh    | Energy needed to reach target SoC      |
| **state** | ev_max_energy_req_Wh    | int32    | Wh    | Empty space available for charging     |
| **state** | ev_min_energy_req_Wh    | int32    | Wh    | Energy available for V2G export        |
| **state** | session_charge_Wh       | int32    | Wh    | Energy charged this session            |
| **state** | session_discharge_Wh    | int32    | Wh    | Energy discharged this session         |
| **state** | total_charge_Wh         | int32    | Wh    | Lifetime energy delivered to EV        |
| **state** | total_discharge_Wh      | int32    | Wh    | Lifetime energy exported (V2G)         |
| **state** | status                  | string   | -     | Charger status                         |
| **state** | protocol                | string   | -     | Communication protocol (e.g. ISO15118) |
| **state** | control_mode            | string   | -     | scheduled (car) or dynamic (EMS)       |
| **state** | plug_connected          | bool     | -     | Vehicle connected                      |
| **state** | upper_limit_W           | int32[3] | W     | Charge limits [min,0,max]              |
| **state** | lower_limit_W           | int32[3] | W     | Discharge limits [-max,0,-min]         |
| **state** | timestamp               | int64    | epoch | Measurement time                       |

#### V2X Charger Status Values

| Status          | Description                                        | Ambibox sessionState |
| --------------- | -------------------------------------------------- | -------------------- |
| `"charging"`    | Actively charging the vehicle (W > 0)              | CHARGE_LOOP          |
| `"discharging"` | V2G active, exporting from vehicle to grid (W < 0) | CHARGE_LOOP          |
| `"sleeping"`    | Paused/standby, ready to resume                    | PAUSED               |
| `"error"`       | Error state or stopped                             | ERROR, STOPPED       |
| `"unavailable"` | Not available (unplugged, initializing, etc.)      | (other)              |

### Implementation Notes

1. **spec** fields come from user configuration (metadata) - rarely change
2. **state** fields come from device telemetry - update every harvest cycle
3. Use actual field names as sent by firmware - see [Sourceful Data Models](https://docs.sourceful.energy/developer/data-models)
4. Consider exposing a `/api/devices/{sn}/complete` endpoint returning this unified model
5. Backend services can subscribe to telemetry and merge with cached metadata per DER
