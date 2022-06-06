import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  total(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/coupon/total?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  get(id='', params: object = {}) {
    let apiURL = this.apiBaseUrl + '/coupon/' + id + '?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  create(postData: FormData) {
    let apiURL = this.apiBaseUrl + '/coupon';
    return this.httpClient.post(apiURL, postData);
  }

  update(id:string, putData: object) {
    let apiURL = this.apiBaseUrl + '/coupon/' + id;
    return this.httpClient.put(apiURL, putData);
  }

  delete(id:string) {
    let apiURL = this.apiBaseUrl + '/coupon/' + id + '?token=' + this.commonService.getUserData('token');
    return this.httpClient.delete(apiURL);
  }

  update_media(id:string, params: FormData) {
    let apiURL = this.apiBaseUrl + '/coupon/media/'+id;
    return this.httpClient.post(apiURL, params);
  }

  delete_media(id:string, params: object) {
    let apiURL = this.apiBaseUrl + '/coupon/media/' + id + '?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.delete(apiURL);
  }
}
