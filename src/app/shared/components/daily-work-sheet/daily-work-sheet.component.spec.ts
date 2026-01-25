import { DecimalPipe } from '@angular/common';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PreferencesService } from '@core/services';
import { provideTransloco, TranslocoLoader } from '@jsverse/transloco';
import { DurationPipe } from '@shared/pipes/duration.pipe';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DailyWorkSheetComponent } from './daily-work-sheet.component';

// Mocks
class MockTranslocoLoader implements TranslocoLoader {
  getTranslation(lang: string) {
    return Promise.resolve({});
  }
}

class MockMatDialog {
  open = vi.fn(() => ({
    afterClosed: vi.fn(() => ({
      subscribe: vi.fn((cb) => cb('Dispute Reason')),
    })),
  }));
}

class MockPreferencesService {
  activeCompanyId = vi.fn(() => 'company-1');
  nhRate = vi.fn(() => 20.0);
}

describe('DailyWorkSheetComponent', () => {
  let component: DailyWorkSheetComponent;
  let fixture: ComponentFixture<DailyWorkSheetComponent>;
  let dialog: MockMatDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DailyWorkSheetComponent,
        NoopAnimationsModule,
        DurationPipe,
        DecimalPipe,
      ],
      providers: [
        provideZonelessChangeDetection(),
        provideTransloco({
          config: { availableLangs: ['en'], defaultLang: 'en' },
          loader: MockTranslocoLoader,
        }),
        { provide: MatDialog, useClass: MockMatDialog },
        { provide: PreferencesService, useClass: MockPreferencesService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DailyWorkSheetComponent);
    component = fixture.componentInstance;
    dialog = TestBed.inject(MatDialog) as any;

    // Set required input
    fixture.componentRef.setInput('mode', 'worker');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('displayParts', () => {
    it('should return cloud parts if cloudEntry is present', () => {
      const cloudData = {
        id: '1',
        parts_data: [
          { partType: 'round', size: 100, amount: 2, normHours: 2.5 },
        ],
        company_id: 'c1',
        status: 'draft',
      };

      fixture.componentRef.setInput('cloudEntry', cloudData);
      fixture.componentRef.setInput('isAuthenticated', true);
      fixture.detectChanges();

      const parts = component.displayParts();
      expect(parts.length).toBe(1);
      expect(parts[0].amount).toBe(2);
      expect(parts[0].normHours).toBe(2.5);
      expect(parts[0].size).toBe('Ø100');
    });

    it('should return local entries if no cloudEntry and mode is worker (unauth fallback)', () => {
      const localData = [
        { type: 'round', sizeDisplay: '125', amount: 3, normHours: 3.0 },
      ];

      fixture.componentRef.setInput('cloudEntry', null);
      fixture.componentRef.setInput('localEntries', localData);
      fixture.componentRef.setInput('isAuthenticated', false);
      fixture.detectChanges();

      const parts = component.displayParts();
      expect(parts.length).toBe(1);
      expect(parts[0].amount).toBe(3);
    });

    it('should return empty if cloudEntry is present but empty', () => {
      const cloudData = {
        id: '1',
        parts_data: [],
        entry_date: '2025-01-01',
      };

      fixture.componentRef.setInput('cloudEntry', cloudData);
      fixture.componentRef.setInput('isAuthenticated', true);
      fixture.detectChanges();

      expect(component.displayParts().length).toBe(0);
    });
  });

  describe('Computed Totals', () => {
    it('should calculate total NH and Price correctly', () => {
      const cloudData = {
        parts_data: [
          { amount: 1, normHours: 1.0 },
          { amount: 2, normHours: 1.5 },
        ],
      };
      fixture.componentRef.setInput('cloudEntry', cloudData);
      fixture.detectChanges();

      // Total NH = 1.0 + 1.5 = 2.5
      // Price = 2.5 * 20.0 (rate) = 50.0

      expect(component.totalNormHours()).toBe(2.5);
      expect(component.totalPrice()).toBe(50.0);
    });
  });

  describe('Actions', () => {
    it('should emit dispute event on reject', () => {
      const cloudData = { id: 'entry-123', parts_data: [] };
      fixture.componentRef.setInput('cloudEntry', cloudData);

      const spy = vi.spyOn(component.reject, 'emit');

      component.onReject();

      expect(dialog.open).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith({
        id: 'entry-123',
        reason: 'Dispute Reason',
      });
    });

    it('should emit approve event', () => {
      const cloudData = { id: 'entry-123', parts_data: [] };
      fixture.componentRef.setInput('cloudEntry', cloudData);

      const spy = vi.spyOn(component.approve, 'emit');

      component.onApprove();

      expect(spy).toHaveBeenCalledWith('entry-123');
    });

    it('should emit moveToCloud event', () => {
      const spy = vi.spyOn(component.moveToCloud, 'emit');
      component.onMoveToActive();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Move Logic', () => {
    it('should allow move if cloud entry company differs from active', () => {
      const cloudData = { company_id: 'other-company' };

      fixture.componentRef.setInput('isAuthenticated', true);
      fixture.componentRef.setInput('cloudEntry', cloudData);
      // activeCompanyId mock returns 'company-1'

      fixture.detectChanges();

      expect(component.canMoveToActive()).toBe(true);
    });

    it('should NOT allow move if companies match', () => {
      const cloudData = { company_id: 'company-1', parts_data: [] };
      fixture.componentRef.setInput('isAuthenticated', true);
      fixture.componentRef.setInput('cloudEntry', cloudData);

      fixture.detectChanges();

      expect(component.canMoveToActive()).toBe(false);
    });
  });
});
