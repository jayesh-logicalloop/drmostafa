import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DoctorsComponent } from './doctors.component';
import { DoctorUpdateComponent } from './doctor-update/doctor-update.component';

const routes: Routes = [
  { path: '', component: DoctorsComponent },
  { path: 'update/:user_id', component: DoctorUpdateComponent },
  { path: 'detail/:user_id', component: DoctorUpdateComponent },
  { path: 'update-profile', component: DoctorUpdateComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DoctorsRoutingModule { }
