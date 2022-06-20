import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from "rxjs/operators";

import { environment } from './../../environments/environment';

import { ApiService } from './api.service';
import { AlertService } from './alert.service';

@Injectable()
export class ServiceInterceptor implements HttpInterceptor {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService
  ) { }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    request = request.clone({
      setHeaders: {
        'Request-Origin': 'Admin',
        'Access-Control-Allow-Origin': '*',
        'X-API-KEY': environment.api_key,
        // 'Content-type': 'application/json'
      }
    });
    return next.handle(request)
      .pipe(
        tap(
          (event: HttpEvent<any>) => {
            if (event instanceof HttpResponse) {
              //console.log(event);
            }
          },
          (err: any) => {
            if (err instanceof HttpErrorResponse) {
              if (err.status === 401) {
                // this.apiService.logout();
              }
              if (err.status === 400 || err.status === 403 || err.status === 417) {
                if (err.error.error) {
                  this.alertService.showValidationErrors(err.error.error);
                } else {
                  this.alertService.showValidationErrors(err.error.message);
                }
              }
              if (err.status === 500) {
                this.alertService.showValidationErrors('There is some error, Please try again');
              }
            }
          }
        )
      );
  }
}
