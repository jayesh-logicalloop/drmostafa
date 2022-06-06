import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormBuilder, NgForm, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { ApiService } from '../../services/api.service';
import { RegionService } from '../../services/region.service';
import { CountryService } from '../../services/country.service';
import { CommonService } from '../../services/common.service';
import { ModalService } from '../../services/modal.service';
import { AlertService } from '../../services/alert.service';


@Component({
  selector: 'app-regions',
  templateUrl: './regions.component.html',
  styleUrls: ['./regions.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class RegionsComponent implements OnInit {
  userType = '';
  public selectedMoment = new Date();
  @ViewChild('myform', {static: false})
  myForm: NgForm;
  addForm:FormGroup;
  updateForm:FormGroup;
  addFormAction:boolean = false;
  updateFormAction:boolean = false;
  currentPage:number=1;
  itemsPerPage:number=5;
  totalItems:number;
  regionData = [];
  region_id:number=null;
  r_index:number=null;
  updateDetail = {
    "region_id": "",
    "country_code": "",
    "region_name": "",
    "region_code": "",
    "status": ""
  };

  languagesData:[];
  contentLanguage:string;
  contentForm:FormGroup;
  contentFormAction:boolean = false;
  contentDetail = {
    "row_id"          : "",
    "lang_code"       : "",
    "content_title"   : "",
    "content_detail"  : "",
    "content_type"    : "",
    "action"          : ""
  };
  removeRowData = {
    "item_key"       : "",
    "item_id"        : "",
    "content_type"   : "",
    "row_index"      : 0
  };
  countries = [];

  constructor(
	private translate: TranslateService,
    private title: Title,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private commonService:CommonService,
    private countryService:CountryService,
    private regionService:RegionService,
    private modalService: ModalService,
    private alertService:AlertService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Regions');
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
    this.get_countries();
    this.getRegions();
    this.totalRegions();
    this.addForm = this.formBuilder.group({
      region_name:['',[
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      country_code:['',[
        Validators.required,
      ]],
      pickerTest:['',[]],
      region_code:['',[
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(10),
      ]],
      region_status:['Active',[
        Validators.required
      ]]
    });

    this.updateForm = this.formBuilder.group({
      region_name_update:['',[
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      country_code_update:['',[
        Validators.required,
      ]],
      region_code_update:['',[
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(10),
      ]],
      region_status_update:['Active',[
        Validators.required
      ]]
    })

    this.contentForm = this.formBuilder.group({
      content_title:['', [Validators.required]]
    });
  }

  get_countries(){
    this.countryService.all().subscribe(
      (response:any)=>{
        this.countries = response.data;
      }
    )
  }

  onSubmitAddForm(){
    if(this.addForm.valid){
      let postData = new FormData();
      postData.append('token',this.commonService.getUserData('token'));
      postData.append('region_name',this.addForm.value.region_name);
      postData.append('country_code',this.addForm.value.country_code);
      postData.append('region_code',this.addForm.value.region_code);
      postData.append('status',this.addForm.value.region_status);
      this.addFormAction = true;
      this.regionService.create(postData).subscribe(
        (response:any)=>{
          if(response.status){
            this.alertService.show_alert(response.message);
            this.modalService.close_modal('#createRegion');
            this.myForm.resetForm();
            this.getRegions();
          }
          this.addFormAction = false;
        },
        (error)=>{ this.addFormAction = false; }
      )
    }
  }

  onEditRegion(region_id,r_index){
    this.updateDetail = this.regionData.filter(x=>x.region_id == region_id)[0];
    this.updateForm.patchValue({
      'country_code_update':this.updateDetail.country_code,
      'region_name_update':this.updateDetail.region_name,
      'region_code_update':this.updateDetail.region_code,
      'region_status_update':this.updateDetail.status,
    });
    this.modalService.open_modal('#updateRegion');
  }

  onSubmitupdateForm() {
    if (this.updateForm.valid) {
      let putData = {
        "region_id": this.updateDetail.region_id,
        "token": this.commonService.getUserData('token'),
        "region_name": this.updateForm.value.region_name_update,
        "country_code":this.updateForm.value.country_code_update,
        "region_code": this.updateForm.value.region_code_update,
        "status":this.updateForm.value.region_status_update
      };
      this.updateFormAction = true;
      this.regionService.update(putData)
        .subscribe(
          (response: any) => {
            if (response.status) {
              this.modalService.close_modal('#updateRegion');
              this.alertService.show_alert(response.message);
              this.getRegions();
            }
            this.updateFormAction = false;
          },
          (error) => { this.updateFormAction = false; }
        );
    }
  }

  getRegions(){
    this.regionService.get({ "limit": this.itemsPerPage, "page": this.currentPage, "ob_key": "region_id", "ob_value": "DESC" }).subscribe(
      (response:any)=>{
        if(response.status){
          this.regionData = response.data;
        }
      }
    )
  }

  pageChanged(p:number) {
    this.currentPage = p;
    this.totalRegions();
    this.getRegions();
  }

  totalRegions(){
    this.regionService.total().subscribe(
      (response:any)=>{
        this.totalItems = response.data;
      }
    );
  }

  openForm(){
    this.addForm.reset();
    this.addForm.patchValue({
      "region_status":'Active',
      "country_code":'',
    });
    this.modalService.open_modal('#createRegion')
  }
}
