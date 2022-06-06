import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { CommonService } from '../../services/common.service';
import { WebsettingsService } from '../../services/websettings.service';
import { ModalService } from '../../services/modal.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-web-setting',
  templateUrl: './web-setting.component.html',
  styleUrls: ['./web-setting.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class WebSettingComponent implements OnInit {
  @ViewChild('ngaddform', { static: false} ) ngaddform: NgForm;
  @ViewChild('ngupdateform', { static: false} ) ngupdateform: NgForm;
  webSettingForm: FormGroup;
  webSettingFormAction = false;

  index: number;
  setting_id = '';
  dataLoader = false;
  settings = [];

  constructor(
    private translate: TranslateService,
    private title: Title,
    private websettingsService: WebsettingsService,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private modalService: ModalService,
    private alertService: AlertService,
  ) {
    const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);

    this.title.setTitle('Web Settings');
    const userType = this.commonService.getUserData('group_name');
    /* const allowedUserTypes = ['Super Admin', 'Doctor'];
    if (!allowedUserTypes.includes(userType)) {
      this.commonService.userDefaultRoute();
    } */

    this.webSettingForm = this.formBuilder.group({
      name: ['', [
        Validators.required,
        Validators.maxLength(50),
      ]],
      value: ['', [
        Validators.required,
        Validators.maxLength(250),
      ]],
      description: ['', [
        Validators.maxLength(250)
      ]],
    });
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.getWebSettings();
  }

  getWebSettings() {
    this.dataLoader = true;
    this.websettingsService.get().subscribe(
      (response: any) => {
        if (response.status) {
          this.settings = response.data;
        }
        this.dataLoader = false;
      }
    )
  }

  openAddForm() {
    this.ngaddform.resetForm();
    this.modalService.open_modal('#addFormModal');
  }

  onSubmitAddForm() {
    if (this.webSettingForm.valid) {
      let postData = new FormData();
      postData.append('token', this.commonService.getUserData('token'));
      postData.append('name', this.webSettingForm.value.name);
      postData.append('description', this.webSettingForm.value.description);
      postData.append('value', this.webSettingForm.value.value);
      this.webSettingFormAction = true;
      this.websettingsService.create(postData).subscribe((response: any) => {
        if (response.status) {
          this.alertService.show_alert(response.message);
          this.getWebSettings();
        }
        this.webSettingFormAction = false;
        this.modalService.close_modal('#addFormModal');
        },
        (error) => { this.webSettingFormAction = false; },
      );
    }
  }

  openUpdateForm(id:string, i:number) {
    this.index = i;
    this.setting_id = id;
    this.webSettingForm.patchValue({
      name: this.settings[i].name,
      value: this.settings[i].value,
      description: this.settings[i].description
    });
    this.modalService.open_modal('#updateFormModal');
  }

  onSubmitupdateForm() {
    if (this.webSettingForm.valid) {
      let putData = {
        token: this.commonService.getUserData('token'),
        value: this.webSettingForm.value.value,
        description: this.webSettingForm.value.description
      };
      this.webSettingFormAction = true;
      this.websettingsService.update(this.setting_id, putData).subscribe(
        (response: any) => {
          if (response.status) {
            this.settings[this.index]['value'] = this.webSettingForm.value.value;
            this.settings[this.index]['description'] = this.webSettingForm.value.description;
            this.alertService.show_alert(response.message);
          }
          this.modalService.close_modal('#updateFormModal');
          this.webSettingFormAction = false;
        },
        (error) => { this.webSettingFormAction = false; }
      );
    }
  }
}






