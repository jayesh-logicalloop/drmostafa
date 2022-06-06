import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from './common.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserSettingsService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  get(postData = {}) {
    let apiURL = this.apiBaseUrl + '/user_settings?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(postData);
    return this.httpClient.get(apiURL, postData);
  }

  post(postData: object) {
    let apiURL = this.apiBaseUrl + '/user_settings';
    return this.httpClient.post(apiURL, postData);
  }

  update(postData: object) {
    let apiURL = this.apiBaseUrl + '/user_settings';
    return this.httpClient.put(apiURL, postData);
  }
}
