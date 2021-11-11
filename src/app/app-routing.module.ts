import { VentMachinePartComponent } from './components/vent-machine-part/vent-machine-part.component';
import { AxialPartComponent } from './components/axial-part/axial-part.component';
import { SquarePartComponent } from './components/square-part/square-part.component';
import { RoundPartComponent } from './components/round-part/round-part.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'round', pathMatch: 'full' },
  { path: 'round', component: RoundPartComponent },
  { path: 'square', component: SquarePartComponent },
  { path: 'axial', component: AxialPartComponent },
  { path: 'machine', component: VentMachinePartComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
