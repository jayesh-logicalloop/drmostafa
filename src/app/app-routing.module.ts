import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './services/auth.guard';

import { LoginComponent } from './login/login.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { UpdateProfileComponent } from './update-profile/update-profile.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DrugCatalogComponent } from './drug-catalog/drug-catalog.component';
import { CareersComponent } from './careers/careers.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { AnnouncementsComponent } from './announcements/announcements.component';
import { FeedsComponent } from './feeds/feeds.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'reset-password/:code', component: ResetPasswordComponent },
  { path: 'forgot-password', component: ForgetPasswordComponent },
  { path: 'update-profile', component: UpdateProfileComponent, canActivate: [AuthGuard] },
  { path: 'change-password', component: ChangePasswordComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'careers', component: CareersComponent , canActivate: [AuthGuard] },
  { path: 'contact-us', component: ContactUsComponent , canActivate: [AuthGuard] },
  { path: 'drug-catalog', component: DrugCatalogComponent, canActivate: [AuthGuard] },
  { path: 'notifications', component: NotificationsComponent, canActivate: [AuthGuard] },
  { path: 'announcements', component: AnnouncementsComponent, canActivate: [AuthGuard] },
  { path: 'feeds', component: FeedsComponent, canActivate: [AuthGuard] },

  { path: 'articles', loadChildren: () => import('./article/article.module').then(m => m.ArticleModule), canActivate: [AuthGuard] },
  { path: 'healthfeeds', loadChildren: () => import('./article/article.module').then(m => m.ArticleModule), canActivate: [AuthGuard] },

  /* { path: 'doctors', loadChildren: () => import('./doctors/doctors.module').then(m => m.DoctorsModule), canActivate: [AuthGuard] }, */

  { path: 'appointments', loadChildren: () => import('./appointments/appointments.module').then(m => m.AppointmentsModule), canActivate: [AuthGuard] },

  { path: 'feedbacks', loadChildren: () => import('./feedbacks/feedbacks.module').then(m => m.FeedbacksModule), canActivate: [AuthGuard] },

  { path: 'settings', loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule), canActivate: [AuthGuard] },

  { path: 'my-establishments', loadChildren: () => import('./clinics/clinics.module').then(m => m.ClinicsModule), canActivate: [AuthGuard] },

  { path: 'establishment', loadChildren: () => import('./clinics/clinics.module').then(m => m.ClinicsModule), canActivate: [AuthGuard] },

  { path: 'establishments', loadChildren: () => import('./establishment/establishment.module').then(m => m.EstablishmentModule), canActivate: [AuthGuard]  },

  { path: 'order', loadChildren: () => import('./orders/orders.module').then(m => m.OrdersModule), canActivate: [AuthGuard] },
  { path: 'orders', loadChildren: () => import('./orders/orders.module').then(m => m.OrdersModule), canActivate: [AuthGuard] },

  { path: 'cms', loadChildren: () => import('./cms/cms.module').then(m => m.CmsModule), canActivate: [AuthGuard] },
  { path: 'patients', loadChildren: () => import('./users/users.module').then(m => m.UserModule), canActivate: [AuthGuard] },
  { path: 'user', loadChildren: () => import('./users/users.module').then(m => m.UserModule), canActivate: [AuthGuard] },

  { path: 'book', loadChildren: () => import('./book/book.module').then(m => m.BookModule), canActivate: [AuthGuard] },
  { path: 'books', loadChildren: () => import('./book/book.module').then(m => m.BookModule), canActivate: [AuthGuard] },

  { path: 'course', loadChildren: () => import('./course/course.module').then(m => m.CourseModule), canActivate: [AuthGuard] },
  { path: 'courses', loadChildren: () => import('./course/course.module').then(m => m.CourseModule), canActivate: [AuthGuard] },

  { path: 'session', loadChildren: () => import('./session/session.module').then(m => m.SessionModule), canActivate: [AuthGuard] },
  { path: 'sessions', loadChildren: () => import('./session/session.module').then(m => m.SessionModule), canActivate: [AuthGuard] },

  { path: 'administration', loadChildren: () => import('./administration/administration.module').then(m => m.AdministrationModule), canActivate: [AuthGuard]},

  { path: 'coupon', loadChildren: () => import('./coupon/coupon.module').then(m => m.CouponModule), canActivate: [AuthGuard]  },
  { path: 'coupons', loadChildren: () => import('./coupon/coupon.module').then(m => m.CouponModule), canActivate: [AuthGuard]  },

  { path: '**', redirectTo: '/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
