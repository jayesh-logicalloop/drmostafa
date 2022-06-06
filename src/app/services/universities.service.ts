import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class UniversitiesService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  universities_post(postData: FormData) {
    let apiURL = this.apiBaseUrl + '/universities/';
    return this.httpClient.post(apiURL, postData);
  }

  universities_update(postData: object = {}) {
    let apiURL = this.apiBaseUrl + '/universities/';
    return this.httpClient.put(apiURL, postData);
  }

  all_universities_get(postData: object = {}) {
    let apiURL = this.apiBaseUrl + '/universities?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(postData);
    return this.httpClient.get(apiURL);
  }

  total_universities_count(postData: object = {}) {
    let apiURL = this.apiBaseUrl + '/universities/total?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(postData);
    return this.httpClient.get(apiURL);
  }

  university_select_get(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/universities/university_select?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  remove_row_delete(primary_key: string, primary_val: any, db_table_name: string) {
    let apiURL = this.apiBaseUrl + '/settings/remove_row?token=' + this.commonService.getUserData('token');
    apiURL += '&primary_key=' + primary_key;
    apiURL += '&primary_val=' + primary_val;
    apiURL += '&content_type=' + db_table_name;
    return this.httpClient.delete(apiURL);
  }
}
