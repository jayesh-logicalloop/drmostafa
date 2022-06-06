import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class ArticleCategoryService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  total(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/article_category/total?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  get(id='', params: object = {}) {
    let apiURL = this.apiBaseUrl + '/article_category/'+ id +'?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL)
  }

  post(id='', postData: FormData) {
    let apiURL = this.apiBaseUrl + '/article_category/'+ id;
    return this.httpClient.post(apiURL, postData);
  }

  delete(id:string) {
    let apiURL = this.apiBaseUrl + '/article_category/'+ id +'?token=' + this.commonService.getUserData('token');
    return this.httpClient.delete(apiURL)
  }

}
