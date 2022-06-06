import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class CareersService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  careersTotal(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/careers/total?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  careersGet(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/careers?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }
  careersDelete(id:any) {
    let apiURL = this.apiBaseUrl + '/careers/' + id + '?token=' + this.commonService.getUserData('token');
    return this.httpClient.delete(apiURL);
  }
}
