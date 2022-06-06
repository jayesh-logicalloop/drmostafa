import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  all(postData: object = {}) {
    let apiURL = this.apiBaseUrl + '/countries?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(postData);
    return this.httpClient.get(apiURL);
  }

  total(postData: object = {}) {
    let apiURL = this.apiBaseUrl + '/countries/total?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(postData);
    return this.httpClient.get(apiURL);
  }

  get(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/countries?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  create(postData: FormData) {
    let apiURL = this.apiBaseUrl + '/countries/';
    return this.httpClient.post(apiURL, postData);
  }

  update(postData: object = {}) {
    let apiURL = this.apiBaseUrl + '/countries/';
    return this.httpClient.put(apiURL, postData);
  }
}
