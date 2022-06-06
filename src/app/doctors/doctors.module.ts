import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ContentLoaderModule } from '@ngneat/content-loader';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { NgSelect2Module } from 'ng-select2';
import { MomentTimezonePickerModule } from 'moment-timezone-picker';
import { NgxSliderModule } from '@angular-slider/ngx-slider';

import { DoctorsRoutingModule } from './doctors-routing.module';

import { DoctorsComponent } from './doctors.component';
import { DoctorCardComponent } from './doctor-card/doctor-card.component';
import { DoctorUpdateComponent } from './doctor-update/doctor-update.component';
import { WorkScheduleComponent } from './work-schedule/work-schedule.component';
import { SettingsComponent } from './settings/settings.component';
import { SpecializationComponent } from './specialization/specialization.component';
import { ServicesComponent } from './services/services.component';
import { DocumentsComponent } from './documents/documents.component';
import { ExperienceComponent } from './experience/experience.component';
import { EducationComponent } from './education/education.component';
import { AwardsComponent } from './awards/awards.component';
import { EstablishmentComponent } from './establishment/establishment.component';

import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    DoctorsComponent,
    DoctorCardComponent,
    DoctorUpdateComponent,
    WorkScheduleComponent,
    SettingsComponent,
    SpecializationComponent,
    ServicesComponent,
    DocumentsComponent,
    ExperienceComponent,
    EducationComponent,
    AwardsComponent,
    EstablishmentComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTooltipModule,
    DoctorsRoutingModule,
    ContentLoaderModule,
    SweetAlert2Module,
    FullCalendarModule,
    NgxPaginationModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    NgxMaterialTimepickerModule,
    NgSelect2Module,
    MomentTimezonePickerModule,
    NgxSliderModule,
	TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  exports: [
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class DoctorsModule { }
