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
        (m) => m.RoundPartComponent
      ),
    title: 'Round Parts',
  },
  {
    path: 'square',
    loadComponent: () =>
      import('./features/square-part/square-part.component').then(
        (m) => m.SquarePartComponent
      ),
    title: 'Square Parts',
  },
  {
    path: 'machine',
    loadComponent: () =>
      import('./features/vent-machine/vent-machine.component').then(
        (m) => m.VentMachineComponent
      ),
    title: 'Machines',
  },
  {
    path: '**',
    redirectTo: 'round',
  },
];
