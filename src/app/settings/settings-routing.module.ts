import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CitiesComponent } from './cities/cities.component';
import { EmailTemplateComponent } from './email-template/email-template.component';
import { RegionsComponent } from './regions/regions.component';
import { SpecializationsComponent } from './specializations/specializations.component';
import { WebSettingComponent } from './web-setting/web-setting.component';
import { CountriesComponent } from './countries/countries.component';
import { FaqComponent } from './faq/faq.component';
import { DiseasesComponent } from './diseases/diseases.component';
import { SymptomsComponent } from './symptoms/symptoms.component';
import { WalkthroughComponent } from './walkthrough/walkthrough.component';
import { AppointmentPriceComponent } from './appointment-price/appointment-price.component';

const routes: Routes = [
  { path: '', component: WebSettingComponent },
  { path: 'web-settings', component: WebSettingComponent },
  { path: 'appointment-price', component: AppointmentPriceComponent },
  { path: 'cities', component: CitiesComponent },
  { path: 'email-templates', component: EmailTemplateComponent },
  { path: 'regions', component: RegionsComponent },
  { path: 'specializations', component: SpecializationsComponent },
  { path: 'countries', component: CountriesComponent },
  { path: 'faq', component: FaqComponent  },
  { path: 'diseases', component: DiseasesComponent },
  { path: 'symptoms', component: SymptomsComponent },
  { path: 'walkthrough', component: WalkthroughComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
