import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManageContentComponent } from './manage-content/manage-content.component';
import { ManageMenusComponent } from './manage-menus/manage-menus.component';
import { ManageSlidersComponent } from './manage-sliders/manage-sliders.component';
import { SpecialityComponent } from './speciality/speciality.component';

const routes: Routes = [
  { path: 'menus', component: ManageMenusComponent },
  { path: 'content', component: ManageContentComponent},
  { path: 'sliders', component: ManageSlidersComponent},
  { path: 'speciality', component: SpecialityComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CmsRoutingModule { }
