import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class DiseaseService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  total(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/diseases/total?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  get(id='', params: object = {}) {
    let apiURL = this.apiBaseUrl + '/diseases/'+ id +'?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  select2(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/diseases/select2?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  post(postData: FormData) {
    let apiURL = this.apiBaseUrl + '/diseases';
    return this.httpClient.post(apiURL, postData);
  }

  put(id='', putData: object) {
    let apiURL = this.apiBaseUrl + '/diseases/'+id;
    return this.httpClient.put(apiURL, putData);
  }

  delete(id='') {
    let apiURL = this.apiBaseUrl + '/diseases/'+id+'?token=' + this.commonService.getUserData('token');
    return this.httpClient.delete(apiURL);
  }

}
