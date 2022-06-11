import { AfterViewInit, Component, OnInit, ViewEncapsulation } from '@angular/core';
import * as firebase from 'firebase';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

import { environment } from '../../../../environments/environment';

import { CommonService } from '../../../services/common.service';
import { ApiService } from '../../../services/api.service';
import { UserClinicsService } from '../../../services/user-clinics.service';
import { NotificationService } from '../../../services/notification.service';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit, AfterViewInit {

  isloggedInObservable$: Observable<boolean>;
  token = '';
  userId = '';
  userName = '';
  userImage = '';
  message = '';
  userType = '';
  clinic_id = '';
  clinics = [];
  online_status = 'Offline';
  settings: any;
  notificationData = [];

  find_in = 'session';
  storage_type = false;
  localUserData: any;

  lang = 'ar';
  language = 'Arabic';
  langJson = {
    en: 'English',
    ar: 'Arabic'
  }

  isReadNotification: boolean = false;

  constructor(
    private translate: TranslateService,
    private commonService: CommonService,
    private apiService: ApiService,
    private userClinicsService: UserClinicsService,
    private notificationService: NotificationService,
    private alertService: AlertService,
  ) {
    const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.isloggedInObservable$ = this.commonService.isloggedInObservable;
    if (!firebase.app) {
      firebase.initializeApp(environment.firebase);
    }
    this.lang = this.commonService.lang;
    this.language = this.langJson[this.lang];
  }

  changeLanguage(lang: string) {
    this.language = this.langJson[lang];
    this.commonService.changeLang(lang);
    window.location.reload();
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.getAllNotification();
    this.apiService.currentUserData.subscribe(
      (userData: any) => {
        this.token = (userData.token) ? userData.token : this.commonService.getUserData('token');
        this.userId = (userData.user_id) ? userData.user_id : this.commonService.getUserData('user_id');
        this.userName = (userData.full_name) ? userData.full_name : this.commonService.getUserData('full_name');
        this.userImage = userData.profile_image_url ? userData.profile_image_url : this.commonService.getUserData('profile_image_url');
        this.userType = (userData.group_name) ? userData.group_name : this.commonService.getUserData('group_name');
        this.clinic_id = (userData.clinic_id) ? userData.clinic_id : this.commonService.getUserData('clinic_id');
        this.settings = (userData.settings) ? userData.settings : this.commonService.getUserData('settings');
        this.clinics = (userData.clinics) ? userData.clinics : this.commonService.getUserData('clinics');
        this.localUserData = (Object.keys(userData).length && userData.constructor === Object) ? userData : this.commonService.getUserData();
        this.online_status = this.settings.hasOwnProperty('online_status') ? this.settings.online_status : 'Offline';
        console.log('this.settings', this.settings);
        console.log('this.online_status', this.online_status);
        //console.log('this.clinics', this.clinics);
        //console.log('this.userId', this.userId);
      }
    );
    this.find_in = localStorage.getItem('find_in');
    if (this.find_in == 'local') {
      this.storage_type = true;
    }
  }

  ngAfterViewInit() { }

  getAllNotification() {
    let token = this.commonService.getUserData('token');
    if (token != '') {
      this.notificationService.get({ limit: 5 }).subscribe(
        (response: any) => {
          if (response.status) {
            this.notificationData = response.data;
            this.isReadNotification = this.notificationData.find((obj) => { return obj.is_readed == "No"; }) ? true : false;
            console.log(this.isReadNotification);
          }
        }
      );
    }
  }

  updateNotificationStatus() {
    let token = this.commonService.getUserData('token');
    if (token != '') {
      this.notificationService.put({ token: token }).subscribe(
        (response: any) => {
          if (response.status) {
            this.isReadNotification = false;
          }
        }
      );
    }
  }

  onLogout() {

    Swal.fire({
      title: 'Are you sure want to Logout?',
      text: 'Are you sure?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false
    }).then((result) => {
      if (result.value) {
        this.apiService.logout();
      }
    });
  }

  changeOnlineStatus(index: string) {
    let meta_value = this.online_status;
    let clinic_id = '';
    let clinic_name = '';
    let alertTitle = '';
    let responseTitle = '';
    if (index == 'Offline') {
      meta_value = 'Offline';
      alertTitle = 'Change status to offline';
      responseTitle = 'You are offline';
    } else {
      meta_value = 'Online';
      clinic_id = this.clinics[index].clinic_id;
      clinic_name = this.clinics[index].clinic_name;
      alertTitle = 'Change status to ' + meta_value + ' for ' + clinic_name;
      responseTitle = 'You are ' + meta_value + ' for ' + clinic_name;
    }

    Swal.fire({
      title: alertTitle,
      text: 'Are you sure?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false
    }).then((result) => {
      if (result.value) {
        let params = {
          token: this.commonService.getUserData('token'),
          clinic_id: clinic_id,
          status: meta_value
        };
        this.userClinicsService.online(params).subscribe((response: any) => {
          if (response.status) {
            this.online_status = meta_value;
            this.localUserData.settings.online_status = meta_value;
            for (let i = 0; i < this.localUserData.clinics.length; i++) {
              if (meta_value == 'Online' && i == parseInt(index)) {
                this.localUserData.clinics[i]['online'] = "Yes";
              } else {
                this.localUserData.clinics[i]['online'] = "No";
              }
            }

            firebase.database().ref('/users/' + this.userId).update({ "status": this.online_status });

            this.commonService.setUserData(this.localUserData, this.storage_type);
            this.apiService.userData.next(this.localUserData);
            this.alertService.show_alert(responseTitle);
          }
        }, (error: Error) => {
          console.log(error.message)
        });
      } else {
        //window.location.reload();
      }
    });
  }
}
