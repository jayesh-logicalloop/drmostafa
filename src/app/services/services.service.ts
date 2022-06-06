import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  service_get(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/user_services?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  services(postData: FormData) {
    let apiURL = this.apiBaseUrl + '/user_services';
    return this.httpClient.post(apiURL, postData);
  }

  services_update(params: object) {
    let apiURL = this.apiBaseUrl + '/user_services';
    return this.httpClient.put(apiURL, params);
  }

  services_delete(params: object) {
    let apiURL = this.apiBaseUrl + '/user_services?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.delete(apiURL);
  }
}
