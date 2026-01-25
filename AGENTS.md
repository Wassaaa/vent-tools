# AGENTS.md (Vent-Tools Modernization)

## 1. Project Overview
- **Project:** Vent-Tools Modernization (Zoneless Angular v20+, Supabase)
- **Domain:** Construction/Ventilation Piecework Calculation (Finnish "LVI-Urakka")
- **Authority:** Talotekniikka LVI TES 2025-2028 collective agreement.
- **Legacy:** The `old/` directory contains reference code (NgModule/RxJS). **Reference ONLY; do NOT copy.**

## 2. Technical Stack & Constraints (STRICT)
- **Framework:** Angular v20+ with `provideZonelessChangeDetection()`.
- **Change Detection:** `ChangeDetectionStrategy.OnPush` is mandatory.
- **Components:** Standalone components only. Do NOT set `standalone: true` (it's the default).
- **State Management:** 100% Signals (`signal`, `computed`, `linkedSignal`). NO RxJS for state.
- **Async Data:** Use `resource()` or `rxResource()` for fetching. NO manual `subscribe()`.
- **DI:** Use `inject()` function, NOT constructor injection.
- **Inputs/Outputs:** Use `input()`, `input.required()`, and `output()` functions only.
- **Templates:** Use modern control flow (`@if`, `@for`, `@switch`). NO `*ngIf` or `*ngFor`.
- **i18n:** `@jsverse/transloco` for FI/ET/EN. NEVER hardcode user-facing strings.

## 3. Development Commands
```bash
npm start              # Start dev server (ng serve)
npm run build          # Production build (ng build)
npm run lint           # Run ESLint (ng lint)
npm test               # Run Vitest in watch mode
```

### Running Tests
```bash
ng test                                     # All tests (watch mode)
ng test --watch=false                       # All tests once (CI mode)
ng test --include=**/supabase.service.spec.ts  # Single test file
ng test --coverage                          # With coverage report
```

### Running a Single Test Case
Use Vitest's `.only` modifier in the test file:
```typescript
it.only('should handle this case', () => { /* ... */ });
describe.only('Auth', () => { /* ... */ });
```

## 4. Code Style & Conventions

### Import Order (Enforced)
1. Angular Core (`@angular/core`)
2. Angular Modules (`@angular/forms`, `@angular/material/*`)
3. Third-party (`@jsverse/transloco`, `@supabase/supabase-js`)
4. Local path aliases (`@core/*`, `@shared/*`, `@features/*`)

### Naming Conventions
| Type        | Convention        | Example                    |
|-------------|-------------------|----------------------------|
| Components  | PascalCase        | `PartCalculatorComponent`  |
| Files       | kebab-case        | `user-profile.component.ts`|
| Signals     | camelCase         | `isLoading`, `totalPrice`  |
| Constants   | SCREAMING_SNAKE   | `NORM_HOUR_FACTOR`         |
| Interfaces  | PascalCase (no I) | `VentPart`, `Profile`      |

### TypeScript Rules
- Strict mode enabled. Use `unknown` + type narrowing instead of `any`.
- Use `type` imports for types only: `import type { User } from '@supabase/supabase-js'`.
- Explicit return types on public methods.
- Document public APIs with JSDoc comments.

### Error Handling
- Use `resource()` error signals for async operations.
- Return `{ success: boolean; error?: string }` pattern for operations.
- Log errors with context: `console.error('Context:', error)`.

## 5. Domain Logic: LVI TES (Piecework)
- **Unit:** NH (Normitunti / Norm Hour). 1 NH = 1 hour of standard work.
- **Formula:** `Price = NH x NormFactor x ConditionMultipliers`
- **2025 Rates (Source: `src/assets/data/tes-config.json`):**
  - Norm Hour Factor: **19.10 EUR**
  - Insulation Money: **4.23 EUR**
  - Pay Group 3 Base: **18.93 EUR/h**

## 6. Supabase & Database
- **Service:** `SupabaseService` (singleton via `inject()`).
- **Types:** `src/app/core/models/database.types.ts`.
- **RLS:** Policies enforced on `companies` and `work_entries`. Handle `403` errors.
- **Pattern:** Use `.select().single()` for unique fetches. Handle errors explicitly.
- **Testing:** Inject mock client via `SUPABASE_CLIENT` token (see test-utils).

## 7. Angular Patterns (v20+)

### Component Declaration
```typescript
@Component({
  selector: 'app-size-stepper',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './size-stepper.component.html',
  styleUrl: './size-stepper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SizeStepperComponent {
  private service = inject(SomeService);

  // Inputs using signal functions
  readonly sizes = input.required<number[]>();
  readonly value = input.required<number>();
  readonly unit = input<string>('mm');

  // Outputs using output function
  readonly valueChange = output<number>();

  // Internal state with signals
  readonly currentIndex = computed(() => this.sizes().indexOf(this.value()));

  // Methods
  increment(): void { /* ... */ }
}
```

### Service Declaration
```typescript
@Injectable({ providedIn: 'root' })
export class CalculationService {
  private supabase = inject(SupabaseService);

  partsResource = resource({
    loader: async () => {
      const { data, error } = await this.supabase.getClient().from('parts').select();
      if (error) throw error;
      return data;
    }
  });
}
```

## 8. Testing Patterns

### Test Setup
```typescript
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: SUPABASE_CLIENT, useValue: createMockSupabaseClient() },
      ],
    });
    service = TestBed.inject(MyService);
    vi.clearAllMocks();
  });
});
```

### Mocking Supabase
Use utilities from `@core/services/test-utils/supabase-mock`:
```typescript
import { createMockSupabaseClient, mockSuccess, mockError } from './test-utils/supabase-mock';

(mockClient.auth.signUp as Mock).mockResolvedValue(mockSuccess({ user, session }));
(mockClient.from as Mock).mockReturnValue({ insert: vi.fn().mockResolvedValue(mockSuccess(null)) });
```

## 9. UI/UX Requirements
- **Touch Targets:** Minimum **60x60px** for all interactive elements.
- **Readability:** High contrast (black on white/yellow) for outdoor visibility.
- **Mobile-first:** SCSS with mobile-first breakpoints. No hover-only interactions.

## 10. Folder Structure & Path Aliases
```
src/app/
  core/           @core/*    - Services, models, guards
  shared/         @shared/*  - Reusable components, pipes, directives
  features/       @features/* - Feature modules (round, square, machine, auth, manager)
src/assets/data/tes-config.json - Source of Truth for NH rates
```

## 11. External Libraries
| Library              | Usage                                       |
|----------------------|---------------------------------------------|
| @jsverse/transloco   | i18n: `t('KEY')` in templates               |
| @supabase/supabase-js| Database/Auth with PostgREST                |
| @angular/material    | UI components (use CDK for custom)          |
| Vitest               | Unit tests: `vi.fn()`, `expect().toBe()`    |

## 12. Agent Workflow Checklist
1. Read `old/` for domain logic understanding, but write modern v20+ code.
2. Use `angular-cli_search_documentation` for Signals/Zoneless patterns.
3. Use `supabase_execute_sql` for read-only schema verification.
4. Use `class` and `style` bindings; avoid `ngClass`/`ngStyle`.
5. Ensure WCAG AA contrast ratios (min 4.5:1) and AXE compliance.
6. Write unit tests for new services and complex computed signals.
7. Run `npm run lint` before committing; fix all errors.
