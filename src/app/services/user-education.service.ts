import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class UserEducationService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  get(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/user_educations?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  create(postData: FormData) {
    let apiURL = this.apiBaseUrl + '/user_educations';
    return this.httpClient.post(apiURL, postData);
  }

  update(postData: object) {
    let apiURL = this.apiBaseUrl + '/user_educations';
    return this.httpClient.put(apiURL, postData);
  }

  delete(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/user_educations?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.delete(apiURL);
  }
}
