import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { CommonService } from '../../services/common.service';
import { UserSpecializationsService } from '../../services/user-specializations.service';
import { SpecializationService } from '../../services/specialization.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-specialization',
  templateUrl: './specialization.component.html',
  styleUrls: ['./specialization.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SpecializationComponent implements OnInit {
  userType = '';
  user_id = '';

  userSpecializationId = '';
  userSubSpecializationId = '';

  specializations = [];
  subSpecializations = [];

  specializationForm: FormGroup;
  specializationFormLoader = false;

  constructor(
	private translate: TranslateService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private userSpecializationsService: UserSpecializationsService,
    private specializationService: SpecializationService,
    private alertService: AlertService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.specializationForm = this.formBuilder.group({
      specialization_id: ['', [Validators.required]],
      sub_specialization_id: ['', [Validators.required]]
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
      this.userSpecialization();
    });
  }

  userSpecialization() {
    this.specializationFormLoader = true;
    let params = {};
    if(this.userType != 'Doctor') {
      params['user_id'] = this.user_id;
    }
    this.userSpecializationsService.get(params).subscribe(
      (response:any) => {
        this.userSpecializationId = response.data[0].specialization_id;
        this.userSubSpecializationId = response.data[0].sub_specialization_id;
        this.specializationFormLoader = false;
      },
      (error) => { this.specializationFormLoader = false; },
      () => { this.getSpecializations(); }
    );
  }

  getSpecializations() {
    this.specializationFormLoader = true;
    this.specializationService.get('', {parent_id:'0', pagination:'No'}).subscribe(
      (response: any) => {
        if (response.status) {
          this.specializations = response.data;
          this.specializations.map( x => {
            if(x.specialization_id == this.userSpecializationId) {
              this.subSpecializations = x.sub_specialization;
            }
          });
          this.specializationForm.patchValue({
            specialization_id: this.userSpecializationId,
            sub_specialization_id: this.userSubSpecializationId
          });
          this.specializationFormLoader = false;
        }
      },
      (error) => { this.specializationFormLoader = false; }
    );
  }

  onChangeSpecialization(specialization_id:string) {
    this.specializations.map( x => {
      if(x.specialization_id == specialization_id) {
        this.subSpecializations = x.sub_specialization;
      }
    });
    this.specializationForm.patchValue({sub_specialization_id: ''});
  }

  onSubmitSpecializationForm() {
    if(this.specializationForm.valid) {
      let formData = {
        token: this.commonService.getUserData('token'),
        specialization_id: this.specializationForm.value.specialization_id,
        sub_specialization_id: this.specializationForm.value.sub_specialization_id
      }
      if(this.userType != 'Doctor') {
        formData['user_id'] = this.user_id;
      }

      this.specializationFormLoader = true;
      this.userSpecializationsService.update(formData).subscribe(
        (response:any) => {
          if(response.status) {
            this.alertService.show_alert(response.message);
          }
          this.specializationFormLoader = false;
        },
        (error) => { this.specializationFormLoader = false; }
      );
    }
  }

}
