import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SessionComponent } from './session.component';
import { UpdateComponent } from './update/update.component';

const routes: Routes = [
  { path: '', component: SessionComponent },
  { path: 'update/:id', component: UpdateComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SessionRoutingModule { }
