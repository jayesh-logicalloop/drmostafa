import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { CommonService } from '../../services/common.service';
import { DoctorService } from '../../services/doctor.service';

@Component({
  selector: 'app-doctors',
  templateUrl: './doctors.component.html',
  styleUrls: ['./doctors.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DoctorsComponent implements OnInit {
  userType = '';
  user_id = '';
  clinic_id = '';

  doctorsDataLoader = false;
  doctors = [];

  constructor(
	private translate: TranslateService,
    private activatedRoute: ActivatedRoute,
    private commonService: CommonService,
    private doctorService: DoctorService,
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.userType = this.commonService.getUserData('group_name');
    let clinic_id = this.commonService.getUserData('clinic_id');
    /* const allowedUserTypes = ['Clinic', 'Super Admin'];
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
    this.getUserDoctors();
  }

  getUserDoctors() {
    let params = {};
    if(this.userType == 'Super Admin') {
      params['created_by'] = this.user_id;
    }
    this.doctorsDataLoader = true;
    this.doctorService.doctors(params).subscribe(
      (response:any)=>{
        if(response.status) {
          this.doctors = response.data;
        }
        this.doctorsDataLoader = false;
      }
    );
  }

}
