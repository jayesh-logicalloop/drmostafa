import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class UserCardsService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  card(postData: FormData) {
    let apiURL = this.apiBaseUrl + '/user_card';
    return this.httpClient.post(apiURL, postData);
  }

  card_get(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/user_card?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  card_default(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/user_card/card_default?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }
}
