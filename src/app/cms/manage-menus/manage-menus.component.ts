import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, NgForm, FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { CmsMenuService } from '../../services/cms-menu.service';
import { ApiService } from '../../services/api.service';
import { CommonService } from '../../services/common.service';
import { ModalService } from '../../services/modal.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-manage-menus',
  templateUrl: './manage-menus.component.html',
  styleUrls: ['./manage-menus.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ManageMenusComponent implements OnInit {
  userType:string='';

  @ViewChild('mycrudform', { static: false }) mycrudform: NgForm;
  crudForm: FormGroup;
  crudFormLoader = false;
  currentAction = "Create";

  id = '';
  index:number;
  menuCategoryOptions = ['Header'];

  currentPage = 1;
  itemsPerPage = 10;
  totalItems: number;
  crudData = [];

  constructor(
	private translate: TranslateService,
    private cmsMenuService: CmsMenuService,
    private formBuilder: FormBuilder,
    private title: Title,
    private apiService: ApiService,
    private commonService: CommonService,
    private modalService: ModalService,
    private alertService: AlertService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Manage Menus');

    this.apiService.currentUserData.subscribe(
      (userData: any) => {
        this.userType = (userData.group_name) ? userData.group_name : this.commonService.getUserData('group_name');
        /* const allowedUserTypes = ['Super Admin'];
        if (!allowedUserTypes.includes(this.userType)) {
          this.commonService.userDefaultRoute();
        } */
      }
    );

    this.crudForm = this.formBuilder.group({
      title: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      sub_title: ['', [
        Validators.maxLength(50)
      ]],
      icon: ['', [
        Validators.maxLength(50)
      ]],
      target: ['_self', [
        Validators.required
      ]],
      url: ['', [
        Validators.required,
        Validators.maxLength(250)
      ]],
      menu_type: ['Header', [
        Validators.required
      ]],
      menu_category: ['', [
        Validators.required
      ]],
      sort_order: ['', [
        Validators.required,
      ]],
      status: ['Active', [
        Validators.required
      ]]
    });
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.get_total_menus();
  }

  get_total_menus() {
    this.cmsMenuService.total().subscribe(
      (response: any) => {
        this.totalItems = response.data;
        if (this.totalItems) {
          this.get_menus();
        }
      }
    );
  }

  get_menus() {
    this.cmsMenuService.get('', {limit: this.itemsPerPage, page: this.currentPage}).subscribe(
      (response: any) => {
        if (response.status) {
          this.crudData = response.data;
        }
      }
    )
  }

  pageChanged(p: number) {
    this.currentPage = p;
    this.get_menus();
  }

  onChangeMenuType(menuType='Header') {
    this.menuCategoryOptions = [];
    this.crudForm.patchValue({menu_category: ""});
    if (menuType == 'Header') {
      this.menuCategoryOptions.push('Header');
    } else if (menuType == 'Footer') {
      this.menuCategoryOptions.push('Medzigo', 'For Patients', 'For Doctors', 'More', 'Social', 'Clinic Hospital');
    }
  }

  onManageCrud(item_id: string, action: string, index: number=null) {
    this.index = index;
    this.currentAction = action;
    this.id = item_id;
    if (action == 'Create') {
      this.modalService.open_modal('#CrudModal');
      this.mycrudform.resetForm();
      this.menuCategoryOptions = ['Header'];
      this.crudForm.patchValue({
        target: '_self',
        menu_type: 'Header',
        menu_category: 'Header',
        status: 'Active'
      });
    }

    if (action == 'Update' && item_id) {
      let dbRowData = this.crudData[index];
      this.onChangeMenuType(dbRowData.menu_type);

      this.crudForm.patchValue({
        title: dbRowData.title,
        sub_title: dbRowData.sub_title,
        icon: dbRowData.icon,
        target: dbRowData.target,
        menu_type: dbRowData.menu_type,
        menu_category: dbRowData.menu_category,
        url: dbRowData.url,
        sort_order: dbRowData.sort_order,
        status: dbRowData.status
      });

      this.modalService.open_modal('#CrudModal');
    }
  }

  onSubmitCrudForm() {
    if (this.crudForm.valid) {
      let postData = new FormData();
      postData.append('token', this.commonService.getUserData('token'));
      postData.append('action', this.currentAction);
      postData.append('title', this.crudForm.value.title);
      postData.append('sub_title', this.crudForm.value.sub_title);
      postData.append('icon', this.crudForm.value.icon);
      postData.append('target', this.crudForm.value.target);
      postData.append('menu_type', this.crudForm.value.menu_type);
      postData.append('menu_category', this.crudForm.value.menu_category);
      postData.append('url', this.crudForm.value.url);
      postData.append('sort_order', this.crudForm.value.sort_order);
      postData.append('status', this.crudForm.value.status);
      this.crudFormLoader = true;
      this.cmsMenuService.post(this.id, postData).subscribe(
        (response: any) => {
          if (response.status) {
            this.modalService.close_modal('#CrudModal');
            this.alertService.show_alert(response.message);
            if(this.currentAction == 'Update') {
              this.crudData[this.index]['title'] = this.crudForm.value.title;
              this.crudData[this.index]['sub_title'] = this.crudForm.value.sub_title;
              this.crudData[this.index]['icon'] = this.crudForm.value.icon;
              this.crudData[this.index]['target'] = this.crudForm.value.target;
              this.crudData[this.index]['menu_type'] = this.crudForm.value.menu_type;
              this.crudData[this.index]['menu_category'] = this.crudForm.value.menu_category;
              this.crudData[this.index]['url'] = this.crudForm.value.url;
              this.crudData[this.index]['sort_order'] = this.crudForm.value.sort_order;
              this.crudData[this.index]['status'] = this.crudForm.value.status;
            } else {
              this.get_menus();
            }
          }
          this.crudFormLoader = false;
        },
        (error) => { this.crudFormLoader = false; }
      );
    }
  }

  deleteCrudData(item_id:string, index:number) {
    Swal.fire({
      title: 'Delete',
      text: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        let postData = new FormData();
        postData.append('token', this.commonService.getUserData('token'));
        postData.append('action', 'Delete');
        this.cmsMenuService.post(item_id, postData).subscribe(
          (response: any) => {
            if (response.status) {
              this.crudData.splice(index, 1);
            }
          }
        );
      }
    });
  }

}
