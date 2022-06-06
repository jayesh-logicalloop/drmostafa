import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

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

import { ApiService } from '../services/api.service';
import { CommonService } from '../services/common.service';
import { AccountService } from '../services/account.service';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html',
  styleUrls: ['./update-profile.component.css'],
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
export class UpdateProfileComponent implements OnInit {
  userType = '';
  emailRegex = this.commonService.emailRegex;
  maxDobDate = this.commonService.maxDobDate;

  find_in = 'session';
  storage_type = false;
  localUserData: any;

  updateProfileForm: FormGroup;
  showLoader = false;
  profile_image_src = this.commonService.defaultImage;

  constructor(
	private translate: TranslateService,
    private title: Title,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private commonService: CommonService,
    private accountService: AccountService,
    private alertService: AlertService,
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Update Profile');
    this.localUserData = this.commonService.getUserData();
    this.updateProfileForm = this.formBuilder.group({
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
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(this.emailRegex),
        Validators.maxLength(100)
      ]],
      mobile_number: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(15),
      ]],
      gender: ['', [
        Validators.required
      ]],
      dob: ['', [
        Validators.required
      ]],
      introduction: ['', [
        Validators.maxLength(1000)
      ]]
    });
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.find_in = localStorage.getItem('find_in');
    if(this.find_in == 'local') {
      this.storage_type = true;
    }
    this.showLoader = true;
    this.accountService.admin_profile_data().subscribe(
      (response: any) => {
        if (response.status) {
          let userDetail = response.data;
          this.updateProfileForm.patchValue({
            first_name: userDetail.first_name,
            last_name: userDetail.last_name,
            email: userDetail.email,
            mobile_number: userDetail.mobile_number,
            gender: userDetail.gender,
            dob: userDetail.dob ? moment(userDetail.dob) : '',
            introduction: userDetail.introduction
          });
          this.profile_image_src = userDetail.profile_image_url;
          this.showLoader = false;
        }
      }
    );
  }

  onSubmitUpdateProfileForm() {
    if (this.updateProfileForm.valid) {
      this.showLoader = true;
      let putData = {
        token: this.commonService.getUserData('token'),
        first_name: this.updateProfileForm.value.first_name,
        last_name: this.updateProfileForm.value.last_name,
        email: this.updateProfileForm.value.email,
        mobile_number: this.updateProfileForm.value.mobile_number,
        gender: this.updateProfileForm.value.gender,
        dob: this.updateProfileForm.value.dob.format('YYYY-MM-DD'),
        introduction: this.updateProfileForm.value.introduction
      }
      this.accountService.admin_profile_update(putData).subscribe(
        (response: any) => {
          if (response.status) {
            this.alertService.show_alert(response.message);
            this.localUserData.full_name = this.updateProfileForm.value.first_name + ' ' + this.updateProfileForm.value.last_name;
            this.commonService.setUserData(this.localUserData, this.storage_type);
            this.apiService.userData.next(this.localUserData);
          }
          this.showLoader = false;
        },
        (error) => { this.showLoader = false; },
        () => { this.showLoader = false; }
      )
    }
  }

  onChangeProfileImage(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      let file = fileInput.target.files[0];

      const allowedMaxHeight = 500;
      const allowedMaxWidth = 500;

      const allowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedFileTypes.includes(file.type)) {
        this.alertService.showValidationErrors('Only JPG or PNG files allowed');
        return false;
      }

      const allowedMaxSize = 2 * 1024 * 1024;
      if (file.size > allowedMaxSize) {
        this.alertService.showValidationErrors('Maximum size allowed is 2 MB');
        return false;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const image = new Image();
        image.src = e.target.result;
        image.onload = rs => {
          const imgHeight = rs.currentTarget['height'];
          const imgWidth = rs.currentTarget['width'];

          if (imgHeight > allowedMaxHeight && imgWidth > allowedMaxWidth) {
            //this.alertService.showValidationErrors('Maximum dimentions allowed ' + allowedMaxHeight + '*' + allowedMaxWidth + 'px');
            //return false;
          }

          const formData = new FormData;
          formData.append('token', this.commonService.getUserData('token'));
          formData.append('profile_image', file);
          this.showLoader = true;
          this.accountService.update_profile_image(formData).subscribe(
            (response: any) => {
              if (response.status) {
                this.profile_image_src = response.data;
                this.localUserData.profile_image_url = response.data;
                this.commonService.setUserData(this.localUserData, this.storage_type);
                this.apiService.userData.next(this.localUserData);
                this.alertService.show_alert('Image Updated');
              }
              this.showLoader = false;
            },
            (error) => { this.showLoader = false; }
          );
        };
      };
      reader.readAsDataURL(file);
    }
  }
}
