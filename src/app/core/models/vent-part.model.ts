/**
 * Represents a single ventilation work entry in the work log.
 * Each entry records a specific piece of work done by a worker.
 */
export interface VentPart {
  /** Unique identifier for this work entry */
  id: string;

  /** Timestamp when the work was recorded (milliseconds since epoch) */
  date: number;

  /** Name of the worker who performed the work */
  person: string;

  /** Numeric size value (diameter in mm for round, area for square) */
  size: number;

  /** Type/category of the ventilation part */
  type: string;

  /** Sub-type if applicable (for machines with multiple sub-categories) */
  subType?: string;

  /** Quantity of parts installed */
  amount: number;

  /** Calculated norm hours (NH) for this work */
  normHours: number;

  /** Human-readable size display (e.g., "100 mm" or "200 x 300 mm") */
  sizeDisplay: string;

  /** Unit of measurement (e.g., "tk", "m", "m3/s") */
  unit: string;

  /** Associated company ID (optional) */
  companyId?: string | null;

  /** Associated company name (optional) */
  companyName?: string | null;
}

/**
 * Creates a new VentPart with a generated ID.
 */
export function createVentPart(
  data: Omit<VentPart, 'id'>
): VentPart {
  return {
    ...data,
    id: crypto.randomUUID(),
  };
}
