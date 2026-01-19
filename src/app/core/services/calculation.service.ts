import { Injectable, inject } from '@angular/core';

import { VentPart, createVentPart, Machine, SquarePartType } from '@core/models';
import { TesDataService } from './tes-data.service';
import { SessionService } from './session.service';

/**
 * Service for calculating norm hours (NH) for ventilation work.
 * Contains the core TES calculation logic.
 */
@Injectable({ providedIn: 'root' })
export class CalculationService {
  private tesData = inject(TesDataService);
  private session = inject(SessionService);

  /**
   * Calculate norm hours for round/machine parts.
   *
   * @param machine - The machine/part category
   * @param size - Selected size
   * @param amount - Quantity installed
   * @param typeIndex - Index of the sub-type (for displayType 2/3)
   */
  calculateMachinePart(
    machine: Machine,
    size: number,
    amount: number,
    typeIndex = 0
  ): VentPart {
    const ventData = machine.types[typeIndex];
    const nhValue = ventData?.sizes[size] ?? 0;
    const normHours = nhValue * amount;

    // Format size display based on display type
    let sizeDisplay: string;
    switch (machine.displayType) {
      case 3:
        // Per-piece, no size display
        sizeDisplay = '';
        break;
      case 4:
        sizeDisplay = `${size} kg`;
        break;
      case 5:
        sizeDisplay = `${size} mm`;
        break;
      default:
        sizeDisplay = machine.sizeUnit === 'm³/s'
          ? `${size} m³/s`
          : `${size} ${machine.sizeUnit}`;
    }

    // Build type display name
    const typeName = ventData?.name ?? machine.name;
    const subTypeName = machine.types.length > 1 ? ventData?.name : undefined;

    return createVentPart({
      date: this.session.workDate().getTime(),
      person: this.session.workerName(),
      size,
      type: machine.name,
      subType: subTypeName !== machine.name ? subTypeName : undefined,
      amount,
      normHours,
      sizeDisplay,
      unit: ventData?.unit ?? 'tk',
    });
  }

  /**
   * Calculate norm hours for square ventilation parts.
   * Uses perimeter-based calculation for duct, area-based for grilles.
   *
   * @param widthMm - Width in millimeters
   * @param heightMm - Height in millimeters
   * @param amount - Quantity (usually meters of duct or pieces)
   * @param partType - Square part type configuration
   */
  calculateSquarePart(
    widthMm: number,
    heightMm: number,
    amount: number,
    partType: SquarePartType
  ): VentPart {
    let normHours: number;
    let sizeDisplay = `${widthMm} x ${heightMm} mm`;

    if (partType.areaBrackets) {
      // Area-based calculation (for grilles/rest)
      const areaM2 = (widthMm / 1000) * (heightMm / 1000);

      // Find the appropriate NH bracket
      const brackets = Object.entries(partType.areaBrackets)
        .map(([nh, maxArea]) => ({ nh: Number(nh), maxArea: Number(maxArea) }))
        .sort((a, b) => a.maxArea - b.maxArea);

      const bracket = brackets.find((b) => b.maxArea >= areaM2);
      const nhPerPiece = bracket?.nh ?? brackets[brackets.length - 1]?.nh ?? 0;

      normHours = nhPerPiece * amount;
    } else {
      // Perimeter-based calculation (for ducts)
      // Side perimeter in meters for 1m length of duct
      const perimeterM = ((widthMm + heightMm) * 2) / 1000;
      const multiplier = partType.multiplier ?? 0;

      normHours = multiplier * perimeterM * amount;
    }

    return createVentPart({
      date: this.session.workDate().getTime(),
      person: this.session.workerName(),
      size: (widthMm / 1000) * (heightMm / 1000), // Store area in m2
      type: partType.name,
      amount,
      normHours,
      sizeDisplay,
      unit: partType.areaBrackets ? 'tk' : 'm',
    });
  }

  /**
   * Format decimal hours to human-readable string.
   * Returns format like "2h 30min" or "45min"
   */
  formatNormHours(hours: number): string {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);

    if (wholeHours < 1) {
      return `${minutes}min`;
    }

    if (minutes === 0) {
      return `${wholeHours}h`;
    }

    return `${wholeHours}h ${minutes}min`;
  }

  /**
   * Calculate monetary value from norm hours.
   */
  calculateValue(normHours: number): number {
    return normHours * this.tesData.rates.normHourFactor;
  }
}
