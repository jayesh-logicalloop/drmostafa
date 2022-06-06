import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from 'src/app/services/common.service';

import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class NotificationsComponent implements OnInit {

  limit = 10;
  page = 1;
  total: number;

  dataLoader=true;
  notifications=[];

  constructor(
	private commonService: CommonService,
	private translate: TranslateService,
    private title: Title,
    private notificationService: NotificationService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Notifications');
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.getTotalNotifications();
  }

  getTotalNotifications() {
    this.dataLoader = true;
    this.notificationService.total().subscribe(
      (response:any)=>{
        this.total = response.data;
        if(this.total) {
          this.getNotifications();
        } else {
          this.dataLoader = false;
          this.notifications = [];
        }
      },
      (error) => {
        this.notifications = [];
        this.dataLoader = false;
      }
    );
  }

  getNotifications() {
    this.dataLoader = true;
    this.notificationService.get({page: this.page, limit: this.limit}).subscribe(
      (response:any)=>{
        if(response.status) {
          this.notifications = response.data;
        }
        this.dataLoader = false;
      }
    );
  }

  pageChanged(p: number) {
    this.page = p;
    this.getTotalNotifications();
  }

}
