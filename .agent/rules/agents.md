---
trigger: model_decision
description: when working on the website, try to follow these rules and update when sometime seems fit here
---

# AGENTS.md

## 1. Project Overview

**Project:** Vent-Tools Modernization (refactor of legacy vent-tools repo)
**Target:** Angular v20+ (Zoneless), NixOS on WSL
**Domain:** Construction/Ventilation Piecework Calculation (Finnish "LVI-Urakka")
**Authority:** Follows Talotekniikka LVI TES 2025-2028 collective agreement

The `old/` directory contains the legacy Angular app (NgModule-based, RxJS Subjects) to be modernized.

## 2. Reference Documentation

- **llms.md** - Quick reference: Angular documentation table of contents with links
- **llms-full.md** - Full Angular docs (16K lines). Grep/search this file for Angular issues and patterns
- **best-practices.md** - Additional TypeScript/Angular coding guidelines

When troubleshooting Angular issues, search `llms-full.md` first:
```bash
grep -n "signal" llms-full.md | head -50
```

## 3. Development Commands

```bash
# Development
npm start              # Start dev server (ng serve)
npm run build          # Production build (ng build)
npm run lint           # Run linter (ng lint)

# Testing (Vitest - Angular 20+ default)
npm test               # Run all tests in watch mode
ng test                # Same as above

# Run single test file
ng test --include=**/component-name.spec.ts

# Run tests matching pattern
ng test --include=**/services/*.spec.ts

# Run with coverage
ng test --coverage

# Run in browser (requires playwright)
ng test --browsers=chromium
```

### Running a Single Test Case

Use Vitest's `only` modifier in your spec file:
```typescript
// Run only this describe block
describe.only('MyComponent', () => { ... });

// Run only this test
it.only('should do something', () => { ... });

// Skip a test
it.skip('broken test', () => { ... });
```

## 4. Technical Constraints (STRICT)

**Framework:** Angular v20+ with Zoneless change detection

**Architecture Rules:**
- **Standalone Components ONLY** - `standalone: true` is the DEFAULT in v20+, do NOT set it explicitly
- **NO NgModules** - Do not create or use `@NgModule`
- **Zoneless** - Use `provideZonelessChangeDetection()` in app config
- **Signals** - ALL state via `signal()`, `computed()`, or `linkedSignal()`
- **Async Data** - Use `resource()` or `rxResource()` API, NOT manual `subscribe()`
- **i18n** - Use `@jsverse/transloco` for FI/ET/EN. NO hardcoded user-facing text

## 5. Code Style Guidelines

### Import Organization

Order imports: **Angular core → Angular modules → Third-party → Local (relative paths)**
Separate groups with blank lines.

### TypeScript Conventions

- **Strict mode** - Enable all strict checks in tsconfig
- **No `any`** - Use `unknown` when type is uncertain, then narrow
- **Type inference** - Prefer inference when type is obvious: `const count = signal(0)`
- **Interfaces** - Define in `src/app/core/models/`, use PascalCase, no "I" prefix
- **Explicit return types** - For public service methods

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Files | kebab-case | `user-profile.component.ts` |
| Classes | PascalCase | `UserProfileComponent` |
| Interfaces | PascalCase | `VentPart` (no "I" prefix) |
| Functions/Variables | camelCase | `calculateNormHours()` |
| Signals | camelCase | `selectedPart`, `isLoading` |
| Constants | SCREAMING_SNAKE | `NORM_HOUR_FACTOR` |
| Test files | `.spec.ts` suffix | `calculation.service.spec.ts` |

### Error Handling

- Use typed errors, avoid generic catch blocks
- Resource API has built-in `error()` signal - use it
- Log errors with context: `console.error('Failed to load parts:', error)`

## 6. Angular Component Patterns

### Component Declaration
```typescript
@Component({
  selector: 'app-part-calculator',
  templateUrl: './part-calculator.component.html',
  styleUrl: './part-calculator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, ReactiveFormsModule],
  host: {
    '(click)': 'onClick()',
    '[class.active]': 'isActive()',
  },
})
export class PartCalculatorComponent {
  // Use inject() function, not constructor injection
  private calculationService = inject(CalculationService);

  // Use input()/output() functions, not decorators
  partType = input.required<string>();
  partSelected = output<VentPart>();

  // Signals for state
  amount = signal(1);
  selectedSize = signal<number | null>(null);

  // Computed for derived state
  totalNormHours = computed(() => this.amount() * this.baseHours());
}
```

### Template Rules

- Use `@if`, `@for`, `@switch` - NOT `*ngIf`, `*ngFor`, `*ngSwitch`
- No arrow functions in templates (not supported)
- No `ngClass`/`ngStyle` - use `[class.x]` and `[style.x]` bindings
- Keep templates simple, move logic to computed signals

```html
@if (isLoading()) {
  <app-spinner />
} @else {
  @for (part of parts(); track part.id) {
    <app-part-card [part]="part" (selected)="onSelect($event)" />
  }
}
```

### Service Pattern
```typescript
@Injectable({ providedIn: 'root' })
export class CalculationService {
  private http = inject(HttpClient);

  // Use resource API for data fetching
  partsResource = resource({
    loader: () => this.http.get<VentPart[]>('/api/parts').toPromise(),
  });
}
```

## 7. UI/UX Requirements (Field-Ready Design)

- **Touch targets** - Minimum 60x60px for all interactive elements
- **High contrast** - Design for sunlight readability (black on white/yellow)
- **No tiny dropdowns** - Use large, tap-friendly selection controls
- **Mobile-first** - SCSS with mobile-first media queries
- **Accessibility** - Must pass AXE checks, WCAG AA compliance
- **Focus management** - Proper focus states and keyboard navigation

## 8. Domain Logic: LVI TES (Piecework)

**Unit:** Time is measured in NH (Normitunti / Norm Hour)

**Formula:** `Price = NH × NormFactor × ConditionMultipliers`

**2025 Rates (exact values - do NOT hallucinate):**
| Rate | Value |
|------|-------|
| Norm Hour Factor | 19.10 € |
| Insulation Money Factor | 4.23 € |
| Pay Group 3 Base | 18.93 €/h |

Rate definitions should be stored in `src/assets/data/tes-config.json`.

## 9. Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── models/          # Interfaces and types
│   │   └── services/        # Business logic, calculation engines
│   ├── features/
│   │   ├── round-part/      # Round ventilation calculator
│   │   ├── square-part/     # Square ventilation calculator
│   │   ├── axial-part/      # Axial part calculator
│   │   └── vent-machine/    # Machine part calculator
│   └── shared/
│       └── components/      # Reusable UI components
├── assets/
│   └── data/
│       └── tes-config.json  # TES rate definitions
└── main.ts                  # Bootstrap with zoneless config
```

Test files (`.spec.ts`) live alongside the code they test.

## 10. Legacy Reference

The `old/` directory contains the legacy app for **reference only**. Use it to understand:
- Domain logic and calculations (`old/app/services/times.service.ts`)
- Data models (`old/app/VentPart.ts`)
- UI workflows (`old/app/components/`)

**Do NOT copy code directly.** Rewrite everything using modern Angular 20+ patterns.

## 11. Implementation Checklist

When implementing a feature:
1. Study the corresponding legacy code in `old/` to understand the domain logic
2. Create `src/assets/data/tes-config.json` with rate definitions (if not exists)
3. Define interfaces in `src/app/core/models/`
4. Create Signal-based Services in `src/app/core/services/`
5. Generate Components with "fat finger" UI elements
6. Add translations to Transloco files for FI/ET/EN
