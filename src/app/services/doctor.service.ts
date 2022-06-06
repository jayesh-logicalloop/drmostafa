import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  total(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/doctors/total?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  doctors(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/doctors?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  detail(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/doctors/detail?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  create(postData: FormData) {
    let apiURL = this.apiBaseUrl + '/doctors';
    return this.httpClient.post(apiURL, postData);
  }

  update(userData: object) {
    let apiURL = this.apiBaseUrl + '/doctors';
    return this.httpClient.put(apiURL, userData);
  }

  delete(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/doctors?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.delete(apiURL);
  }

  update_profile_image(formData: any) {
    let apiURL = this.apiBaseUrl + '/account/update_profile_image';
    return this.httpClient.post(apiURL, formData);
  }

}
