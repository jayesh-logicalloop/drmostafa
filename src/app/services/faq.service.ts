import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class FaqService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  faq_get(id='', params: object = {}) {
    let apiURL = this.apiBaseUrl + '/faq/'+ id +'?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  faq_post(postData: FormData) {
    let apiURL = this.apiBaseUrl + '/faq';
    return this.httpClient.post(apiURL, postData);
  }

  faq_update(id='', postData: object = {}) {
    let apiURL = this.apiBaseUrl + '/faq/' + id;
    return this.httpClient.put(apiURL, postData);
  }

  faq_delete(id='') {
    let apiURL = this.apiBaseUrl + '/faq/'+ id +'?token=' + this.commonService.getUserData('token');
    return this.httpClient.delete(apiURL);
  }
}
