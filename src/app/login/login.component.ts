import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFireMessaging } from "@angular/fire/messaging";
import { DeviceDetectorService } from "ngx-device-detector";
import { TranslateService } from '@ngx-translate/core';

import { ApiService } from "./../services/api.service";
import { CommonService } from "./../services/common.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class LoginComponent implements OnInit {
  isloggedIn = false;

  passwordType = "password";
  passwordIcon = "mdi-eye";

  loginForm: FormGroup;
  loginFormLoader = false;
  emailRegex = this.commonService.emailRegex;
  errorMsg = "";

  firebase_token = '';
  deviceInfo = {
    browser: "",
    browser_version: "",
    device: "",
    os: "",
    os_version: "",
    userAgent: ""
  };

  returnUrl = '';

  constructor(
	private translate: TranslateService,
    private title: Title,
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private angularFireMessaging: AngularFireMessaging,
    private deviceDetectorService: DeviceDetectorService,
    private apiService: ApiService,
    private commonService: CommonService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle("Login");
    if (this.commonService.isLoggedIn()) {
      this.commonService.userDefaultRoute();
    }
    this.deviceInfo = this.deviceDetectorService.getDeviceInfo();
    //console.log('this.deviceInfo', this.deviceInfo);
    this.angularFireMessaging.requestToken.subscribe(
      (token) => {
        this.firebase_token = token;
        //console.log('this.firebase_token', this.firebase_token);
        //cTCLmpy5BPE_sgGNIWWuOq:APA91bHkoJmBLBrHHD7m9B6Oamf6HcjWLPwnTEn8XHiQeyicsSV3OLLxmmbEqcASNkKBQOHqCgWopq2eOhi8K9QNP1muEGa_jzOGLctkhWNEy9tJ0M_tLjH0_kstCZOXBiRw2DOoPRHz
      }
    );
    /*
      //console.log(this.deviceInfo);
      {
          "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36",
          "os": "Windows",
          "browser": "Chrome",
          "device": "Unknown",
          "os_version": "windows-10",
          "browser_version": "89.0.4389.90"
      }
    */
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.returnUrl = params.get('returnUrl');
    });

    this.loginForm = this.fb.group({
      email: ["", [
        Validators.required,
        Validators.email,
        Validators.pattern(this.emailRegex),
      ]],
      password: ["", Validators.required],
      remember_me: [""]
    });
  }

  onSubmitLoginForm() {
    if (this.loginForm.valid) {
      this.errorMsg = "";
      this.loginFormLoader = true;
/*
      //console.log(this.deviceInfo);
      {
          "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36",
          "os": "Windows",
          "browser": "Chrome",
          "device": "Unknown",
          "os_version": "windows-10",
          "browser_version": "89.0.4389.90"
      }
    */
      let postData = new FormData();
      postData.append('email', this.loginForm.value.email);
      postData.append('password', this.loginForm.value.password);
      postData.append('remember_me', this.loginForm.value.remember_me);
      postData.append('user_type', 'Panel');
      postData.append("deviceInfo[systemName]", 'Website');
      postData.append("deviceInfo[token]", this.firebase_token);
      postData.append("deviceInfo[deviceUniqueID]", this.deviceInfo.browser);
      postData.append("deviceInfo[deviceId]", this.deviceInfo.browser);
      postData.append("deviceInfo[deviceDesignName]", this.deviceInfo.browser);
      postData.append("deviceInfo[brandName]", this.deviceInfo.browser);
      postData.append("deviceInfo[deviceName]", this.deviceInfo.browser);
      postData.append("deviceInfo[manufacturer]", this.deviceInfo.os);
      postData.append("deviceInfo[systemVersion]", this.deviceInfo.browser_version);
      postData.append("deviceInfo[systemApiLevel]", this.deviceInfo.browser_version);
      postData.append("deviceInfo[appVersion]", this.deviceInfo.browser_version);
      postData.append("deviceInfo[deviceModel]", this.deviceInfo.browser);
      postData.append("deviceInfo[uiMode]", this.deviceInfo.os_version);
      postData.append("deviceInfo[Fingerprint]", this.deviceInfo.userAgent);
      postData.append("deviceInfo[Serial]", this.deviceInfo.browser_version);
      this.apiService.login(postData, this.loginForm.value.remember_me).subscribe(
        (response: any) => {
          this.loginFormLoader = false;
          if (response.status === false) {
            this.errorMsg = response.message;
          } else if(this.returnUrl) {
            this.router.navigateByUrl(this.returnUrl);
          }
        },
        (error) => { this.loginFormLoader = false; }
      );
    }
  }

  showHidePassword(passwordType: string) {
    if (passwordType == "password") {
      this.passwordType = "text";
    } else {
      this.passwordType = "password";
    }
  }
}
