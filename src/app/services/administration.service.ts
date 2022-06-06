import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class AdministrationService {
 apiBaseUrl = '';

   constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  create(id='', params: FormData) {
    let apiURL = this.apiBaseUrl + '/administration';
    if(id) apiURL += `/${id}`;
    return this.httpClient.post(apiURL, params);
  }

  total(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/administration/total?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  get(id='', params: object = {}) {
    let apiURL = this.apiBaseUrl + '/administration/' + id + '?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  userGroups(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/administration/userGroups?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }
  
  groupPermissions(gid= 0, params: object = {}) {
    let apiURL = this.apiBaseUrl + '/administration/groupPermissions?group_id=' + gid + '&token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  getParentMenus(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/administration/parentMenus?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  manageMenu(params: FormData) {
    let apiURL = this.apiBaseUrl + '/administration/manageMenu';
    return this.httpClient.post(apiURL, params);
  }

  getAllMenusCount(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/administration/allMenuCount?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  getAllMenus(id='', params: object = {}) {
    let apiURL = this.apiBaseUrl + '/administration/getAllMenus' + id + '?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  saveMenuPermission( params: FormData) {
    let apiURL = this.apiBaseUrl + '/administration/saveMenuPermission';
    return this.httpClient.post(apiURL,params);
  }

}
