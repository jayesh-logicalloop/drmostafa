import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class CmsSpecialityService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  getCmsTotalSpeciality(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/cms_speciality/total?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  getCmsSpeciality(id='', params: object = {}) {
    let apiURL = this.apiBaseUrl + '/cms_speciality/'+ id +'?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  cmsSpecialityCRUD(id='', postData: FormData) {
    let apiURL = this.apiBaseUrl + '/cms_speciality/' + id;
    return this.httpClient.post(apiURL, postData);
  }
}
