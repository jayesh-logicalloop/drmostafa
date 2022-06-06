import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from '../services/common.service';

@Injectable({
  providedIn: 'root'
})
export class PatientsService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  patients_total(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/patients/total?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  patients(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/patients?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  patient_detail(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/users/patient_detail?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

}
