import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Options } from '@angular-slider/ngx-slider';
import { TranslateService } from '@ngx-translate/core';

import { CommonService } from '../../services/common.service';
import { UserClinicsService } from '../../services/user-clinics.service';
import { UserSettingsService } from '../../services/user-settings.service';
import { WorkscheduleService } from '../../services/workschedule.service';
import { ModalService } from '../../services/modal.service';
import { AlertService } from '../../services/alert.service';

import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as _moment from 'moment';
const moment = _moment;
export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-work-schedule',
  templateUrl: './work-schedule.component.html',
  styleUrls: ['./work-schedule.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class WorkScheduleComponent implements OnInit {
  userType = '';
  user_id = '';

  userClinics = [];
  userSettings:any;

  dailySchedules = [];
  specificSchedules = [];

  minAllowedDate = this.commonService.maxDobDate;

  workScheduleForm: FormGroup;
  days: FormArray;
  workScheduleFormLoader = false;
  @ViewChild('myavailabilityform', { static: false }) myavailabilityform: NgForm;
  weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  meetingTime = 15;
  paddingTime = 0;
  times = this.commonService.breakTimes(1);

  mrMinValue = 360;
  mrMaxValue = 719;
  mrOptions: Options = {
    floor: 360,
    ceil: 719,
    step: 1,
    translate: (value: number): string => {
      if(value === 360) {
        return '06:00 am';
      } else if(value === 719) {
        return '11:59 am';
      }
      return this.times[value];
    }
  };

  afMinValue = 720;
  afMaxValue = 1019;
  afOptions: Options = {
    floor: 720,
    ceil: 1019,
    step: 1,
    translate: (value: number): string => {
      if(value === 720) {
        return '12:00 pm';
      } else if(value === 1019) {
        return '04:59 pm';
      }
      return this.times[value];
    }
  };

  evMinValue = 1020;
  evMaxValue = 1199;
  evOptions: Options = {
    floor: 1020,
    ceil: 1199,
    step: 1,
    translate: (value: number): string => {
      if(value === 1020) {
        return '05:00 pm';
      } else if(value === 1199) {
        return '07:59 pm';
      }
      return this.times[value];
    }
  };

  t2 = this.times.slice(1200, 1439).concat(this.times.slice(0, 360));
  ngMinValue = 0;
  ngMaxValue = 599;
  ngOptions: Options = {
    floor: 0,
    ceil: 599,
    step: 1,
    translate: (value: number): string => {
      if(value === 0) {
        return '08:00 pm';
      } else if(value === 599) {
        return '05:59 am';
      }
      return this.t2[value];
    }
  };

  constructor(
	private translate: TranslateService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private workscheduleService: WorkscheduleService,
    private userClinicsService: UserClinicsService,
    private userSettingsService: UserSettingsService,
    private modalService: ModalService,
    private alertService: AlertService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.workScheduleForm = this.formBuilder.group({
      clinic_id: ['', Validators.required],
      schedule_type: ['Daily', Validators.required],
      availability_type: ['Available', Validators.required],
      from_date: [''],
      to_date: [''],
      meeting_time: [this.meetingTime],
      padding_time: [this.paddingTime],
      days: this.formBuilder.array(this.createDays()),
      morning: this.formBuilder.group({from_time: '', to_time:''}),
      afternoon: this.formBuilder.group({from_time: '', to_time:''}),
      evening: this.formBuilder.group({from_time: '', to_time:''}),
      night: this.formBuilder.group({from_time: '', to_time:''}),
      reason: [''],
    });
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.userType = this.commonService.getUserData('group_name');
    /* const allowedUserTypes = ['Clinic', 'Doctor', 'Super Admin'];
    if (!allowedUserTypes.includes(this.userType)) {
      this.commonService.userDefaultRoute();
    } */

    this.activatedRoute.params.subscribe(routeParams => {
      if(this.userType != 'Doctor') {
        this.user_id = routeParams.user_id ? routeParams.user_id : '';
      }
      this.getWorkSchedule('daily');
      this.getWorkSchedule('specific');
    });
    this.getUserClinics();
  }

  getUserClinics() {
    let params = {joined_only: 'yes'};
    if(this.userType != 'Doctor') {
      params['user_id'] = this.user_id;
    }
    this.userClinicsService.select2(params).subscribe(
      (response:any) => {
        if(response.status) {
          this.userClinics = response.data;
        }
      }
    );
  }

  getWorkSchedule(schedule_type: string) {
    let params = {schedule_type: schedule_type};
    if(this.userType != 'Doctor') {
      params['user_id'] = this.user_id;
    }
    this.workscheduleService.get(params).subscribe(
      (response: any) => {
        if(schedule_type == 'daily') {
          this.dailySchedules = response.data;
        } else {
          this.specificSchedules = response.data;
        }
      }
    );
  }

  getUserSettings() {
    let params = {};
    if(this.userType != 'Doctor') {
      params['user_id'] = this.user_id;
    }
    this.userSettingsService.get(params).subscribe(
      (response:any) => {
        if(response.status) {
          this.userSettings = response.data;
          if(this.userSettings.session_duration && this.userSettings.session_duration > 0) {
            this.meetingTime = this.userSettings.session_duration
          }
          if(this.userSettings.session_gap) {
            this.paddingTime = this.userSettings.session_gap
          }
        }
      }
    );
  }

  openAddWorkScheduleForm() {
    //this.workScheduleForm.reset();
    //this.myavailabilityform.resetForm();
    this.workScheduleForm.patchValue({
      clinic_id: '',
      schedule_type: 'Daily',
      availability_type: 'Available',
      meeting_time: this.meetingTime,
      padding_time: this.paddingTime
    });
    this.modalService.open_modal('#addWorkScheduleModal');
  }

  createDays(): FormGroup[] {
    const arr = this.weekDays.map(day_name => {
      return this.formBuilder.group({day: [day_name], available: [false]});
    });
    return arr;
  }

  onChangeScheduleType(schedule_type:string) {
    if (schedule_type == 'Daily') {
      this.workScheduleForm.patchValue({
        availability_type: 'Available'
      })
    } else {
      this.workScheduleForm.patchValue({
        availability_type: 'Unavailable'
      })
    }
  }

  onSubmitWorkScheduleForm() {
    //console.log('this.workScheduleForm', this.workScheduleForm);
    //console.log('morning', this.times[this.mrMinValue], this.times[this.mrMaxValue]);
    //console.log('afternoon', this.times[this.afMinValue], this.times[this.afMaxValue]);
    //console.log('evening', this.times[this.evMinValue], this.times[this.evMaxValue]);
    //console.log('night', this.t2[this.ngMinValue], this.t2[this.ngMaxValue]);

    if (this.workScheduleForm.valid) {
      const from_date = this.workScheduleForm.value.from_date ? this.workScheduleForm.value.from_date.format("YYYY-MM-DD") : '';
      const to_date = this.workScheduleForm.value.to_date ? this.workScheduleForm.value.to_date.format("YYYY-MM-DD") : '';

      let formData = new FormData();
      formData.append('token', this.commonService.getUserData('token')),
      formData.append('clinic_id', this.workScheduleForm.value.clinic_id);
      formData.append('schedule_type', this.workScheduleForm.value.schedule_type);
      formData.append('availability_type', this.workScheduleForm.value.availability_type);
      formData.append('day', this.workScheduleForm.value.day_name);
      formData.append('from_date', from_date);
      formData.append('to_date', to_date);
      formData.append('schedule_shift', this.workScheduleForm.value.schedule_shift);
      formData.append('from_time', this.workScheduleForm.value.from_time);
      formData.append('to_time', this.workScheduleForm.value.to_time);
      formData.append('meeting_time', this.workScheduleForm.value.meeting_time);
      formData.append('padding_time', this.workScheduleForm.value.padding_time);
      formData.append('reason', this.workScheduleForm.value.reason);

      this.workScheduleForm.value.days.map(day => {
        if(day.available) {
          formData.append('days[]', day.day);
        }
      });

      formData.append('morning[from_time]', this.times[this.mrMinValue]);
      formData.append('morning[to_time]', this.times[this.mrMaxValue]);
      formData.append('afternoon[from_time]', this.times[this.afMinValue]);
      formData.append('afternoon[to_time]', this.times[this.afMaxValue]);
      formData.append('evening[from_time]', this.times[this.evMinValue]);
      formData.append('evening[to_time]', this.times[this.evMaxValue]);
      formData.append('night[from_time]', this.times[this.ngMinValue]);
      formData.append('night[to_time]', this.times[this.ngMaxValue]);

      if(this.userType != 'Doctor') {
        formData.append('user_id', this.user_id);
      }
      this.workScheduleFormLoader = true;
      this.workscheduleService.create(formData).subscribe(
        (response: any) => {
          if (response.status) {
            this.getWorkSchedule('daily');
            this.getWorkSchedule('specific');
            this.modalService.close_modal('#addWorkScheduleModal');
            this.alertService.show_alert(response.message);
          }
          this.workScheduleFormLoader = false;
        },
        (error) => { this.workScheduleFormLoader = false; }
      );
    }
  }

  deleteWorkSchedule(clinic_id:string, type:string, id_day_date:string) {
    Swal.fire({
      title: 'Delete',
      text: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        let fromData = {
          clinic_id:clinic_id,
          type: type, //item,item_name,date
        };
        if(this.userType != 'Doctor') {
          fromData['user_id'] = this.user_id;
        }
        if (type == 'item') {
          fromData['schedule_id'] = id_day_date;
        } else {
          fromData['day'] = id_day_date;
        }
        this.workScheduleFormLoader = true;
        this.workscheduleService.delete(fromData).subscribe(
          (response: any) => {
            if (response.status) {
              this.getWorkSchedule('daily');
              this.getWorkSchedule('specific');
            }
            this.workScheduleFormLoader = false;
          },
          (error) => {
            this.workScheduleFormLoader = false;
          }
        );
      }
    });
  }
}
