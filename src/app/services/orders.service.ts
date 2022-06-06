import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  orders_get(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/orders?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  getOrderStatusList(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/orders/order_status?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  updateOrder(discountData: object) {
    let apiURL = this.apiBaseUrl + '/orders/order';
    return this.httpClient.put(apiURL, discountData);
  }

  orders_total(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/orders/total?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  download_invoice(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/orders/download_invoice?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }
}
