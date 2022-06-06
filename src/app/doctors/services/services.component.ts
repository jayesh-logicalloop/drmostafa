import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { CommonService } from '../../services/common.service';
import { UserServicesService } from '../../services/user-services.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ServicesComponent implements OnInit {
  userType = '';
  user_id = '';

  service_id:string
  service_fee:string;
  serviceForm: FormGroup;
  serviceFormLoader = false;

  constructor(
	private translate: TranslateService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private userServicesService: UserServicesService,
    private alertService: AlertService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.serviceForm = this.formBuilder.group({
      service_fee: ['', [
        Validators.required
      ]]
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
      this.getUserServices();
    });
  }

  getUserServices() {
    this.serviceFormLoader = true;
    let params = {};
    if(this.userType != 'Doctor') {
      params['user_id'] = this.user_id;
    }
    this.userServicesService.get(params).subscribe(
      (response:any) => {
        if(response.status) {
          this.service_id = response.data[0].service_id;
          this.service_fee = response.data[0].service_fee;
          this.serviceForm.patchValue({
            service_fee: this.service_fee
          });
        }
        this.serviceFormLoader = false;
      },
      (error) => { this.serviceFormLoader = false; }
    );
  }

  onSubmitServiceForm() {
    if(this.serviceForm.valid) {
      let formData = {
        token: this.commonService.getUserData('token'),
        service_id: this.service_id,
        service_fee: this.serviceForm.value.service_fee
      }
      if(this.userType != 'Doctor') {
        formData['user_id'] = this.user_id;
      }
      this.serviceFormLoader = true;
      this.userServicesService.update(formData).subscribe(
        (response:any) => {
          if(response.status) {
            this.alertService.show_alert(response.message);
          }
          this.serviceFormLoader = false;
        },
        (error) => { this.serviceFormLoader = false; }
      );
    }
  }

}
