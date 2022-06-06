import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { CommonService } from '../../services/common.service';
import { UserSettingsService } from '../../services/user-settings.service';
import { SpecializationService } from '../../services/specialization.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SettingsComponent implements OnInit {
  userType = '';
  user_id = '';

  settingsForm:FormGroup;
  settingsFormLoader = false;
  userSettings:any;

  years = this.commonService.years();
  months = this.commonService.months();

  specializations = [];

  constructor(
	private translate: TranslateService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private userSettingsService: UserSettingsService,
    private specializationService: SpecializationService,
    private alertService: AlertService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.settingsForm = this.formBuilder.group({
      specialization: ['', [
        Validators.required
      ]],
      practice_started_month: ['', [
        Validators.required
      ]],
      practice_started_year: ['', [
        Validators.required
      ]],
      consultation_fee: ['', [
        Validators.required,
        Validators.maxLength(4)
      ]],
      session_duration: ['', [
        Validators.required,
        Validators.maxLength(3)
      ]],
      session_gap: ['', [
        Validators.required,
        Validators.maxLength(2)
      ]],
      status: ['', [
        Validators.required
      ]],
    });
  }

  ngOnInit() {
    this.getSpecializations();
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
      this.getUserSettings();
    });
  }

  getUserSettings() {
    this.settingsFormLoader = true;
    let params = {};
    if(this.userType != 'Doctor') {
      params['user_id'] = this.user_id;
    }
    this.userSettingsService.get(params).subscribe(
      (response:any) => {
        if(response.status) {
          this.userSettings = response.data;

          if(this.userSettings.specialization) {
            this.settingsForm.patchValue({specialization: this.userSettings.specialization});
          }

          if(this.userSettings.practice_started_month) {
            this.settingsForm.patchValue({practice_started_month: this.userSettings.practice_started_month});
          }

          if(this.userSettings.practice_started_year) {
            this.settingsForm.patchValue({practice_started_year: this.userSettings.practice_started_year});
          }

          if(this.userSettings.consultation_fee) {
            this.settingsForm.patchValue({consultation_fee: this.userSettings.consultation_fee});
          }

          if(this.userSettings.session_duration) {
            this.settingsForm.patchValue({session_duration: this.userSettings.session_duration});
          }

          if(this.userSettings.session_gap) {
            this.settingsForm.patchValue({session_gap: this.userSettings.session_gap});
          }

          if(this.userSettings.status) {
            this.settingsForm.patchValue({status: this.userSettings.status});
          }
        }
        this.settingsFormLoader = false;
      }
    );
  }

  onSubmitSettingsForm() {
    if(this.settingsForm.valid) {
      let formData = {
        token: this.commonService.getUserData('token'),
        settings: []
      };
      if(this.userType != 'Doctor') {
        formData['user_id'] = this.user_id;
      }
      formData.settings.push({meta_key:'specialization', meta_value:this.settingsForm.value.specialization});
      formData.settings.push({meta_key:'practice_started_month', meta_value:this.settingsForm.value.practice_started_month});
      formData.settings.push({meta_key:'practice_started_year', meta_value:this.settingsForm.value.practice_started_year});
      formData.settings.push({meta_key:'consultation_fee', meta_value:this.settingsForm.value.consultation_fee});
      formData.settings.push({meta_key:'session_duration', meta_value:this.settingsForm.value.session_duration});
      formData.settings.push({meta_key:'session_gap', meta_value:this.settingsForm.value.session_gap});
      formData.settings.push({meta_key:'status', meta_value:this.settingsForm.value.status});

      this.settingsFormLoader = true;
      this.userSettingsService.update(formData).subscribe(
        (response:any) => {
          if(response.status) {
            this.alertService.show_alert(response.message);
          }
          this.settingsFormLoader = false;
        },
        (error) => {
          this.getUserSettings();
          this.settingsFormLoader = false;
        }
      );
    }
  }

  getSpecializations() {
    this.specializationService.get('', {parent_id:'0', pagination:'No'}).subscribe(
      (response: any) => {
        if (response.status) {
          this.specializations = response.data;
        }
      }
    );
  }

}
