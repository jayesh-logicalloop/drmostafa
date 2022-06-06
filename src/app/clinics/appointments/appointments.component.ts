import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { CommonService } from '../../services/common.service';
import { AppointmentService } from '../../services/appointment.service';

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppointmentsComponent implements OnInit {
  userType = '';
  user_id = '';
  clinic_id = '';

  clinicAppointmentsDataLoader = false;
  clinicAppointments = [];

  constructor(
	private translate: TranslateService,
    private activatedRoute: ActivatedRoute,
    private commonService: CommonService,
    private appointmentService: AppointmentService,
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
    this.getClinicAppointments();
  }

  getClinicAppointments() {
    let params = {}
    if(this.userType == 'Super Admin') {
      params['clinic_id'] = this.clinic_id;
      params['doctor_id'] = this.user_id;
    } else if(this.userType == 'Clinic') {
      params['doctor_id'] = this.user_id;
    } else if(this.userType == 'Doctor') {
      params['clinic_id'] = this.clinic_id;
    }
    this.clinicAppointmentsDataLoader = true;
    this.appointmentService.appointments(params).subscribe(
      (response: any) => {
        if (response.status) {
          this.clinicAppointments = response.data;
        }
        this.clinicAppointmentsDataLoader = false;
      },
      (error) => { this.clinicAppointmentsDataLoader = false; }
    )
  }

}
