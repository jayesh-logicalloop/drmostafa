import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  appointmentStatistics() {
    let apiURL = this.apiBaseUrl + '/dashboard/appointments?token=' + this.commonService.getUserData('token');
    return this.httpClient.get(apiURL);
  }

  userStatistics(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/dashboard/registered_users?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }
}
