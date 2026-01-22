/**
 * TES (Talotekniikka LVI) configuration types.
 * These define the structure for ventilation part data and norm hour calculations.
 */

/**
 * Size-to-norm-hours lookup table.
 * Keys are sizes (in mm, m3/s, kg, etc.), values are norm hours.
 */
export interface SizeNormHoursMap {
  [size: number]: number;
}

/**
 * Ventilation data for a specific part type.
 * Contains the size-to-NH lookup table and unit information.
 */
export interface VentData {
  /** Display name for this part type */
  name: string;

  /** Unit of measurement (e.g., "tk", "m", "m3/s") */
  unit: string;

  /** Size-to-norm-hours lookup table */
  sizes: SizeNormHoursMap;
}

export type DisplayType =
  | 'standard'      // Size selector only
  | 'with-subtype'  // Size + sub-type selector
  | 'subtype-only'  // Sub-type only
  | 'weight'        // Weight-based sizing
  | 'length';       // Length-based sizing

/**
 * Machine/part category with associated types and sizing.
 */
export interface Machine {
  /** Display name for this machine category */
  name: string;

  /** Unit suffix for display (e.g., "mm", "m3/s", "kg") */
  sizeUnit: string;

  /** Display type controlling UI behavior */
  displayType: DisplayType;

  /** Available part types within this category */
  types: VentData[];
}

/**
 * Square ventilation part type.
 * Uses perimeter-based or area-based calculation.
 */
export interface SquarePartType {
  /** Display name */
  name: string;

  /** Multiplier for perimeter-based NH calculation */
  multiplier?: number;

  /** Area bracket lookup for "Rest" type (NH -> max area in m2) */
  areaBrackets?: SizeNormHoursMap;
}

/**
 * Navigation category for the app tabs.
 */
export interface NavCategory {
  /** Translation key for display name */
  nameKey: string;

  /** Router path */
  path: string;

  /** Material icon name */
  icon: string;
}

/**
 * Complete TES configuration loaded from JSON.
 */
export interface TesConfig {
  /** TES agreement version info */
  version: {
    agreement: string;
    year: number;
  };

  /** Rate factors */
  rates: {
    normHourFactor: number;
    insulationMoneyFactor: number;
    payGroup3Base: number;
  };

  /** Round ventilation parts */
  roundParts: Machine[];

  /** Machine/equipment parts */
  machineParts: Machine[];

  /** Square ventilation part types */
  squareParts: SquarePartType[];

  /** Navigation categories */
  categories: NavCategory[];
}
