import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Machine, SquarePartType } from '@core/models';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CalculationService } from './calculation.service';
import { SessionService } from './session.service';
import { TesDataService } from './tes-data.service';

describe('CalculationService', () => {
  let service: CalculationService;
  let mockSession: {
    workDate: ReturnType<typeof vi.fn>;
    workerName: ReturnType<typeof vi.fn>;
  };
  let mockTesData: {
    rates: any;
  };

  beforeEach(() => {
    mockSession = {
      workDate: vi.fn(() => new Date('2025-01-01')),
      workerName: vi.fn(() => 'Test Worker'),
    };

    mockTesData = {
      rates: {
        normHourFactor: 20.0, // Easy number for math
        insulationMoneyFactor: 5.0,
        payGroup3Base: 15.0,
      },
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        CalculationService,
        { provide: SessionService, useValue: mockSession },
        { provide: TesDataService, useValue: mockTesData },
      ],
    });
    service = TestBed.inject(CalculationService);
  });

  describe('calculateMachinePart', () => {
    it('should calculate NH correctly for simple machine part', () => {
      const machine: Machine = {
        name: 'TestMachine',
        types: [
          {
            name: 'Standard',
            sizes: { 100: 1.5, 125: 2.0 },
            unit: 'tk',
          },
        ],
        sizeUnit: 'mm',
        displayType: 'standard',
      };

      // Size 100, amount 2 -> NH 1.5 * 2 = 3.0
      const result = service.calculateMachinePart(machine, 100, 2, 0);

      expect(result.normHours).toBe(3.0);
      expect(result.sizeDisplay).toBe('100 mm');
      expect(result.type).toBe('TestMachine');
      expect(result.amount).toBe(2);
    });

    it('should handle weight display type', () => {
      const machine: Machine = {
        name: 'WeightItem',
        types: [
          {
            name: 'Standard',
            sizes: { 10: 0.1 },
            unit: 'kg',
          },
        ],
        sizeUnit: 'kg',
        displayType: 'weight',
      };

      const result = service.calculateMachinePart(machine, 10, 5, 0);
      expect(result.sizeDisplay).toBe('10 kg');
    });

    it('should handle subtypes', () => {
      const machine: Machine = {
        name: 'ComplexMachine',
        types: [
          { name: 'Type A', sizes: { 100: 1.0 }, unit: 'tk' },
          { name: 'Type B', sizes: { 100: 2.0 }, unit: 'tk' },
        ],
        sizeUnit: 'mm',
        displayType: 'standard',
      };

      // Type B (index 1), size 100 -> NH 2.0
      const result = service.calculateMachinePart(machine, 100, 1, 1);

      expect(result.normHours).toBe(2.0);
      expect(result.subType).toBe('Type B');
    });
  });

  describe('calculateSquarePart', () => {
    it('should use perimeter multiplier calculation for ducts', () => {
      const partType: SquarePartType = {
        name: 'Duct',
        multiplier: 2.0, // 2.0 NH per meter of perimeter
      };

      // Width 500mm, Height 500mm -> Perimeter = (0.5+0.5)*2 = 2.0m
      // Amount 10m
      // NH = 2.0 (m) * 2.0 (factor) * 10 (amount) = 40.0
      const result = service.calculateSquarePart(500, 500, 10, partType);

      expect(result.normHours).toBe(40.0);
      expect(result.unit).toBe('m');
      expect(result.sizeDisplay).toBe('500 x 500 mm');
    });

    it('should use area brackets for grilles', () => {
      const partType: SquarePartType = {
        name: 'Grille',
        areaBrackets: {
          0.5: 0.1, // Up to 0.1m2 -> 0.5 NH
          1.0: 0.2, // Up to 0.2m2 -> 1.0 NH
        },
      };

      // 200x200mm = 0.04m2 -> Should match first bracket (<=0.1) -> 0.5 NH per piece
      const result = service.calculateSquarePart(200, 200, 5, partType);

      // 5 pieces * 0.5 NH = 2.5
      expect(result.normHours).toBe(2.5);
      expect(result.unit).toBe('tk');
    });

    it('should use largest bracket if area exceeds all', () => {
      const partType: SquarePartType = {
        name: 'Grille',
        areaBrackets: {
          1.0: 0.1,
        },
      };

      // 1000x1000mm = 1.0m2 -> Exceeds 0.1 -> Should use last bracket (1.0 NH) ???
      // Logic check:
      // brackets.find(b => b.maxArea >= areaM2)
      // if 1.0m2 > 0.1, find returns undefined.
      // fallback: brackets[brackets.length - 1]

      const result = service.calculateSquarePart(1000, 1000, 1, partType);
      expect(result.normHours).toBe(1.0);
    });
  });

  describe('formatNormHours', () => {
    it('should format minutes only', () => {
      expect(service.formatNormHours(0.5)).toBe('30min');
      expect(service.formatNormHours(0.75)).toBe('45min');
    });

    it('should format whole hours', () => {
      expect(service.formatNormHours(1.0)).toBe('1h');
      expect(service.formatNormHours(2.0)).toBe('2h');
    });

    it('should format hours and minutes', () => {
      expect(service.formatNormHours(1.5)).toBe('1h 30min');
      expect(service.formatNormHours(1.25)).toBe('1h 15min');
    });
  });

  describe('calculateValue', () => {
    it('should multiply NH by factor from TesData', () => {
      // Mock factor was 20.0
      expect(service.calculateValue(5.0)).toBe(100.0);
    });
  });
});
