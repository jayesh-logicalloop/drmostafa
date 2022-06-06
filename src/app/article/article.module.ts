import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleRoutingModule } from './article-routing.module';
import { ArticleComponent } from './article.component';
import { CKEditorModule } from 'ckeditor4-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContentLoaderModule } from '@ngneat/content-loader';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatDatepickerModule,MatNativeDateModule,MatFormFieldModule,MatInputModule} from '@angular/material';
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule,NgxMatNativeDateModule } from '@angular-material-components/datetime-picker';
import { NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import { MatMomentDateModule } from "@angular/material-moment-adapter";
import { NgSelect2Module } from 'ng-select2';

import { UpdateArticleComponent } from './update-article/update-article.component';
import { AddArticleComponent } from './add-article/add-article.component';
import { ArticleCategoryComponent } from './article-category/article-category.component';

import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    ArticleComponent,
    AddArticleComponent,
    UpdateArticleComponent,
    ArticleCategoryComponent
  ],
  imports: [
    CommonModule,
    ArticleRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ContentLoaderModule,
    SweetAlert2Module,
    FullCalendarModule,
    NgxPaginationModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    NgxMaterialTimepickerModule,
    CKEditorModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule,
    MatMomentDateModule,
    NgSelect2Module,
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
     MatInputModule,
     MatMomentDateModule,
     NgxMatDatetimePickerModule,
     NgxMatTimepickerModule
  ],
})
export class ArticleModule { }
