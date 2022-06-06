import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class CmsService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  //Manage CMS

  getCmsContent(id='', params: object = {}) {
    let apiURL = this.apiBaseUrl + '/cms/' + id + '?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  updateContent(id='', postData: FormData) {
    let apiURL = this.apiBaseUrl + '/cms/' + id;
    return this.httpClient.post(apiURL, postData);
  }

  updateContentImage(id='', postData: FormData) {
    let apiURL = this.apiBaseUrl + '/cms/image/' + id;
    return this.httpClient.post(apiURL, postData);
  }
}
