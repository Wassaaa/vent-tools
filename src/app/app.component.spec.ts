import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { AppComponent } from './app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PreferencesService, ThemeService, SupabaseService, WorkLogService } from '@core/services';
import { TranslocoService } from '@jsverse/transloco';
import { Subject } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mocks
class MockPreferencesService {
  language = () => 'en';
  setLanguage = () => {};
  workerName = () => 'Worker';
  setWorkerName = () => {};
}

class MockThemeService {
  isDark = () => false;
  toggle = () => {};
}

class MockSupabaseService {
  isAuthenticated = () => false;
  isManager = () => false;
  user = () => null;
}

class MockWorkLogService {
  collision$ = new Subject();
  entries = () => [];
  currentDayContext = () => ({ id: null, name: null });
  currentDayEntries = () => [];
  totalNormHours = () => 0;
  getCompanyName = () => Promise.resolve('Company');
  moveDateToCompany = () => Promise.resolve();
  addEntry = () => {};
}

class MockTranslocoService {
  config = {
    reRenderOnLangChange: true,
    defaultLang: 'en',
    availableLangs: ['en'],
  };
  langChanges$ = new Subject();
  setActiveLang = () => {};
  translate = (key: string) => key;
}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        NoopAnimationsModule
      ],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
        { provide: PreferencesService, useClass: MockPreferencesService },
        { provide: ThemeService, useClass: MockThemeService },
        { provide: SupabaseService, useClass: MockSupabaseService },
        { provide: WorkLogService, useClass: MockWorkLogService },
        { provide: TranslocoService, useClass: MockTranslocoService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle settings drawer', () => {
    // Initial state: closed
    expect(component.settingsOpen()).toBe(false);

    // First click: open
    component.openSettings();
    expect(component.settingsOpen()).toBe(true);
    expect(component.authOpen()).toBe(false);
    expect(component.workLogOpen()).toBe(false);

    // Second click: close
    component.openSettings();
    expect(component.settingsOpen()).toBe(false);
  });

  it('should toggle auth drawer', () => {
    // Initial state: closed
    expect(component.authOpen()).toBe(false);

    // First click: open
    component.openAuth();
    expect(component.authOpen()).toBe(true);
    expect(component.settingsOpen()).toBe(false);
    expect(component.workLogOpen()).toBe(false);

    // Second click: close
    component.openAuth();
    expect(component.authOpen()).toBe(false);
  });

  it('should toggle work log sheet', () => {
    // Initial state: closed
    expect(component.workLogOpen()).toBe(false);

    // First click: open
    component.openWorkLog();
    expect(component.workLogOpen()).toBe(true);
    expect(component.settingsOpen()).toBe(false);
    expect(component.authOpen()).toBe(false);

    // Second click: close
    component.openWorkLog();
    expect(component.workLogOpen()).toBe(false);
  });

  it('should close other drawers when opening one', () => {
    // Open settings
    component.openSettings();
    expect(component.settingsOpen()).toBe(true);

    // Open auth (should close settings)
    component.openAuth();
    expect(component.authOpen()).toBe(true);
    expect(component.settingsOpen()).toBe(false);

    // Open work log (should close auth)
    component.openWorkLog();
    expect(component.workLogOpen()).toBe(true);
    expect(component.authOpen()).toBe(false);
  });
});
