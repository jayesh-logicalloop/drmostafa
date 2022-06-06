import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class WalkthroughService {

  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  total(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/walkthrough/total?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  get(id='', params: object = {}) {
    let apiURL = this.apiBaseUrl + '/walkthrough/';
    if(id) apiURL += `/${id}`;
    apiURL += '?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  create_update(id='', params: FormData) {
    let apiURL = this.apiBaseUrl + '/walkthrough';
    if(id) apiURL += `/${id}`;
    return this.httpClient.post(apiURL, params);
  }

  update(id:string, params: FormData) {
    let apiURL = this.apiBaseUrl + '/walkthrough/'+id;
    return this.httpClient.post(apiURL, params);
  }

  delete(id:string) {
    let apiURL = this.apiBaseUrl + '/walkthrough/' + id + '?token=' + this.commonService.getUserData('token');
    return this.httpClient.delete(apiURL);
  }

  update_media(id:string, params: FormData) {
    let apiURL = this.apiBaseUrl + '/walkthrough/media/'+id;
    return this.httpClient.post(apiURL, params);
  }

  delete_media(id:string, params: object) {
    let apiURL = this.apiBaseUrl + '/walkthrough/media/' + id + '?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.delete(apiURL);
  }
}
