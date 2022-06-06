import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { AccountService } from '../services/account.service';
import { CommonService } from '../services/common.service';
import { AlertService } from '../services/alert.service';
import { PasswordValidation } from './../services/password-validation';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ChangePasswordComponent implements OnInit {

  @ViewChild('ngchangepasswordform', {static: false}) ngchangepasswordform: NgForm;
  changePasswordForm: FormGroup;
  changePasswordFormLoader = false;

  constructor(
	private translate: TranslateService,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private accountService: AccountService,
    private alertService: AlertService,
    private title: Title,
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Change Password');
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.changePasswordForm = this.formBuilder.group({
      old_password: ['', [
        Validators.required
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(20)
      ]],
      confirm_password: ['', [
        Validators.required
      ]]
    },{
      validator: PasswordValidation.MatchPassword
      }
    )
  }

  onSubmitChangePasswordForm() {
    if (this.changePasswordForm.valid) {
      let formData = {
        token: this.commonService.getUserData('token'),
        old_password: this.changePasswordForm.value.old_password,
        password: this.changePasswordForm.value.password,
        confirm_password: this.changePasswordForm.value.confirm_password
      }
      this.changePasswordFormLoader = true;
      this.accountService.change_password(formData).subscribe(
        (response: any) => {
          if (response.status) {
            this.alertService.show_alert(response.message)
            this.ngchangepasswordform.resetForm();
          }
          this.changePasswordFormLoader = false;
        },
        (error) => { this.changePasswordFormLoader = false; }
      );
    }
  }
}
