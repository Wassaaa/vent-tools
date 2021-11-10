import { ThemeComponent } from './components/theme-component/theme.component';
import { DurationPipe } from './duration.pipe';
import { TimesService } from './services/times.service';
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
import { HeaderComponent } from './components/header/header.component';
import { ChosenComponentsComponent } from './components/chosen-components/chosen-components.component';
import { DataTableComponent } from './components/data-table/data-table.component';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ChoosePartComponent,
    ChosenComponentsComponent,
    DataTableComponent,
    DurationPipe,
    ThemeComponent,
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
  ],
  providers: [],
  bootstrap: [ThemeComponent],
})
export class AppModule {}
