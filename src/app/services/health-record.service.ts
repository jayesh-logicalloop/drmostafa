import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class HealthRecordService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  get(params:object={}) {
    let apiURL = this.apiBaseUrl + '/health_record?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  post(postData: FormData) {
    let apiURL = this.apiBaseUrl + '/health_record';
    return this.httpClient.post(apiURL, postData);
  }

  delete(params:any) {
    let apiURL = this.apiBaseUrl + '/health_record?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.delete(apiURL);
  }

  unshare(id:string, user_id:string) {
    let apiURL = this.apiBaseUrl + '/health_record/unshare/'+ id +'/'+ user_id +'?token=' + this.commonService.getUserData('token');
    return this.httpClient.get(apiURL);
  }

}
