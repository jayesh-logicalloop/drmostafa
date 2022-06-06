import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  total(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/announcement/total?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  get(id='', params: object = {}) {
    let apiURL = this.apiBaseUrl + '/announcement';
    if(id) apiURL += `/${id}`;
    apiURL += '?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  create_update(id='', formData: any) {
    let apiURL = this.apiBaseUrl + '/announcement';
    if(id) apiURL += `/${id}`;
    return this.httpClient.post(apiURL, formData);
  }

  delete(id:string) {
    let apiURL = this.apiBaseUrl + '/announcement/' + id + '?token=' + this.commonService.getUserData('token');
    return this.httpClient.delete(apiURL);
  }

}
