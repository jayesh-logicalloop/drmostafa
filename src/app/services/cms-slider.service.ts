import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class CmsSliderService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  getCmsTotalSlider(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/cms_slider/total?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  getCmsSlider(id='', params: object = {}) {
    let apiURL = this.apiBaseUrl + '/cms_slider/'+ id +'?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  cmsSliderCRUD(id='', postData: FormData) {
    let apiURL = this.apiBaseUrl + '/cms_slider/'+ id;
    return this.httpClient.post(apiURL, postData);
  }
}
