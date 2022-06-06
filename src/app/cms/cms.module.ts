import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContentLoaderModule } from '@ngneat/content-loader';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';
import { CKEditorModule } from 'ckeditor4-angular';

import { CmsRoutingModule } from './cms-routing.module';
import { ManageMenusComponent } from './manage-menus/manage-menus.component';
import { ManageContentComponent } from './manage-content/manage-content.component';
import { ManageSlidersComponent } from './manage-sliders/manage-sliders.component';
import { SpecialityComponent } from './speciality/speciality.component';

import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}


@NgModule({
  declarations: [
    ManageMenusComponent,
    ManageContentComponent,
    ManageSlidersComponent,
    SpecialityComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ContentLoaderModule,
    SweetAlert2Module,
    NgxPaginationModule,
    CmsRoutingModule,
    CKEditorModule,
	TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ]
})
export class CmsModule { }
