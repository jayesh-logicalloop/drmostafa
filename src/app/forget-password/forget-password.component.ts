import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountService } from './../services/account.service';
import { CommonService } from './../services/common.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css']
})
export class ForgetPasswordComponent implements OnInit {
  forgetPasswordForm:FormGroup;
  forgetPasswordFormSuccess=false;
  showForgetPasswordFormLoader=false;
  emailRegex = this.commonService.emailRegex;
  messasge:string='';
  constructor(
	private translate: TranslateService,
    private title: Title,
    private formBuilder: FormBuilder,
    private router: Router,
    private commonService: CommonService,
    private accountService: AccountService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Forgot Password');
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
	  //console.log('is-logged-in', this.commonService.isLoggedIn());
    if (this.commonService.isLoggedIn()) {
      this.commonService.userDefaultRoute();
    }
    this.forgetPasswordForm = this.formBuilder.group({
      email: ['', [
          Validators.required,
          Validators.email,
          Validators.pattern(this.emailRegex)
        ]
      ]
    });
  }

  onSubmit() {
    if (this.forgetPasswordForm.valid) {
      this.forgetPasswordFormSuccess = false;
	  this.messasge = '';
      this.showForgetPasswordFormLoader = true;
      let postData = new FormData();
      postData.append('email', this.forgetPasswordForm.value.email);
      this.accountService.forget_password_post(postData).subscribe(
        (response :any) => {
          if(response.status === true) {
            this.forgetPasswordFormSuccess = true;
            // this.messasge = response.message;
            // this.messasge = this.messasge ;
            // this.code = response.data;
			      this.router.navigate(['/reset-password/'+response.data]);
          }
          this.showForgetPasswordFormLoader = false;
        },
        (error) => { this.showForgetPasswordFormLoader = false; }
      );
    }
  }

}
