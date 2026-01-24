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
npm run lint           # Run linter (ng lint)
npm test               # Run Vitest in watch mode
ng test --include=**/path/to/spec.ts  # Run single test file
ng test --coverage     # Run with coverage
```
### Running a Single Test Case
Use Vitest's `.only` modifier in code: `it.only('should...', () => {})`.

## 4. Code Style & Conventions
- **Imports:** Angular Core → Angular Modules → 3rd Party → Local (@core, @shared, @features).
- **Naming:**
  - Components: `PascalCase` (e.g., `PartCalculatorComponent`)
  - Files: `kebab-case` (e.g., `user-profile.component.ts`)
  - Signals: `camelCase` (e.g., `isLoading`, `totalPrice`)
  - Constants: `SCREAMING_SNAKE` (e.g., `NORM_HOUR_FACTOR`)
  - Interfaces: `PascalCase` (e.g., `VentPart`). NO "I" prefix.
- **Types:** Strict mode enabled. Use `unknown` + narrowing instead of `any`.
- **Styles:** SCSS with mobile-first approach. Min touch target: **60x60px**.
- **Error Handling:** Use `resource()` error signals or typed exceptions. Log with context.

## 5. Domain Logic: LVI TES (Piecework)
- **Unit:** NH (Normitunti / Norm Hour). 1 NH = 1 hour of standard work.
- **Formula:** `Price = NH × NormFactor × ConditionMultipliers`
- **2025 Rates (Source: src/assets/data/tes-config.json):**
  - Norm Hour Factor: **19.10 €**
  - Insulation Money: **4.23 €**
  - Pay Group 3 Base: **18.93 €/h**

## 6. Supabase & Database
- **Service:** `SupabaseService` (singleton via `inject()`).
- **Types:** `src/app/core/models/database.types.ts`.
- **RLS:** Policies enforced on `companies` and `work_entries`. Handle `403` errors.
- **Pattern:** Use `.select().single()` for unique fetches. Handle errors explicitly.

## 7. Angular Patterns (v20+)
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
  private calculationService = inject(CalculationService);
  amount = signal(1);
  selectedSize = signal<number | null>(null);
  totalNormHours = computed(() => this.amount() * (this.selectedSize() ?? 0));
  
  partType = input.required<string>();
  partSelected = output<VentPart>();

  onClick() { /* ... */ }
}
```

### Service Declaration
```typescript
@Injectable({ providedIn: 'root' })
export class CalculationService {
  private supabase = inject(SupabaseService);
  
  // Use resource for async data
  partsResource = resource({
    loader: async () => {
      const { data, error } = await this.supabase.getClient().from('parts').select();
      if (error) throw error;
      return data;
    }
  });
}
```

## 8. UI/UX Requirements
- **Touch Targets:** Minimum **60x60px** for all interactive elements (field-use ready).
- **Readability:** High contrast (black on white/yellow) for sunlight visibility.
- **Mobile-first:** SCSS with mobile-first breakpoints. No hover-only interactions.

## 9. Folder Structure & Key Files
- `src/app/core/`:
  - `services/supabase.service.ts`: Central Supabase client.
  - `services/auth.service.ts`: Authentication state via signals.
  - `models/database.types.ts`: Auto-generated Supabase types.
  - `models/vent-part.model.ts`: Domain models for ventilation parts.
- `src/app/features/`:
  - `round/`: Round parts calculator (piping, bends, silencers).
  - `square/`: Square parts calculator (ducts, fittings).
  - `machine/`: Machine units (fans, AHUs, beams).
- `src/app/shared/`:
  - `components/total-bar/`: Bottom status bar showing current totals.
  - `components/side-drawer/`: Unified auth/settings drawers.
- `src/assets/data/tes-config.json`: **Source of Truth** for all NH rates and part sizes.

## 10. External Libraries
- **@jsverse/transloco:** Localization. Use `t('KEY')` in templates and `inject(TranslocoService)` in TS.
- **@supabase/supabase-js:** Database and Auth. Use PostgREST syntax.
- **Vitest:** Unit testing. Use `vi.fn()` for mocking and `expect().toBe()` for assertions.
- **SCSS:** Use `@use 'variables'` for theme colors and spacing.

## 11. Agent Workflow & Tools
1. **Understand:** Read `old/` for domain logic but write modern v20+ code.
2. **Docs:** Use `angular-cli_search_documentation` for Signals/Zoneless help.
3. **Database:** Use `supabase_execute_sql` for read-only schema/data verification.
4. **Style:** Use `class` and `style` bindings; avoid `ngClass`/`ngStyle`.
5. **Accessibility:** Must pass AXE checks and WCAG AA contrast ratios (Min 4.5:1).
6. **Testing:** Write unit tests for all new services and complex logic. Use `fakeAsync` or `resource()` mocking where appropriate.
