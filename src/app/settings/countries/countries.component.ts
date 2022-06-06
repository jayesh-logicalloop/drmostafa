import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormBuilder, NgForm, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { ApiService } from '../../services/api.service';
import { CountryService } from '../../services/country.service';
import { CommonService } from '../../services/common.service';
import { ModalService } from '../../services/modal.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-countries',
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CountriesComponent implements OnInit {
  userType = '';
  @ViewChild('myform', { static: false }) myForm: NgForm;
  crudForm: FormGroup;
  crudFormUpdate: FormGroup;
  crudFormAction: boolean = false;
  crudFormUpdateAction: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number;
  item_id: any = null;
  r_index: number = null;
  currentAction: string = "";
  crudData: [];
  crudDetail = {
    "country_id": "",
    "country_name": "",
    "country_code": "",
    "status": "",
    "action": ""
  };


  languagesData: [];
  isPagination: number = 0;
  contentLanguage: string;
  contentForm: FormGroup;
  contentFormAction: boolean = false;
  contentDetail = {
    "row_id": "",
    "lang_code": "",
    "content_title": "",
    "content_detail": "",
    "content_type": "",
    "action": ""
  };
  removeRowData = {
    "item_key": "",
    "item_id": "",
    "content_type": "",
    "row_index": 0
  };

  constructor(
	private translate: TranslateService,
    private apiService: ApiService,
    private formBuilder: FormBuilder,
    private title: Title,
    private commonService: CommonService,
    private modalService: ModalService,
    private alertService: AlertService,
    private countryService: CountryService,
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Countries');
    this.apiService.currentUserData.subscribe(
      (userData: any) => {
        this.userType = (userData.group_name) ? userData.group_name : this.commonService.getUserData('group_name');
        /* const allowedUserTypes = ['Super Admin'];
        if (!allowedUserTypes.includes(this.userType)) {
          this.commonService.userDefaultRoute();
        } */
      }
    );
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.totalCountries();
    this.getCountries();

    this.crudForm = this.formBuilder.group({
      country_name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(200)
      ]],
      country_code: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(10)
      ]],
      status: ['Active', [
        Validators.required
      ]]
    });

    this.crudFormUpdate = this.formBuilder.group({
      country_name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(200)
      ]],
      country_code: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(10)
      ]],
      status: ['Active', [
        Validators.required
      ]]
    });

    this.contentForm = this.formBuilder.group({
      content_title: ['', [Validators.required]]
    });
  }

  onManageCrud() {
    this.modalService.open_modal('#CrudModal');
    this.crudForm.patchValue({
      'country_name': '',
      'country_code': '',
      'status': ''
    });
  }

  onEditCountry(item_id) {
    this.countryService.get({country_id: item_id}).subscribe(
      (response: any) => {
        if (response.status) {
          this.modalService.open_modal('#CrudModalUpdate');
          this.crudDetail = response.data;
          this.crudFormUpdate.patchValue({
            'country_name': this.crudDetail.country_name,
            'country_code': this.crudDetail.country_code,
            'status': this.crudDetail.status
          });
        }
      }
    )
  }

  onSubmitCrudForm() {
    if (this.crudForm.valid) {
      let postData = new FormData();
      postData.append('token', this.commonService.getUserData('token'));
      postData.append('country_id', this.crudDetail.country_id);
      postData.append('action', this.crudDetail.action);
      postData.append('country_name', this.crudForm.value.country_name);
      postData.append('country_code', this.crudForm.value.country_code);
      postData.append('status', this.crudForm.value.status);
      this.crudFormAction = true;

      this.countryService.create(postData)
        .subscribe(
          (response: any) => {
            if (response.status) {
              this.modalService.close_modal('#CrudModal');
              this.alertService.show_alert(response.message);
              this.getCountries();
            }
            this.crudFormAction = false;
          },
          (error) => {
            this.crudFormAction = false;
          },
          () => {
            this.crudFormAction = false;
          }
        );
    }
  }

  onSubmitCrudFormUpdate() {
    if (this.crudFormUpdate .valid) {
      let postData = {
        'token': this.commonService.getUserData('token'),
        'country_id': this.crudDetail.country_id,
        'country_name': this.crudFormUpdate.value.country_name,
        'country_code': this.crudFormUpdate.value.country_code,
        'status': this.crudFormUpdate.value.status,
      }
      this.crudFormAction = true;

      this.countryService.update(postData)
        .subscribe(
          (response: any) => {
            if (response.status) {
              this.modalService.close_modal('#CrudModalUpdate');
              this.alertService.show_alert(response.message);
              this.getCountries();
            }
            this.crudFormAction = false;
          },
          (error) => {
            this.crudFormAction = false;
          },
          () => {
            this.crudFormAction = false;
          }
        );
    }
  }

  getCountries() {
    this.countryService.all({ "limit": this.itemsPerPage, "page": this.currentPage, "ob_key": "country_id", "ob_value": "DESC" }).subscribe(
      (response: any) => {
        if (response.status) {
          this.crudData = response.data;
        }
      }
    )

  }

  totalCountries() {
    this.countryService.total().subscribe(
      (response: any) => {
        this.totalItems = response.data;
        if (this.totalItems > this.itemsPerPage) {
          this.isPagination = 1;
        }
      }
    );
  }

  pageChanged(p: number) {
    this.currentPage = p;
    this.getCountries();
  }

}
