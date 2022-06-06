import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class SymptomsService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  total(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/symptoms/total?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  get(id='', params: object = {}) {
    let apiURL = this.apiBaseUrl + '/symptoms/'+ id +'?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  post(postData: object) {
    let apiURL = this.apiBaseUrl + '/symptoms';
    return this.httpClient.post(apiURL, postData);
  }

  put(id='', putData: object) {
    let apiURL = this.apiBaseUrl + '/symptoms/'+id;
    return this.httpClient.put(apiURL, putData);
  }

  delete(id='') {
    let apiURL = this.apiBaseUrl + '/symptoms/'+id+'?token=' + this.commonService.getUserData('token');
    return this.httpClient.delete(apiURL);
  }
}
