import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ContentLoaderModule } from '@ngneat/content-loader';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule } from '@angular/material';

import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

import { FeedbacksRoutingModule } from './feedbacks-routing.module';
import { FeedbacksComponent } from './feedbacks.component';
import { FeedbackCardComponent } from './feedback-card/feedback-card.component';


@NgModule({
  declarations: [
    FeedbacksComponent,
    FeedbackCardComponent
  ],
  imports: [
    CommonModule,
    FeedbacksRoutingModule,
    ContentLoaderModule,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
	TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  exports: [FeedbackCardComponent,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class FeedbacksModule { }
