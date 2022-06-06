import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class BankService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  get(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/user_banks?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  create(postData: FormData) {
    let apiURL = this.apiBaseUrl + '/user_banks';
    return this.httpClient.post(apiURL, postData);
  }

  update(postData: object) {
    let apiURL = this.apiBaseUrl + '/user_banks';
    return this.httpClient.put(apiURL, postData);
  }

  delete(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/user_banks?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.delete(apiURL);
  }

  set_default(postData: object = {}) {
    let apiURL = this.apiBaseUrl + '/user_banks/set_default?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(postData);
    return this.httpClient.get(apiURL);
  }
}
