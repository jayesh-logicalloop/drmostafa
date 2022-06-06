import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ContentLoaderModule } from '@ngneat/content-loader';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelect2Module } from 'ng-select2';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

import { AppointmentsRoutingModule } from './appointments-routing.module';
import { AppointmentsComponent } from './appointments.component';
import { AppointmentCalendarComponent } from './appointment-calendar/appointment-calendar.component';
import { ConsultComponent } from './consult/consult.component';
import { DetailComponent } from './detail/detail.component';
import { CKEditorModule } from 'ckeditor4-angular';
import { CommonService } from '../services/common.service';


@NgModule({
  declarations: [
    AppointmentsComponent,
    AppointmentCalendarComponent,
    ConsultComponent,
    DetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppointmentsRoutingModule,
    ContentLoaderModule,
    SweetAlert2Module,
    FullCalendarModule,
    NgxPaginationModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    NgxMaterialTimepickerModule,
    NgSelect2Module,
    CKEditorModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  exports: [
    AppointmentCalendarComponent
  ],
  providers:[
    CommonService
  ]
})
export class AppointmentsModule { }
