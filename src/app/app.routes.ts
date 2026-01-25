import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'round',
    pathMatch: 'full',
  },
  {
    path: 'round',
    loadComponent: () =>
      import('./features/round-part/round-part.component').then(
        (m) => m.RoundPartComponent,
      ),
    title: 'titles.roundParts',
  },
  {
    path: 'square',
    loadComponent: () =>
      import('./features/square-part/square-part.component').then(
        (m) => m.SquarePartComponent,
      ),
    title: 'titles.squareParts',
  },
  {
    path: 'machine',
    loadComponent: () =>
      import('./features/vent-machine/vent-machine.component').then(
        (m) => m.VentMachineComponent,
      ),
    title: 'titles.machines',
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
    title: 'titles.login',
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./features/auth/register.component').then(
        (m) => m.RegisterComponent,
      ),
    title: 'titles.register',
  },
  {
    path: 'auth/profile',
    loadComponent: () =>
      import('./features/auth/profile.component').then(
        (m) => m.ProfileComponent,
      ),
    title: 'titles.profile',
  },
  {
    path: 'manager/create-company',
    loadComponent: () =>
      import('./features/manager/create-company.component').then(
        (m) => m.CreateCompanyComponent,
      ),
    title: 'titles.createCompany',
  },
  {
    path: 'manager/join-requests',
    loadComponent: () =>
      import('./features/manager/join-requests.component').then(
        (m) => m.JoinRequestsComponent,
      ),
    title: 'titles.joinRequests',
  },
  {
    path: 'manager/dashboard',
    loadComponent: () =>
      import('./features/manager/manager-dashboard.component').then(
        (m) => m.ManagerDashboardComponent,
      ),
    title: 'titles.dashboard',
  },
  {
    path: 'manager/company/:id',
    loadComponent: () =>
      import('./features/manager/company-detail.component').then(
        (m) => m.CompanyDetailComponent,
      ),
    title: 'titles.companyDetail',
  },
  {
    path: '**',
    redirectTo: 'round',
  },
];
