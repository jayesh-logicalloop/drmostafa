import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { CommonService } from '../../services/common.service';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PatientsComponent implements OnInit {
  userType = '';
  user_id = '';
  clinic_id = '';

  clinicPatientsDataLoader = false;
  clinicPatients = [];

  constructor(
	private translate: TranslateService,
    private activatedRoute: ActivatedRoute,
    private commonService: CommonService,
    private usersService: UsersService,
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.userType = this.commonService.getUserData('group_name');
    let clinic_id = this.commonService.getUserData('clinic_id');
    /* const allowedUserTypes = ['Doctor', 'Clinic', 'Super Admin'];
    if (!allowedUserTypes.includes(this.userType)) {
      this.commonService.userDefaultRoute();
    } */
    if(this.userType == 'Clinic') {
      this.clinic_id = clinic_id;
    } else {
      this.activatedRoute.queryParamMap.subscribe(params => {
        this.clinic_id = params.get('id');
        this.user_id = params.get('user_id');
      });
    }
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.getUsers();
  }

  getUsers() {
    let params = {}
    if(this.userType == 'Super Admin') {
      params['clinic_id'] = this.clinic_id;
      params['doctor_id'] = this.user_id;
    } else if(this.userType == 'Clinic') {
      params['doctor_id'] = this.user_id;
    } else if(this.userType == 'Doctor') {
      params['clinic_id'] = this.clinic_id;
    }
    this.clinicPatientsDataLoader = true;
    this.usersService.get(params).subscribe(
      (response: any) => {
        if (response.status) {
          this.clinicPatients = response.data;
        }
        this.clinicPatientsDataLoader = false;
      },
      (error) => { this.clinicPatientsDataLoader = false; }
    )
  }



}
