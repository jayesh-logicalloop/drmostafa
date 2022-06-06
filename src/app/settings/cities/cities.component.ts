import { Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { ApiService } from '../../services/api.service';
import { CommonService } from '../../services/common.service';
import { CityService } from '../../services/city.service';
import { RegionService } from '../../services/region.service';
import { CountryService } from '../../services/country.service';
import { ModalService } from '../../services/modal.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-cities',
  templateUrl: './cities.component.html',
  styleUrls: ['./cities.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CitiesComponent implements OnInit {
  userType = '';
  @ViewChild('myform', {static: false}) myForm: NgForm;
  addForm:FormGroup;
  updateForm:FormGroup;
  addFormAction:boolean = false;
  updateFormAction:boolean = false;
  currentPage:number=1;
  itemsPerPage:number=10;
  totalItems:number;
  citiesData = [];
  regionData=[];
  city_id:number=null;
  c_index:number=null;
  updateDetail = {
    "country_code":"",
    "city_id": "",
    "region_code": "",
    "region_name": "",
    "city_name": "",
    "status": "",
  };
  countries = [];
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

  constructor(
	private translate: TranslateService,
    private title: Title,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private commonService: CommonService,
    private modalService: ModalService,
    private alertService: AlertService,
    private cityService: CityService,
    private countryService: CountryService,
    private regionService: RegionService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Cities');
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
    this.totalCities();
    this.getcities();

    this.addForm = this.formBuilder.group({
      country_code:['',[
        Validators.required,
      ]],
      region_code:['',[
        Validators.required,
      ]],
      city_name:['',[
        Validators.required,
        Validators.minLength,
        Validators.maxLength
      ]],
      status:['Active',[
        Validators.required
      ]]
    });

    this.updateForm = this.formBuilder.group({
      country_code_update:['',[
        Validators.required,
      ]],
      region_code_update:['',[
        Validators.required,
      ]],
      city_name_update:['',[
        Validators.required,
        Validators.minLength,
        Validators.maxLength
      ]],
      status_update:['Active',[
        Validators.required
      ]]
    });

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
      postData.append('city_name',this.addForm.value.city_name);
      postData.append('country_code',this.addForm.value.country_code);
      postData.append('region_code',this.addForm.value.region_code);
      postData.append('status',this.addForm.value.status);
      this.addFormAction = true;
      this.cityService.create(postData).subscribe(
        (response:any)=>{
          if(response.status){
            this.alertService.show_alert(response.message);
            this.modalService.close_modal('#createCity');
            this.myForm.resetForm();
            this.addForm.patchValue({
              "status":'Active',
              'region_code':'',
            });
            this.getcities();
          }
          this.addFormAction = false;
        },
        (error)=>{ this.addFormAction = false; }
      )
    }
  }

  onEditCity(city_id, c_index){
    this.updateDetail = this.citiesData.filter(x=>x.city_id == city_id)[0];
    this.updateForm.patchValue({
      'country_code_update':this.updateDetail.country_code,
      'region_code_update':this.updateDetail.region_code,
      'city_name_update':this.updateDetail.city_name,
      'status_update':this.updateDetail.status,
    });
    this.getRegions();
    this.modalService.open_modal('#updateCity');
  }

  onSubmitupdateForm() {
    if (this.updateForm.valid) {
      let putData = {
        "token": this.commonService.getUserData('token'),
        "country_code":this.updateForm.value.country_code_update,
        "city_id":this.updateDetail.city_id,
        "region_code":this.updateForm.value.region_code_update,
        "city_name":this.updateForm.value.city_name_update,
        "status"	:this.updateForm.value.status_update
      };
      this.updateFormAction = true;
      this.cityService.update(putData).subscribe(
        (response: any) => {
          if (response.status) {
            this.modalService.close_modal('#updateCity');
            this.alertService.show_alert(response.message);
            this.c_index = null;
            this.getcities();
          }
          this.updateFormAction = false;
        },
        (error) => { this.updateFormAction = false; }
      );
    }
  }

  getcities(){
    this.cityService.all({ "limit": this.itemsPerPage, "page": this.currentPage, "ob_key": "city_id", "ob_value": "DESC" }).subscribe(
      (response:any)=>{
        if(response.status){
          this.citiesData = response.data;
        }
      }
    )
  }

  getRegions(){
    let country_code = this.addForm.value.country_code;
    if(country_code == ''){
      country_code = this.updateForm.value.country_code_update;
    }
    if(country_code != ''){
      this.regionService.get({pagination:'No', 'country_code':country_code}).subscribe(
        (response:any)=>{
          if(response.status){
            this.regionData = response.data;
          }
        }
      );
    }
  }

  totalCities(){
    this.cityService.total().subscribe(
      (response:any)=>{
        this.totalItems = response.data;
      }
    );
  }

  pageChanged(p:number) {
    this.currentPage = p;
    this.totalCities();
    this.getcities();
  }

  checkLanguageContent(languageCodes:string, langCode:string){
    if(languageCodes && languageCodes.length > 0){
      let langRowArray = languageCodes.split(",");
      if(langRowArray.includes(langCode)) { return true; }
    }
    return false;
  }

  setRemoveRowData(item_key:string, item_id:any, content_type:string, row_index:any){
    if(item_id &&  content_type && content_type.length > 0 ){
      this.removeRowData.item_key      =  item_key;
      this.removeRowData.item_id       =  item_id;
      this.removeRowData.content_type  =  content_type;
      this.removeRowData.row_index     =  row_index;
    }
  }
}
