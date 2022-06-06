import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  total(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/course/my_total_courses?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  get(course_id='', params: object = {}) {
    let apiURL = this.apiBaseUrl + '/course/my_courses/' + course_id + '?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  create(params: FormData) {
    let apiURL = this.apiBaseUrl + '/course';
    return this.httpClient.post(apiURL, params);
  }

  update(course_id:string, params: object) {
    let apiURL = this.apiBaseUrl + '/course/'+course_id;
    return this.httpClient.put(apiURL, params);
  }

  patch(course_id:string, params: object) {
    let apiURL = this.apiBaseUrl + '/course/'+course_id;
    return this.httpClient.patch(apiURL, params);
  }

  create_item(course_id:string, params: FormData) {
    let apiURL = this.apiBaseUrl + '/course/item/'+course_id;
    return this.httpClient.post(apiURL, params);
  }

  update_item(course_id:string, item_id:string, params: object) {
    let apiURL = this.apiBaseUrl + '/course/item/'+course_id+'/'+item_id;
    return this.httpClient.put(apiURL, params);
  }

  update_media(course_id:string, item_id='', params: FormData) {
    let apiURL = this.apiBaseUrl + '/course/media/'+course_id;
    apiURL += item_id ? '/'+item_id : '';
    return this.httpClient.post(apiURL, params);
  }

  delete_item(course_id:string, item_id='') {
    let apiURL = this.apiBaseUrl + '/course/item/'+course_id+'/'+item_id+'?token=' + this.commonService.getUserData('token');
    return this.httpClient.delete(apiURL);
  }
}
