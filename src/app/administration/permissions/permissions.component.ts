import { Component, OnInit, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, map } from "rxjs/operators";
import { fromEvent } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { ApiService } from    'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { ModalService } from 'src/app/services/modal.service';
import { AlertService } from 'src/app/services/alert.service';
import { AdministrationService } from 'src/app/services/administration.service';
declare var jQuery:any;

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PermissionsComponent implements OnInit {
  userType      = '';
  user_group_id = 0;
  user_groups: any;
  dataLoader = false;
  group_id = 0;
  totalGroups = 0;
  all_menu_list:any;
  all_menu_list_items:any[] = [];
  assigned_menu_list:any;

  constructor(
	private translate: TranslateService,
    private title: Title,
    private formBuilder: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private commonService: CommonService,
    private modalService: ModalService,
    private alertService: AlertService,
    private administrationService: AdministrationService,   
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Manage permissions');

    this.user_group_id = this.commonService.getUserData('group_id');
    this.user_group_id = (this.user_group_id) ? this.user_group_id : 0;  

    this.apiService.currentUserData.subscribe(
      (userData: any) => {        
        this.userType      = (userData.group_name) ? userData.group_name : this.commonService.getUserData('group_name');
        /* const allowedUserTypes = ['Super Admin', 'Doctor'];
        if (!allowedUserTypes.includes(this.userType)) {
          this.commonService.userDefaultRoute();
        } */
      }
    );

  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.getUserGroups();
  }

  getUserGroups(){
    this.dataLoader = true;
    this.administrationService.userGroups({group_id: this.group_id}).subscribe(
      (response: any) => {
        this.user_groups = response.data;  
        this.totalGroups = response.count;
        if(this.totalGroups > 0){
          this.getGroupPermissions();       
        }     
        this.dataLoader = false; 
      },
      (error) => { this.dataLoader = false; },
    );
  }

  getGroupPermissions(){    
    this.dataLoader = true;
    let params = {};
    this.administrationService.groupPermissions(this.group_id, params).subscribe(
      (response: any) => {
        this.all_menu_list = response.data.all_menu_list;
        this.assigned_menu_list = response.data.assigned_menu_list;
        for(let i=0; i<this.all_menu_list.items.length; i++) {
          this.all_menu_list.items[i]['menu_actions'] = this.all_menu_list.items[i]['menu_actions'].split('|');
        }
        this.all_menu_list_items = this.all_menu_list.items;
        this.dataLoader = false;
      },
      (error) => { this.dataLoader = false; },
    );    
  }

  fetchGroupPermissions(group_id){  
    this.group_id = group_id;
    this.getGroupPermissions();
  }

  setMenuPermission(event:any, menu_id:any){
    let action   = event.srcElement.defaultValue;
    let checked  = event.srcElement.checked;
    checked      = (checked) ? 'Checked' : 'Unchecked'; 
    let group_id:any;
    group_id     = (this.group_id > 0) ? this.group_id : 7;

    let formData = new FormData();
    formData.append('token', this.commonService.getUserData('token'));
    formData.append('menu_id', menu_id);
    formData.append('action', action);
    formData.append('checked', checked);
    formData.append('group_id', group_id);

    this.administrationService.saveMenuPermission(formData).subscribe(
      (response: any) => {      
        if(response.status){ } else {
          this.alertService.show_alert(response.message);       
        }
      },
      (error) => { this.dataLoader = false; },
    );         
  }
}
