import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class UserDocumentsService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  get(params = {}) {
    let apiURL = this.apiBaseUrl + '/user_documents?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  create_update(postData: FormData) {
    let apiURL = this.apiBaseUrl + '/user_documents';
    return this.httpClient.post(apiURL, postData);
  }

  update_verification(params = {}) {
    let apiURL = this.apiBaseUrl + '/user_documents/verification';
    return this.httpClient.put(apiURL, params);
  }

  delete(params = {}) {
    let apiURL = this.apiBaseUrl + '/user_documents?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.delete(apiURL, params);
  }

}
