import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CourseComponent } from './course.component';
import { UpdateComponent } from './update/update.component';

const routes: Routes = [
  { path: '', component: CourseComponent },
  { path: 'update/:id', component: UpdateComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CourseRoutingModule { }
