import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { MatTooltipModule } from '@angular/material/tooltip';
import { ContentLoaderModule } from '@ngneat/content-loader';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgxPaginationModule } from 'ngx-pagination';
import { CKEditorModule } from 'ckeditor4-angular';
import { NgSelect2Module } from 'ng-select2';
import { MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule} from '@angular/material';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

import { SettingsRoutingModule } from './settings-routing.module';
import { CitiesComponent } from './cities/cities.component';
import { EmailTemplateComponent } from './email-template/email-template.component';
import { RegionsComponent } from './regions/regions.component';
import { SpecializationsComponent } from './specializations/specializations.component';
import { WebSettingComponent } from './web-setting/web-setting.component';
import { CountriesComponent } from './countries/countries.component';
import { FaqComponent } from './faq/faq.component';
import { SymptomsComponent } from './symptoms/symptoms.component';
import { DiseasesComponent } from './diseases/diseases.component';
import { WalkthroughComponent } from './walkthrough/walkthrough.component';
import { AppointmentPriceComponent } from './appointment-price/appointment-price.component';


@NgModule({
  declarations: [
    CitiesComponent,
    EmailTemplateComponent,
    RegionsComponent,
    SpecializationsComponent,
    WebSettingComponent,
    CountriesComponent,
    FaqComponent,
    SymptomsComponent,
    DiseasesComponent,
    WalkthroughComponent,
    AppointmentPriceComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ContentLoaderModule,
    SweetAlert2Module,
    FullCalendarModule,
    NgxPaginationModule,
    SettingsRoutingModule,
    CKEditorModule,
    NgSelect2Module,
    NgxPaginationModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    NgxMaterialTimepickerModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    MatTooltipModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  exports: []
})
export class SettingsModule { }
