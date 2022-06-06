import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrdersComponent } from './orders.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { PayoutsComponent } from './payouts/payouts.component';

const routes: Routes = [
  { path: '', component: OrdersComponent },
  { path: 'detail/:order_id', component: OrderDetailComponent },
  { path: ':order_id', component: OrderDetailComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdersRoutingModule { }
