import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../services/common.service';
import { UserClinicsService } from '../../services/user-clinics.service';

@Component({
  selector: 'app-establishment',
  templateUrl: './establishment.component.html',
  styleUrls: ['./establishment.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class EstablishmentComponent implements OnInit {
  userType = '';
  user_id = '';

  constructor(
	private translate: TranslateService,
    private activatedRoute: ActivatedRoute,
    private commonService: CommonService,
    private userClinicsService: UserClinicsService,
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.userType = this.commonService.getUserData('group_name');
    /* const allowedUserTypes = ['Super Admin', 'Doctor'];
    if (!allowedUserTypes.includes(this.userType)) {
      this.commonService.userDefaultRoute();
    } */
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.user_id = params.get('user_id');
    });
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.getEstablishments();
  }

  clinicsDataLoader = false;
  clinics = [];
  getEstablishments() {
    this.clinicsDataLoader = true;
    let params = {};
    if(this.userType == 'Super Admin') {
      params['user_id'] = this.user_id;
    }
    this.userClinicsService.get(params).subscribe(
      (response: any) => {
        if (response.status) {
          this.clinics = response.data;
        }
        this.clinicsDataLoader = false;
      },
      (error) => { this.clinicsDataLoader = false; }
    )
  }

}
