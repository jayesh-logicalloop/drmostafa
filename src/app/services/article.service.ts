import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  total(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/article/total?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  get(id='', params: object = {}) {
    let apiURL = this.apiBaseUrl + '/article/'+ id +'?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL)
  }

  post(id='', postData: FormData) {
    let apiURL = this.apiBaseUrl + '/article/'+ id;
    return this.httpClient.post(apiURL, postData);
  }

  delete(id='') {
    let apiURL = this.apiBaseUrl + '/article/'+ id +'?token=' + this.commonService.getUserData('token');
    return this.httpClient.delete(apiURL);
  }

  approve(id='', params: object = {}) {
    let apiURL = this.apiBaseUrl + '/article/approve/'+ id +'?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  tags() {
    let apiURL = this.apiBaseUrl + '/article/tags';
    return this.httpClient.get(apiURL);
  }

  update_media(id:string, params: FormData) {
    let apiURL = this.apiBaseUrl + '/article/media/'+id;
    return this.httpClient.post(apiURL, params);
  }

  delete_media(id:string, params: object) {
    let apiURL = this.apiBaseUrl + '/article/media/' + id + '?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.delete(apiURL);
  }
}
