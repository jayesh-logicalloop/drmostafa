import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  total(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/users/total?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  get(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/users?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  create(postData: FormData) {
    let apiURL = this.apiBaseUrl + '/users';
    return this.httpClient.post(apiURL, postData);
  }

  detail(id: string = '') {
    let apiURL = this.apiBaseUrl + '/users/detail/' + id + '?token=' + this.commonService.getUserData('token');
    return this.httpClient.get(apiURL);
  }

  update(putData = {}, id='') {
    let apiURL = this.apiBaseUrl + '/users';
    if(id) {
      apiURL += '/'+id;
    }
    apiURL += '?token=' + this.commonService.getUserData('token');
    return this.httpClient.put(apiURL, putData);
  }

  update_profile_image(postData: FormData) {
    let apiURL = this.apiBaseUrl + '/users/update_profile_image';
    return this.httpClient.post(apiURL, postData);
  }

}
