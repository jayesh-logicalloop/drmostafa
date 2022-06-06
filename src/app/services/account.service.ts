import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  account_status(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/account/account_status?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  update_profile_image(formData: any) {
    let apiURL = this.apiBaseUrl + '/account/update_profile_image';
    return this.httpClient.post(apiURL, formData);
  }

  forget_password_post(postData: FormData) {
    let apiURL = this.apiBaseUrl + '/account/forget_password';
    return this.httpClient.post(apiURL, postData);
  }

  reset_password_post(postData: FormData) {
    let apiURL = this.apiBaseUrl + '/account/reset_password';
    return this.httpClient.post(apiURL, postData);
  }

  validate_code_post(postData: FormData) {
    let apiURL = this.apiBaseUrl + '/account/validate_code';
    return this.httpClient.post(apiURL, postData);
  }

  change_password(putData: object) {
    let apiURL = this.apiBaseUrl + '/account/change_password';
    return this.httpClient.put(apiURL, putData);
  }

  validate_reset_passcode_post(otp: string) {
    let apiURL = this.apiBaseUrl + '/account/verify_reset_password_otp/'+otp;
    return this.httpClient.get(apiURL);
  }

  admin_profile_data() {
    let apiURL = this.apiBaseUrl + '/admin/profile_data?token=' + this.commonService.getUserData('token');
    return this.httpClient.get(apiURL);
  }

  admin_profile_update(putData: object) {
    let apiURL = this.apiBaseUrl + '/admin/profile_data';
    return this.httpClient.put(apiURL, putData);
  }
}
