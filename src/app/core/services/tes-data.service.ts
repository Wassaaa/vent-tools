import { Injectable, inject, resource } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { TesConfig, Machine, SquarePartType } from '@core/models';

/**
 * Service for loading and accessing TES configuration data.
 * Uses Angular's resource API for async data fetching.
 */
@Injectable({ providedIn: 'root' })
export class TesDataService {
  private http = inject(HttpClient);

  /** Resource that loads TES configuration from JSON */
  readonly configResource = resource({
    loader: () =>
      this.http.get<TesConfig>('/assets/data/tes-config.json').toPromise() as Promise<TesConfig>,
  });

  /** Get the loaded TES config (or undefined if not loaded) */
  get config(): TesConfig | undefined {
    return this.configResource.value();
  }

  /** Get round parts data */
  get roundParts(): Machine[] {
    return this.config?.roundParts ?? [];
  }

  /** Get machine parts data */
  get machineParts(): Machine[] {
    return this.config?.machineParts ?? [];
  }

  /** Get square parts data */
  get squareParts(): SquarePartType[] {
    return this.config?.squareParts ?? [];
  }

  /** Get rates */
  get rates() {
    return this.config?.rates ?? {
      normHourFactor: 19.10,
      insulationMoneyFactor: 4.23,
      payGroup3Base: 18.93,
    };
  }

  /**
   * Get available sizes for a machine type.
   * Returns sorted array of size numbers.
   */
  getSizesForMachine(machine: Machine, typeIndex = 0): number[] {
    const ventData = machine.types[typeIndex];
    if (!ventData) return [];

    return Object.keys(ventData.sizes)
      .map(Number)
      .sort((a, b) => a - b);
  }

  /**
   * Get norm hours for a specific size.
   */
  getNormHours(machine: Machine, size: number, typeIndex = 0): number {
    const ventData = machine.types[typeIndex];
    if (!ventData) return 0;

    return ventData.sizes[size] ?? 0;
  }
}
