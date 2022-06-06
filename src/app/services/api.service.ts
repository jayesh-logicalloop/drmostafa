import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import * as firebase from 'firebase';

import { environment } from '../../environments/environment';
import { CommonService } from './common.service';
import { UserClinicsService } from './user-clinics.service';

@Injectable()
export class ApiService {
  apiBaseUrl = '';
  userData = new BehaviorSubject({});
  currentUserData = this.userData.asObservable();

  constructor(
    private router: Router,
    private httpClient: HttpClient,
    private commonService: CommonService,
    private userClinicsService: UserClinicsService,
  ) {
    this.apiBaseUrl = environment.api_url;
    if(!firebase.app) {
      firebase.initializeApp(environment.firebase);
    }
  }

  login(postData: FormData, remember_me=false) {
    let apiURL = this.apiBaseUrl + '/login';
    return this.httpClient.post(apiURL, postData).pipe(
      map(
        (response: any) => {
          if (response.status === true) {
            this.commonService.setLoggedInObservable(true);
            this.userData.next(response.data);
            this.commonService.setUserData(response.data, remember_me);
            this.commonService.userDefaultRoute();
          }
          return response;
        }
      )
    );
  }

  logout() {
    let userToken = this.commonService.getUserData('token');
    let userId = this.commonService.getUserData('user_id');
    let userType = this.commonService.getUserData('group_name');
    if (userToken) {
      console.log('if userToken', userToken);
      let apiURL = this.apiBaseUrl + '/logout?token=' + userToken;
      this.httpClient.get(apiURL).subscribe(() => {
        window.location.href = environment.site_url;
      });

      let params = {
        token: this.commonService.getUserData('token'),
        clinic_id: null,
        status: 'Offline'
      };
      this.userClinicsService.online(params).subscribe(
        (response: any) => {
          if (response.status) {
            firebase.database().ref('/users/' + userId).update({ "status": 'Offline' });
            this.userData.unsubscribe();
            localStorage.clear();
            localStorage.removeItem('userData');
            sessionStorage.removeItem('userData');
            localStorage.removeItem('find_in');
            sessionStorage.removeItem('find_in');
            this.commonService.setLoggedInObservable(false);
          }
        });

    }

    // window.location.href = environment.site_url;
  }

}
