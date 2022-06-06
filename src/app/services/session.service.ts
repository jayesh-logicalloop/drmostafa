import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  total(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/session/total?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  get(id='', params: object = {}) {
    let apiURL = this.apiBaseUrl + '/session/' + id + '?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  create(params: FormData) {
    let apiURL = this.apiBaseUrl + '/session';
    return this.httpClient.post(apiURL, params);
  }

  update(id:string, params: FormData) {
    let apiURL = this.apiBaseUrl + '/session/'+id;
    return this.httpClient.post(apiURL, params);
  }

  patch(id:string, params: object) {
    let apiURL = this.apiBaseUrl + '/session/'+id;
    return this.httpClient.patch(apiURL, params);
  }

  update_media(id:string, params: FormData) {
    let apiURL = this.apiBaseUrl + '/session/media/'+id;
    return this.httpClient.post(apiURL, params);
  }

  delete_media(id:string, params: object) {
    let apiURL = this.apiBaseUrl + '/session/media/' + id + '?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.delete(apiURL);
  }
}
