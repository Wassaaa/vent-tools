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
    title: 'TITLES.ROUND_PARTS',
  },
  {
    path: 'square',
    loadComponent: () =>
      import('./features/square-part/square-part.component').then(
        (m) => m.SquarePartComponent,
      ),
    title: 'TITLES.SQUARE_PARTS',
  },
  {
    path: 'machine',
    loadComponent: () =>
      import('./features/vent-machine/vent-machine.component').then(
        (m) => m.VentMachineComponent,
      ),
    title: 'TITLES.MACHINES',
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
    title: 'TITLES.LOGIN',
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./features/auth/register.component').then(
        (m) => m.RegisterComponent,
      ),
    title: 'TITLES.REGISTER',
  },
  {
    path: 'auth/profile',
    loadComponent: () =>
      import('./features/auth/profile.component').then(
        (m) => m.ProfileComponent,
      ),
    title: 'TITLES.PROFILE',
  },
  {
    path: 'manager/create-company',
    loadComponent: () =>
      import('./features/manager/create-company.component').then(
        (m) => m.CreateCompanyComponent,
      ),
    title: 'TITLES.CREATE_COMPANY',
  },
  {
    path: 'manager/join-requests',
    loadComponent: () =>
      import('./features/manager/join-requests.component').then(
        (m) => m.JoinRequestsComponent,
      ),
    title: 'TITLES.JOIN_REQUESTS',
  },
  {
    path: 'manager/dashboard',
    loadComponent: () =>
      import('./features/manager/manager-dashboard.component').then(
        (m) => m.ManagerDashboardComponent,
      ),
    title: 'TITLES.DASHBOARD',
  },
  {
    path: 'manager/company/:id',
    loadComponent: () =>
      import('./features/manager/company-detail.component').then(
        (m) => m.CompanyDetailComponent,
      ),
    title: 'TITLES.COMPANY_DETAIL',
  },
  {
    path: '**',
    redirectTo: 'round',
  },
];
