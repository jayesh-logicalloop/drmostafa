import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  all_amenties_get(postData: object = {}) {
    let apiURL = this.apiBaseUrl + '/settings/amenities?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(postData);
    return this.httpClient.get(apiURL);
  }

  total_amenties_count(postData: object = {}) {
    let apiURL = this.apiBaseUrl + '/settings/total_amenities?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(postData);
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
