# AGENTS.md

## 1. Project Overview
**Project:** Vent-Tools Modernization (Angular v20+, Zoneless, Supabase)
**Domain:** Construction/Ventilation Piecework Calculation (Finnish "LVI-Urakka")
**Authority:** Follows Talotekniikka LVI TES 2025-2028 collective agreement.

## 2. Development Commands
```bash
# Core
npm start              # Start dev server
npm run build          # Production build
npm run lint           # Run linter

# Testing (Vitest)
npm test               # Run all tests (watch mode)
ng test --include=**/auth.service.spec.ts  # Run single test file
ng test --coverage     # Run with coverage
```

## 3. Architecture & Tech Stack
- **Framework:** Angular v20+ (Zoneless, Standalone Components ONLY).
- **State Management:** Signals (`signal`, `computed`, `linkedSignal`) for everything.
- **Backend:** Supabase (Auth, Postgres, RLS).
- **i18n:** `@jsverse/transloco` (FI/ET/EN).
- **Styles:** SCSS with mobile-first approach (min touch target 60px).

## 4. Supabase & Database
- **Client:** Injected `SupabaseService` (singleton).
- **Types:** Generated in `src/app/core/models/database.types.ts`.
- **RLS Policies:** 
  - `companies`: INSERT (auth), SELECT (creator OR member).
  - `user_companies`: Managers can add members.
- **Pattern:** Use `from('table').select().single()` for fetches. Handle errors explicitly.

## 5. Code Style & Conventions
- **Internationalization:** NEVER hardcode user-facing text. Use English-based keys (e.g., `COMPANIES.CREATE_BUTTON`) and Transloco.
- **Imports:** Angular Core → Modules → 3rd Party → Local (`@core`, `@shared`, `@features`).
- **Naming:**
  - Components: `UserProfileComponent` (PascalCase)
  - Files: `user-profile.component.ts` (kebab-case)
  - Signals: `isLoading`, `currentUser` (camelCase)
  - Constants: `NORM_HOUR_FACTOR` (SCREAMING_SNAKE)
- **Types:** strict mode enabled. No `any`. Use `unknown` + narrowing.
- **DI:** Use `inject()` function, NOT constructor injection.
- **Inputs/Outputs:** Use `input()`/`output()` signals, NOT decorators.

## 6. Angular Patterns (v20+)
**Component:**
```typescript
@Component({
  selector: 'app-feature',
  standalone: true, // Default in v20+, but implicit
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (isLoading()) { <app-spinner /> }
    @for (item of items(); track item.id) { ... }
  `
})
export class FeatureComponent {
  private service = inject(FeatureService);
  data = input.required<Data>();
  status = signal('idle');
  
  // Computed derived state
  isValid = computed(() => this.status() === 'active');
}
```

**Service:**
```typescript
@Injectable({ providedIn: 'root' })
export class FeatureService {
  private supabase = inject(SupabaseService);
  
  // Use resource() for async data if possible, or async/await with signals
  async getData() {
    const { data, error } = await this.supabase.getClient().from('table').select();
    if (error) throw error;
    return data;
  }
}
```

## 7. Domain Logic (LVI TES)
**Unit:** NH (Normitunti / Norm Hour).
**Formula:** `Price = NH × NormFactor × ConditionMultipliers`
**2025 Rates:**
- Norm Hour Factor: **19.10 €**
- Insulation Money: **4.23 €**
- Pay Group 3 Base: **18.93 €/h**

## 8. Testing Guidelines
- **Tool:** Vitest.
- **Location:** `.spec.ts` files alongside components.
- **Focus:** `describe.only('...')` or `it.only('...')` to focus specific tests.
- **Mocking:** Mock `SupabaseService` calls, do not hit real DB in unit tests.

## 9. Folder Structure
```
src/app/
  core/       # Singleton services, guards, models, interceptors
  features/   # Lazy-loaded feature routes (auth, manager, worker)
  shared/     # Reusable UI components (buttons, layouts)
  assets/     # Static data (tes-config.json)
```

## 10. Available MCP Tools
Use these tools extensively for best results:

- **Supabase:** `supabase_search_docs` (always check latest docs), `supabase_execute_sql` (debug RLS/policies), `supabase_list_tables`.
- **Context7:** `context7_query-docs` for general library questions (e.g. RxJS, PrimeNG, etc).
- **Angular CLI:** `angular-cli_search_documentation` for official Angular concepts.
- **Angular Docs:** `angular-docs_fetch_docs` to read specific documentation pages.

**Workflow for Issues:**
1. Search docs first (`supabase_search_docs`, `angular-cli_search_documentation`).
2. Verify DB state with `supabase_execute_sql` (read-only queries).
3. If library behavior is unclear, use `context7_query-docs`.
