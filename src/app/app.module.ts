import { HoverClassDirective } from './directives/hover-class.directive';
import { ThemeComponent } from './components/theme-component/theme.component';
import { DurationPipe } from './duration.pipe';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { AppComponent } from './app.component';
import { ChoosePartComponent } from './components/choose-part/choose-part.component';

import { TableComponent } from './components/table/table.component';

import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { RoundPartComponent } from './components/round-part/round-part.component';
import { SquarePartComponent } from './components/square-part/square-part.component';
import { AxialPartComponent } from './components/axial-part/axial-part.component';
import { VentMachinePartComponent } from './components/vent-machine-part/vent-machine-part.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSliderModule } from '@angular/material/slider';
import { DragDropModule } from '@angular/cdk/drag-drop';
@NgModule({
  declarations: [
    AppComponent,

    ChoosePartComponent,
    TableComponent,

    DurationPipe,
    ThemeComponent,
    RoundPartComponent,
    SquarePartComponent,
    AxialPartComponent,
    VentMachinePartComponent,
    HoverClassDirective,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatNativeDateModule,
    MatInputModule,
    FlexLayoutModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatButtonModule,
    MatProgressBarModule,
    MatGridListModule,
    MatMenuModule,
    MatCheckboxModule,
    MatDividerModule,
    MatTabsModule,
    MatSliderModule,
    DragDropModule,
  ],
  providers: [],
  bootstrap: [ThemeComponent],
})
export class AppModule {}
