import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatTooltipModule } from '@angular/material/tooltip';
import { ContentLoaderModule } from '@ngneat/content-loader';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { MatFormFieldModule, MatInputModule} from '@angular/material';

import { AdministrationRoutingModule } from './administration-routing.module';
import { PermissionsComponent } from './permissions/permissions.component';
import { AdministratorsComponent } from './administrators/administrators.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatTreeModule } from '@angular/material/tree';
import { PagemenusComponent } from './pagemenus/pagemenus.component';

import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}


@NgModule({
  declarations: [
    AdministratorsComponent, 
    PagemenusComponent,
    PermissionsComponent, 
  ],
  imports: [
    CommonModule,
    AdministrationRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    ContentLoaderModule,
    SweetAlert2Module, 
    MatFormFieldModule,
    MatInputModule,    
    MatTooltipModule,   
    MatTreeModule,
	TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ]
})
export class AdministrationModule { }
