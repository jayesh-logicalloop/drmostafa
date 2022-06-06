import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  total_appointments(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/appointments/total?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  appointments(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/appointments?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  schedule_appointment(formData: any) {
    let apiURL = this.apiBaseUrl + '/appointments';
    return this.httpClient.post(apiURL, formData);
  }

  confirm_appointment(putData: object) {
    let apiURL = this.apiBaseUrl + '/appointments/confirm';
    return this.httpClient.put(apiURL, putData);
  }

  decline_appointment(putData: object) {
    let apiURL = this.apiBaseUrl + '/appointments/decline';
    return this.httpClient.put(apiURL, putData);
  }

  cancel_appointment(putData: object) {
    let apiURL = this.apiBaseUrl + '/appointments/cancel';
    return this.httpClient.put(apiURL, putData);
  }

  complete_appointment(putData: object) {
    let apiURL = this.apiBaseUrl + '/appointments/complete';
    return this.httpClient.put(apiURL, putData);
  }

  reschedule_appointment(putData: object) {
    let apiURL = this.apiBaseUrl + '/appointments/reschedule';
    return this.httpClient.put(apiURL, putData);
  }

  appointment_slot(formData:object={}) {
    let apiURL = this.apiBaseUrl + '/work_schedule/time_slots?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(formData);
    return this.httpClient.get(apiURL, formData);
  }

  calendar_data(params: object={}) {
    let apiURL = this.apiBaseUrl + '/appointments/calendar?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  remove_attachment(id='', appointment_id='') {
    let apiURL = this.apiBaseUrl + '/appointments/remove_attachment/'+ id +'/'+ appointment_id +'?token=' + this.commonService.getUserData("token");
    return this.httpClient.delete(apiURL);
  }

  requestReschedule(putData: object) {
    let apiURL = this.apiBaseUrl + '/appointments/request_reschedule';
    return this.httpClient.put(apiURL, putData);
  }
}
