import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class AppointmentPrescriptionService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  appointment_prescription_get(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/appointment_prescription/?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  create(postData: FormData) {
    let apiURL = this.apiBaseUrl + '/appointment_prescription';
    return this.httpClient.post(apiURL, postData);
  }

  update(id:string, postData={}) {
    let apiURL = this.apiBaseUrl + '/appointment_prescription./'+ id;
    return this.httpClient.put(apiURL, postData);
  }

  delete(id:string) {
    let apiURL = this.apiBaseUrl + '/appointment_prescription/' + id + '?token=' + this.commonService.getUserData('token');
    return this.httpClient.delete(apiURL);
  }

  download(params:object={}){
    let apiURL = this.apiBaseUrl + '/appointment_prescription/download/?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }
}
