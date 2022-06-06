import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class ContactUsService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  total(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/contact_us/total?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  getData(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/contact_us?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }
  deleteData(id: any) {
    let apiURL = this.apiBaseUrl + '/contact_us/' + id + '?token=' + this.commonService.getUserData('token');
    return this.httpClient.delete(apiURL);
  }
}

