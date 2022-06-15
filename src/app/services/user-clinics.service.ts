import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class UserClinicsService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    public commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  get(postData: any) {
    let apiURL = this.apiBaseUrl + '/user_clinics?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(postData);
    return this.httpClient.get(apiURL);
  }

  select2(postData = {}) {
    let apiURL = this.apiBaseUrl + '/user_clinics/select2?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(postData);
    return this.httpClient.get(apiURL);
  }

  subscribe(postData: object) {
    let apiURL = this.apiBaseUrl + '/user_clinics/subscribe';
    return this.httpClient.put(apiURL, postData);
  }

  update(postData: FormData) {
    let apiURL = this.apiBaseUrl + '/user_clinics/update';
    return this.httpClient.post(apiURL, postData);
  }

  delete(postData = {}) {
    let apiURL = this.apiBaseUrl + '/user_clinics?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(postData);
    return this.httpClient.delete(apiURL);
  }

  online(postData: object) {
    let apiURL = this.apiBaseUrl + '/user_clinics/online';
    return this.httpClient.put(apiURL, postData);
  }

  set_default_clinic(postData: object) {
    let apiURL = this.apiBaseUrl + '/user_clinics/set_default';
    return this.httpClient.put(apiURL, postData);
  }

  create(postData: FormData) {
    let apiURL = this.apiBaseUrl + '/user_clinics/info';
    return this.httpClient.post(apiURL, postData);
  }

  update_info(postData: object) {
    let apiURL = this.apiBaseUrl + '/user_clinics/info';
    return this.httpClient.put(apiURL, postData);
  }

  update_location(postData: object) {
    let apiURL = this.apiBaseUrl + '/user_clinics/location';
    return this.httpClient.put(apiURL, postData);
  }

  update_logo_image(postData: FormData) {
    let apiURL = this.apiBaseUrl + '/user_clinics/logo';
    return this.httpClient.post(apiURL, postData);
  }

  get_attachment(postData = {}) {
    let apiURL = this.apiBaseUrl + '/user_clinics/attachment?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(postData);
    return this.httpClient.get(apiURL);
  }

  upload_attachment(postData: FormData) {
    let apiURL = this.apiBaseUrl + '/user_clinics/attachment';
    return this.httpClient.post(apiURL, postData);
  }

  delete_attachment(postData = {}) {
    let apiURL = this.apiBaseUrl + '/user_clinics/attachment?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(postData);
    return this.httpClient.delete(apiURL, postData);
  }

  add_slot_management(postData = {}) {
    let apiURL = this.apiBaseUrl + '/user_clinics/Slotmanage';
    return this.httpClient.post(apiURL, postData);
  }

}
