import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  feedbacks_total(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/feedbacks/total?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  feedbacks(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/feedbacks?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  feedbacks_post(postData:FormData) {
    let apiURL = this.apiBaseUrl + '/feedbacks';
    return this.httpClient.post(apiURL, postData);
  }

  approve_feedback(id:string, params: object = {}) {
    let apiURL = this.apiBaseUrl + '/feedbacks/approve/'+ id +'?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }
}
