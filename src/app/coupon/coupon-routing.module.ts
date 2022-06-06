import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CouponComponent } from './coupon.component';
import { UpdateComponent } from './update/update.component';

const routes: Routes = [
  { path: '', component: CouponComponent },
  { path: ':id', component: UpdateComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CouponRoutingModule { }
