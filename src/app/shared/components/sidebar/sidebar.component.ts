import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../../services/api.service';
import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SidebarComponent implements OnInit {
  isloggedInObservable$: Observable<boolean>;
  userType = '';
  created_by = 0;
  token = '';
  navigations:any;
  currentRouterUrl:any;
  items: any[] = [];
  parents:any;
  permission:any;
  assigned:any;

  constructor(
	private translate: TranslateService,
    private apiService: ApiService,
    private commonService: CommonService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.isloggedInObservable$ = this.commonService.isloggedInObservable;
    this.apiService.currentUserData.subscribe(
      (userData: any) => {
        this.userType   = (userData.group_name) ? userData.group_name : this.commonService.getUserData('group_name');
        this.created_by = (userData.created_by) ? userData.created_by : this.commonService.getUserData('created_by');
        setTimeout(()=>{
          this.setSidebarVars();
        }, 2000);
      }
    );
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
  }

  menus:any[] = [];
  setSidebarVars() {
    this.navigations    = this.commonService.getUserData('navigations');
    this.items          = (this.navigations.items) ? this.navigations.items : [];
    this.parents        = (this.navigations.parents) ? this.navigations.parents : null;
    this.permission     = (this.navigations.permission) ? this.navigations.permission : null;
    this.assigned       = (this.navigations.assigned) ? this.navigations.assigned : null;

    let m = [];
    for(let i of this.items) {
      if(i.parent_id == 0) {
        let mm = i;
        if (i.menu_alias !== "feedback") {
          mm['items'] = [];
          m.push(mm);
        }
      }
    }

    for(let i=0; i<this.items.length; i++) {
      if(this.items[i].parent_id>0) {
        for(let j=0; j<m.length; j++) {
          if(this.items[i].parent_id == m[j].page_menu_id) {
            if (this.items[i].menu_alias !== "walkthrough") {
              m[j]['items'].push(this.items[i]);
            }
          }
        }
      }
    }
    this.menus = m;
  }

  onLogout() {
    this.apiService.logout();
  }
}
