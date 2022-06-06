import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';


@Injectable({
  providedIn: 'root'
})
export class EstablishmentService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  users_total(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/establishment/total?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  users_get(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/establishment?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  user_update(putData: object = {}, id: string) {
    let apiURL = this.apiBaseUrl + '/establishment/' + id + '?token=' + this.commonService.getUserData('token');
    return this.httpClient.put(apiURL, putData);
  }

  user_detail_get(id: string = '') {
    let apiURL = this.apiBaseUrl + '/establishment/' + id + '?token=' + this.commonService.getUserData('token');
    return this.httpClient.get(apiURL);
  }

  update_profile_image(postData: FormData) {
    let apiURL = this.apiBaseUrl + '/establishment/update_profile_image';
    return this.httpClient.post(apiURL, postData);
  }

  postData(postData: FormData) {
    let apiURL = this.apiBaseUrl + '/establishment';
    return this.httpClient.post(apiURL, postData);
  }

  /*   reportDelete(params){
      let apiURL = this.apiBaseUrl + '/user_reports/?token=' + this.commonService.getUserData('token');
      apiURL += this.commonService.queryParams(params);
      return this.httpClient.delete(apiURL);
    } */



}
