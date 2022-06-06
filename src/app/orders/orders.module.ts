import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule, MatTooltipModule } from '@angular/material';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

import { OrdersRoutingModule } from './orders-routing.module';
import { OrdersComponent } from './orders.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { PayoutsComponent } from './payouts/payouts.component';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';



@NgModule({
  declarations: [OrdersComponent, OrderDetailComponent, PayoutsComponent],
  imports: [
    CommonModule,
    OrdersRoutingModule,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    SweetAlert2Module,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    NgxDaterangepickerMd.forRoot(),
  ]
})
export class OrdersModule { }
