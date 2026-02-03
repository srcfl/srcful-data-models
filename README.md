# @srcful/data-models

TypeScript definitions for Sourceful Energy DER (Distributed Energy Resource) metadata and telemetry.

## Installation

```bash
npm install @srcful/data-models
```

## Usage

```typescript
import {
  DERType,
  V2XStatus,
  PVMetadata,
  PVTelemetry,
  BatteryMetadata,
  BatteryTelemetry,
  DERModel,
} from '@srcful/data-models';

// Define metadata (static configuration)
const pvMetadata: PVMetadata = {
  installed_power_W: 12000,
  enabled: true,
  controllable: true,
};

// Define telemetry (live measurements)
const pvTelemetry: PVTelemetry = {
  W: -7500, // Negative = generating
  mppt: [
    { V: 380, A: 12.5 },
    { V: 375, A: 7.5 },
  ],
  timestamp: Date.now(),
};
```

## DER Types

| Type | Description | Metadata | Telemetry |
|------|-------------|----------|-----------|
| **PV** | Solar panels (DC side) | `PVMetadata` | `PVTelemetry` |
| **Inverter** | AC conversion point | `InverterMetadata` | `InverterTelemetry` |
| **Battery** | Energy storage | `BatteryMetadata` | `BatteryTelemetry` |
| **Meter** | Grid connection point | `MeterMetadata` | `MeterTelemetry` |
| **V2X Charger** | Bidirectional EV charger | `V2XChargerMetadata` | `V2XChargerTelemetry` |

Inverter telemetry can optionally include DC-side measurements (`dc_W`, `dc_V`, `dc_A`) to estimate conversion losses.

## Sign Convention

| DER Type | Positive W (+) | Negative W (-) |
|----------|----------------|----------------|
| **PV** | n/a | Generation/export |
| **Battery** | Charging (import) | Discharging (export) |
| **Meter** | Import from grid | Export to grid |
| **V2X** | Charging EV (import) | V2G discharge (export) |

## Complete Models

Each DER type has a complete model combining metadata (spec) and telemetry (state):

```typescript
import { PVModel, BatteryModel } from '@srcful/data-models';

const pv: PVModel = {
  type: 'pv',
  device_sn: 'SG123456',
  spec: { /* PVMetadata */ },
  state: { /* PVTelemetry */ },
};
```

## Development

```bash
# Install dependencies
npm install

# Run playground with example data
npm run playground

# Type check
npm run typecheck

# Build
npm run build
```

## Documentation

See [device_metadata.md](./device_metadata.md) for the complete architecture documentation.

## License

MIT
