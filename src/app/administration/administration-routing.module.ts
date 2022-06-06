import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PermissionsComponent } from './permissions/permissions.component';
import { AdministratorsComponent } from './administrators/administrators.component';
import { PagemenusComponent } from './pagemenus/pagemenus.component';

const routes: Routes = [
  { path: 'administrators', component: AdministratorsComponent },
  { path: 'permissions', component: PermissionsComponent },
  { path: 'pagemenus', component: PagemenusComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministrationRoutingModule { }
