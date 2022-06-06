import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsersComponent } from './users.component';
import { UpdateUserComponent } from './update-user/update-user.component';

const routes: Routes = [
  { path: '', component: UsersComponent },
  { path: 'update/:user_alias', component: UpdateUserComponent },
  { path: 'detail/:user_alias', component: UpdateUserComponent },
  { path: 'profile', component: UpdateUserComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
