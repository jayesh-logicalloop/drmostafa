import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { NgxPaginationModule } from 'ngx-pagination';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';

import { UsersRoutingModule } from './users-routing.module';
import { UsersComponent } from './users.component';
import { UpdateUserComponent } from './update-user/update-user.component';
import { HealthRecordComponent } from './health-record/health-record.component';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    UsersComponent,
    UpdateUserComponent,
    HealthRecordComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UsersRoutingModule,
    NgxPaginationModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    SweetAlert2Module,
    TranslateModule.forChild({
      defaultLanguage: 'en',
      useDefaultLang: true,
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    NgxIntlTelInputModule,
  ]
})
export class UserModule { }
