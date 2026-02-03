/**
 * V2X Charger Status Values
 *
 * | Status          | Description                                        | Ambibox sessionState |
 * | --------------- | -------------------------------------------------- | -------------------- |
 * | `"charging"`    | Actively charging the vehicle (W > 0)              | CHARGE_LOOP          |
 * | `"discharging"` | V2G active, exporting from vehicle to grid (W < 0) | CHARGE_LOOP          |
 * | `"sleeping"`    | Paused/standby, ready to resume                    | PAUSED               |
 * | `"error"`       | Error state or stopped                             | ERROR, STOPPED       |
 * | `"unavailable"` | Not available (unplugged, initializing, etc.)      | (other)              |
 */
export enum V2XStatus {
  Charging = "charging",
  Discharging = "discharging",
  Sleeping = "sleeping",
  Error = "error",
  Unavailable = "unavailable",
}
