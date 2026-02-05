# Zap Gateway Request/Response API

This document describes how to communicate with a Zap gateway using the WebSocket request/response pattern.

## WebSocket Connection

### Endpoint
```
ws://mainnet.srcful.dev/reqresp/{gatewayId}
```

Example: `ws://mainnet.srcful.dev/reqresp/zap-0000f0878290a994`

### Authentication Headers
Include these headers on the WebSocket handshake:
```
x-auth-message: <your-auth-message>
x-auth-signature: <your-signature>
x-auth-method: apiKey
```

### Request Format
Send a JSON message with this structure:
```json
{
  "id": "<unique-request-id>",
  "method": "GET",
  "path": "/api/devices",
  "headers": {},
  "body": {},
  "timestamp": 1706123456789
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for this request (used to match response) |
| `method` | string | HTTP verb: `GET`, `POST`, `DELETE` |
| `path` | string | Endpoint path on the gateway |
| `headers` | object | Optional headers |
| `body` | object | Request body (for POST) |
| `timestamp` | number | Current epoch time in milliseconds. **Requests older than ~100 minutes are rejected.** |

### Response Format
The gateway responds with:
```json
{
  "id": "<same-request-id>",
  "timestamp": 1706123456800,
  "code": 200,
  "response": { ... }
}
```

---

## Available API Endpoints

### System
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/system` | System info (version, uptime, memory) |
| `POST` | `/api/system/reboot` | Reboot the gateway |
| `POST` | `/api/system/factory-reset` | Factory reset (clears all config and devices) |
| `POST` | `/api/system/log_stream` | Enable/disable log streaming |

### WiFi
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/wifi` | WiFi status and configured network |
| `POST` | `/api/wifi` | Configure WiFi credentials |
| `DELETE` | `/api/wifi` | Reset WiFi configuration |
| `GET` | `/api/wifi/scan` | Trigger WiFi scan (results in GET /api/wifi) |

### Devices
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/devices` | List all configured devices |
| `POST` | `/api/devices` | Create a new device |
| `DELETE` | `/api/devices` | Delete ALL devices |
| `DELETE` | `/api/devices/{sn}` | Delete device by serial number |
| `GET` | `/api/devices/supported` | List supported device types/models |
| `GET` | `/api/devices/types` | List connection types and parameters |
| `GET` | `/api/devices/{sn}/data/json` | Get latest data from device |
| `GET` | `/api/devices/{sn}/ders` | Get DER metadata for device |
| `POST` | `/api/devices/{sn}/ders` | Set DER metadata for device |
| `POST` | `/api/devices/{sn}/types` | Update publish flags for device |

### Registers (Modbus)
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/devices/{sn}/registers/{addr}` | Read register(s) |
| `POST` | `/api/devices/{sn}/registers/{addr}` | Write to register |
| `POST` | `/api/devices/{sn}/registers` | Batch write registers |
| `POST` | `/api/devices/{sn}/write` | Write single register (simplified) |

### Device Control
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/control/{sn}/init` | Initialize device control |
| `POST` | `/api/control/{sn}/battery` | Battery control command |
| `POST` | `/api/control/{sn}/curtail` | Curtail power output |
| `POST` | `/api/control/{sn}/curtail/disable` | Disable curtailment |
| `POST` | `/api/control/{sn}/deinit` | Deinitialize device control |

### Crypto
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/crypto` | Get public key and device ID |
| `POST` | `/api/crypto/sign` | Sign a message with device key |

### Other
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/name` | Get device name/ID |
| `GET` | `/api/debug` | Debug information |
| `POST` | `/api/echo` | Echo back the request (testing) |
| `POST` | `/api/ble/stop` | Stop BLE advertising |
| `GET` | `/api/ota/status` | OTA update status |
| `POST` | `/api/ota/update` | Trigger OTA update |

### P1 Meter Data (if P1 reader connected)
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/data/p1/obis` | P1 data in OBIS format |
| `GET` | `/api/data/p1/json` | P1 data in JSON format |

---

## DER Types

| DER Type | String Value | Description |
|----------|--------------|-------------|
| PV | `"pv"` | Solar/photovoltaic inverter |
| Battery | `"battery"` | Battery storage system |
| Meter | `"meter"` | Energy meter |
| V2X Charger | `"v2x_charger"` | Vehicle-to-grid charger |

---

## Connection Types

| Type | String Value | Description |
|------|--------------|-------------|
| Modbus TCP | `"modbus_tcp"` | Modbus over TCP/IP |
| Modbus RTU | `"modbus_rtu"` | Modbus over RS485 serial |
| MQTT | `"mqtt"` | MQTT broker connection |
| P1 UART | `"p1_uart"` | P1 port (DSMR) serial connection |

---

## Device Configuration Examples

### POST /api/devices

#### Modbus TCP
```json
{
  "type": "modbus_tcp",
  "ip": "192.168.1.60",
  "port": 502,
  "unit_id": 1,
  "profile": "sungrow"
}
```

#### Modbus RTU
```json
{
  "type": "modbus_rtu",
  "baud_rate": 9600,
  "unit_id": 1,
  "profile": "sungrow",
  "parity": 0
}
```

#### P1 UART
```json
{
  "type": "p1_uart",
  "baud_rate": 115200,
  "data_bits": 8,
  "parity": "none",
  "stop_bits": 1
}
```

#### MQTT (Ferroamp)
```json
{
  "type": "mqtt",
  "profile": "ferroamp",
  "broker_host": "192.168.1.70",
  "broker_port": 1883,
  "username": "extapi",
  "password": "your_password"
}
```

#### MQTT (Ambibox V2X Charger)
```json
{
  "type": "mqtt",
  "profile": "ambibox",
  "broker_host": "192.168.1.70",
  "broker_port": 1884,
  "username": "external-ems",
  "password": "your_password"
}
```

### Response (201)
```json
{
  "message": "Device added and connected",
  "sn": "INV003SIM03",
  "ders": [
    { "type": "pv", "enabled": false, "rated_power": 0, "installed_power": 0 },
    { "type": "battery", "enabled": false, "rated_power": 0, "capacity": 0 },
    { "type": "meter", "enabled": false }
  ]
}
```

---

## POST /api/devices/{sn}/ders

Updates DER metadata for a device.

### Request Body
```json
{
  "ders": [
    { "type": "pv", "enabled": true, "rated_power": 6000.0, "installed_power": 5500.0 },
    { "type": "battery", "enabled": true, "rated_power": 5000.0, "capacity": 10.0 },
    { "type": "meter", "enabled": true },
    { "type": "v2x_charger", "enabled": true, "capacity": 75000.0 }
  ]
}
```

### Fields by DER Type

| Type | Field | Type | Description |
|------|-------|------|-------------|
| `pv` | `enabled` | bool | Enable/disable telemetry publishing |
| | `rated_power` | float | Rated power in Watts |
| | `installed_power` | float | Installed power in Watts |
| `battery` | `enabled` | bool | Enable/disable telemetry publishing |
| | `rated_power` | float | Rated power in Watts |
| | `capacity` | float | Capacity in kWh |
| `meter` | `enabled` | bool | Enable/disable telemetry publishing |
| `v2x_charger` | `enabled` | bool | Enable/disable telemetry publishing |
| | `capacity` | float | Capacity in Wh |

---

## Available Profiles

### Inverters (Modbus)
| Profile | Display Name | Connection Types |
|---------|--------------|------------------|
| `sungrow` | Sungrow | modbus_tcp, modbus_rtu |
| `solis` | Solis | modbus_tcp, modbus_rtu |
| `solaredge` | SolarEdge | modbus_tcp |
| `sma` | SMA | modbus_tcp |
| `huawei` | Huawei | modbus_tcp, modbus_rtu |
| `fronius` | Fronius | modbus_tcp |
| `deye` | Deye | modbus_tcp, modbus_rtu |
| `pixii` | Pixii | modbus_tcp |

### Meters (Modbus)
| Profile | Display Name | Connection Types |
|---------|--------------|------------------|
| `sdm630` | Eastron SDM630 | modbus_tcp, modbus_rtu |

### Meters (UART)
| Profile | Display Name | Connection Types |
|---------|--------------|------------------|
| (auto) | P1 Meter | p1_uart |

### Inverters (MQTT)
| Profile | Display Name | Connection Types |
|---------|--------------|------------------|
| `ferroamp` | Ferroamp EnergyHub | mqtt |

### EV Chargers (MQTT)
| Profile | Display Name | Connection Types |
|---------|--------------|------------------|
| `ambibox` | Ambibox | mqtt |
