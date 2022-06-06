import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContentLoaderModule } from '@ngneat/content-loader';
import { NgSelect2Module } from 'ng-select2';
import { AgmCoreModule } from '@agm/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatTooltipModule } from '@angular/material/tooltip';

import { environment } from '../../environments/environment';

import { ClinicsRoutingModule } from './clinics-routing.module';
import { ClinicsComponent } from './clinics.component';
import { ClinicUpdateComponent } from './clinic-update/clinic-update.component';
import { DoctorsComponent } from './doctors/doctors.component';
import { PatientsComponent } from './patients/patients.component';
import { AppointmentsComponent } from './appointments/appointments.component';

import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatFormFieldModule, MatIconModule, MatInputModule, MatNativeDateModule } from '@angular/material';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    ClinicsComponent,
    ClinicUpdateComponent,
    DoctorsComponent,
    PatientsComponent,
    AppointmentsComponent
  ],
  imports: [
    CommonModule,
    ClinicsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ContentLoaderModule,
    NgSelect2Module,
    NgxPaginationModule,
    MatTooltipModule,
    AgmCoreModule.forRoot({
      apiKey: environment.googleMapApiKey,
      libraries: ["places"]
    }),
	TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  MatDatepickerModule,
  MatNativeDateModule,
  MatFormFieldModule,
  MatInputModule,
  MatIconModule,
  ]
})
export class ClinicsModule { }
