import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClinicsComponent } from './clinics.component';
import { ClinicUpdateComponent } from './clinic-update/clinic-update.component';

const routes: Routes = [
  { path: '', component: ClinicsComponent },
  { path:'update/:id', component: ClinicUpdateComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClinicsRoutingModule { }
