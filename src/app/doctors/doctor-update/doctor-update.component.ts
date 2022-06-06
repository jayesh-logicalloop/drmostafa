import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { ApiService } from '../../services/api.service';
import { CommonService } from '../../services/common.service';
import { DoctorService } from '../../services/doctor.service';
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
  selector: 'app-doctor-update',
  templateUrl: './doctor-update.component.html',
  styleUrls: ['./doctor-update.component.css'],
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
export class DoctorUpdateComponent implements OnInit {
  userData:any = {
    "profile_image_url": '',
  };
  user_id = '';
  userType = '';

  activeTab = 'info';

  updateDoctorForm: FormGroup;
  updateDoctorFormLoader = false;
  @ViewChild('ngprofileimagefileinput', { static: false }) ngprofileimagefileinput: ElementRef;
  emailRegex = this.commonService.emailRegex;
  dobAllowedMaxDate = new Date();

  find_in = 'session';
  storage_type = false;
  localUserData: any;

  constructor(
	private translate: TranslateService,
    private title: Title,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private commonService: CommonService,
    private doctorService: DoctorService,
    private alertService: AlertService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Profile');

    this.localUserData = this.commonService.getUserData();
    this.find_in = localStorage.getItem('find_in');
    if(this.find_in == 'local') {
      this.storage_type = true;
    }

    this.activatedRoute.queryParamMap.subscribe(params => {
      this.activeTab = params.get('tab') ? params.get('tab') : 'info';
    });

    this.updateDoctorForm = this.formBuilder.group({
      first_name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      last_name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      gender: ['', [
        Validators.required
      ]],
      mobile_number: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(15)
      ]],
      dob: ['', [
        Validators.required
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(this.emailRegex)
      ]],
      introduction: ['', [Validators.maxLength(1000)]]
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
      this.getDetail();
    });
  }

  getDetail() {
    this.updateDoctorFormLoader = true;
    let params = {};
    if(this.userType != 'Doctor') {
      params['user_id'] = this.user_id;
    }
    this.doctorService.detail(params).subscribe(
      (response: any) => {
        if (response.status) {
          this.userData = response.data;

          this.user_id = this.userData.user_id;
          this.updateDoctorForm.patchValue({
            first_name: this.userData.first_name,
            last_name: this.userData.last_name,
            gender: this.userData.gender,
            mobile_number: this.userData.mobile_number,
            email: this.userData.email,
            introduction: this.userData.introduction,
            dob: moment(this.userData.dob)
          });
          this.updateDoctorFormLoader = false
        } else {
          this.commonService.userDefaultRoute();
        }
      },
      (error) => { this.updateDoctorFormLoader = false; }
    );
  }

  onSubmitupdateDoctorForm() {
    if (this.updateDoctorForm.valid) {
      let formData = {
        token: this.commonService.getUserData('token'),
        first_name: this.updateDoctorForm.value.first_name,
        last_name: this.updateDoctorForm.value.last_name,
        gender: this.updateDoctorForm.value.gender,
        mobile_number: this.updateDoctorForm.value.mobile_number,
        email: this.updateDoctorForm.value.email,
        dob: this.updateDoctorForm.value.dob.format("YYYY-MM-DD"),
        introduction: this.updateDoctorForm.value.introduction
      };

      if(this.userType != 'Doctor') {
        formData['user_id'] = this.user_id;
      }

      this.updateDoctorFormLoader = true;
      this.doctorService.update(formData).subscribe(
        (response: any) => {
          if (response.status) {
            this.localUserData.full_name = this.updateDoctorForm.value.first_name+' '+this.updateDoctorForm.value.last_name;
            this.commonService.setUserData(this.localUserData, this.storage_type);
            this.apiService.userData.next(this.localUserData);
            this.alertService.show_alert(response.message);
          }
          this.updateDoctorFormLoader = false;
        }
      );
    }
  }

  onChangeProfileImage(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      const allowedMaxSize = 2 * 1024 *1024;
      const allowedFileTypes = ['image/png', 'image/jpeg'];
      const allowedMaxHeight = 2000;
      const allowedMaxWidth = 2000;

      let file = fileInput.target.files[0];

      if (!allowedFileTypes.includes(file.type)) {
        this.alertService.showValidationErrors('Only Images are allowed ( JPG | PNG )');
        return false;
      }

      if (file.size > allowedMaxSize) {
        this.alertService.showValidationErrors('Maximum size allowed is 2 MB');
        return false;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const image = new Image();
        image.src = e.target.result;
        image.onload = rs => {
          const img_height = rs.currentTarget['height'];
          const img_width = rs.currentTarget['width'];

          if (img_height > allowedMaxHeight && img_width > allowedMaxWidth) {
            //this.alertService.showValidationErrors('Maximum dimentions allowed ' + allowedMaxHeight + '*' + allowedMaxWidth + 'px');
            //return false;
          }
          const formData = new FormData;
          formData.append('token', this.commonService.getUserData('token'));
          if(this.userType != 'Doctor') {
            formData.append('user_id', this.user_id);
          }
          formData.append('profile_image', file);
          this.updateDoctorFormLoader = true;

          this.doctorService.update_profile_image(formData).subscribe(
            (response: any) => {
              if (response.status) {
                this.userData.profile_image_url = e.target.result;
                this.localUserData.profile_image_url = e.target.result;
                this.commonService.setUserData(this.localUserData, this.storage_type);
                this.apiService.userData.next(this.localUserData);
                this.alertService.show_alert(response.message);
              }
              this.updateDoctorFormLoader = false;
            },
            (error) => { this.updateDoctorFormLoader = false; }
          );
        };
      };
      reader.readAsDataURL(fileInput.target.files[0]);
      this.ngprofileimagefileinput.nativeElement.value = '';
    }
  }

}
