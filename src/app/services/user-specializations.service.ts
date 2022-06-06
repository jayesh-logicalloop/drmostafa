import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from './common.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserSpecializationsService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  get(formData = {}) {
    let apiURL = this.apiBaseUrl + '/user_specializations?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(formData);
    return this.httpClient.get(apiURL, formData);
  }

  update(formData: object) {
    let apiURL = this.apiBaseUrl + '/user_specializations';
    return this.httpClient.put(apiURL, formData);
  }
}
