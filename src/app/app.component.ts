import { Component, ViewEncapsulation, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ApiService } from './services/api.service'
import { CommonService } from './services/common.service';
import { MessagingService } from './services/messaging.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements AfterViewInit {
  @ViewChild('mycontainer', {static: true}) mycontainer: ElementRef;
  userToken='';

  constructor(
	private translate: TranslateService,
    private router: Router,
    private apiService: ApiService,
    private commonService: CommonService,
    private messagingService: MessagingService
  ) {

	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
	  this.apiService.currentUserData.subscribe(
      (userData:any) => {
        this.userToken = (userData.token) ? userData.token : this.commonService.getUserData('token');
        if(this.userToken) {
          this.commonService.setLoggedInObservable(true);
          this.mycontainer.nativeElement.classList.add('page-body-wrapper');
        } else {
          this.mycontainer.nativeElement.classList.remove('page-body-wrapper');
        }
      }
    );
    this.messagingService.requestPermission()
    this.messagingService.receiveMessage();
    //this.message = this.messagingService.currentMessage
  }

  ngAfterViewInit() {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
          return;
      }
      window.scrollTo(0, 0);
    });
  }

}
