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

@Component({
  selector: 'app-pagemenus',
  templateUrl: './pagemenus.component.html',
  styleUrls: ['./pagemenus.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PagemenusComponent implements OnInit {
  userType = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalItems: number;
  menuId = '0';
  parentMenus: any;

  @ViewChild('searchEle', {static: false}) searchEle: ElementRef;
  search = '';
  status = '';
  dataLoader = false;
  menus:any;

  @ViewChild('ngaddform', {static: false}) ngaddform: NgForm;
  addForm: FormGroup;
  addFormLoader = false;
  emailRegex = this.commonService.emailRegex;
  
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
    this.title.setTitle('Menu Pages');

    this.apiService.currentUserData.subscribe(
      (userData: any) => {
        this.userType = (userData.group_name) ? userData.group_name : this.commonService.getUserData('group_name');
        const allowedUserTypes = ['Super Admin', 'Doctor'];
        if (!allowedUserTypes.includes(this.userType)) {
          this.commonService.userDefaultRoute();
        }
      }
    );

    this.addForm = this.formBuilder.group({
      menu_id:['', [Validators.minLength(1), Validators.maxLength(200)]],
      menu_level: ['', [Validators.minLength(1), Validators.maxLength(200)]],

      parent_id:['', [Validators.minLength(1), Validators.maxLength(200)]],
      icon_class:['', [Validators.minLength(2), Validators.maxLength(200)]],
      menu_title: ['', [Validators.required,  Validators.minLength(2), Validators.maxLength(200)]],
      menu_alias: ['', [Validators.required,  Validators.minLength(2), Validators.maxLength(200)]],
      menu_actions: ['', [Validators.required,  Validators.minLength(2),Validators.maxLength(200)]],
      menu_url: ['', [Validators.required,  Validators.minLength(2), Validators.maxLength(200)]],
      menu_api: ['', [Validators.required,  Validators.minLength(2), Validators.maxLength(200)]],
      menu_order: ['', [Validators.required,  Validators.minLength(1), Validators.maxLength(5)]],
      status:['', [Validators.required]]
   });
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.getTotalItems();
    this.getParentMenus();
  }

  ngAfterViewInit(): void {
    fromEvent(this.searchEle.nativeElement, 'keyup').pipe(
      map((event: any) => {return event.target.value;}), debounceTime(1000)
    ).subscribe((text: string) => {
      this.search = text;      
      this.getTotalItems();     
    });
  }

  getTotalItems() {
    this.administrationService.getAllMenusCount({search: this.search }).subscribe(
      (response: any) => {
        this.totalItems = response.data;        
        if (this.totalItems > 0) {
          this.getItems();
        }
      }
    );
  }

  getItems() {
    this.dataLoader = true;
    let params = {
      search: this.search,
      status: this.status,
      limit:  this.itemsPerPage,
      page:   this.currentPage,
      ob_key: 'createdDate',
      ob_value: 'DESC'
    };
    this.administrationService.getAllMenus('', params).subscribe(
      (response: any) => {
        this.menus = response.data;
        this.dataLoader = false;
      },
      (error) => { this.dataLoader = false; },
    )
  }

  pageChanged(p: number) {
    this.currentPage = p;
    this.getItems();
  }

  clearSearch() {
    this.searchEle.nativeElement.value = '';
    this.search = '';
    this.getTotalItems();
  }

  openAddForm() {
    this.menuId = '0';
    this.ngaddform.resetForm();
    this.addForm.reset();
    this.addForm.patchValue({
      menu_title: '',
      menu_alias: '',
      menu_actions: '',
      menu_url: '',      
      parent_id: '',
      status: '',
      icon_class: '',
      menu_level: '0',
      menu_order: '0',
      menu_id: '0',
    });
    this.modalService.open_modal("#addFormModal");
  }

  openUpdateForm(menu_id:string, index:number) {
    const menu = this.menus[index];
    this.menuId = menu_id;
    this.addForm.patchValue({
      parent_id: menu.parent_id,
      icon_class: menu.icon_class,
      menu_title: menu.menu_title,
      menu_alias: menu.menu_alias,
      menu_actions: menu.menu_actions,
      menu_url: menu.menu_url,
      menu_api: menu.menu_api,
      menu_order: menu.menu_order,
      status: menu.status
    });
    this.modalService.open_modal("#addFormModal");
  }

  onSubmitAddForm() {
    if (this.addForm.valid) {
      let postData = new FormData();
      postData.append("token", this.commonService.getUserData("token"));
      postData.append("menu_id", this.menuId);
      postData.append("parent_id", this.addForm.value.parent_id);
      postData.append("icon_class", this.addForm.value.icon_class);
      postData.append("menu_title", this.addForm.value.menu_title);
      postData.append("menu_alias", this.addForm.value.menu_alias);
      postData.append("menu_actions", this.addForm.value.menu_actions);
      postData.append("menu_url", this.addForm.value.menu_url);
      postData.append("menu_api", this.addForm.value.menu_api);
      postData.append("status", this.addForm.value.status);
      postData.append("menu_level", this.addForm.value.menu_level);
      postData.append("menu_order", this.addForm.value.menu_order);
      
      
      this.addFormLoader = true;

      this.administrationService.manageMenu(postData).subscribe(
        (resp: any) => {   
          if (resp.status) {           
            this.modalService.close_modal("#addFormModal");
            this.alertService.show_alert(resp.message);
            this.getTotalItems();
            //this.router.navigate(['/administration/pagemenus']);
          }
          this.addFormLoader = false;
        },
        (error) => { this.addFormLoader = false; }
      );     
    }
  }

  getParentMenus() {
    let params = {};
    this.administrationService.getParentMenus(params).subscribe(
      (response: any) => {
        this.parentMenus = response.data;
      },
      (error) => { this.dataLoader = false; },
    )
  }

  
}
