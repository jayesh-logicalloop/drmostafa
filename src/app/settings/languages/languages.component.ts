import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup,NgForm,FormBuilder,Validators} from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ApiService } from '../../services/api.service';
import { CommonService } from '../../services/common.service';
import { ModalService } from '../../services/modal.service';
import { AlertService } from '../../services/alert.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-languages',
  templateUrl: './languages.component.html',
  styleUrls: ['./languages.component.css']
})
export class LanguagesComponent implements OnInit {
  @ViewChild('myform', {static: false}) myForm: NgForm;
  addForm:FormGroup;
  updateForm:FormGroup;
  addFormAction:boolean = false;
  updateFormAction:boolean = false;
  currentPage:number=1;
  itemsPerPage:number=10;
  totalItems:number;
  language_id:number=null;
  c_index:number=null;

  updateDetail = {
    "language_id": "",
    "language"   : "",
    "language_code"   : "",
    "status"     : "",
  };

  languagesData:[];
  languagesPagination :number= 0;

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
    private apiService:ApiService,
    private formBuilder: FormBuilder,
    private title: Title,
    private commonService:CommonService,
    private modalService: ModalService,
    private alertService:AlertService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Languages');
   }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    // this.totalLanguages();
    // this.getLanguages();

    this.addForm = this.formBuilder.group({
      language:['',[
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      language_code:['',[
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(5)
      ]],
      status:['Active',[
        Validators.required
      ]]
    });

    this.updateForm = this.formBuilder.group({
      language_update:['',[
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      language_code_update:['',[
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(5)
      ]],
      status_update:['Active',[
        Validators.required
      ]]
    });

    this.contentForm = this.formBuilder.group({
      content_title:['', [Validators.required]]
    });
  }

  // onSubmitAddForm(){
  //   if(this.addForm.valid){
  //     let postData = new FormData();
  //     postData.append('token',          this.commonService.getUserData('token'));
  //     postData.append('language_name',  this.addForm.value.language);
  //     postData.append('language_code',  this.addForm.value.language_code);
  //     postData.append('status',         this.addForm.value.status);
  //     postData.append('action',         'Create');
  //     this.addFormAction = true;

  //     this.apiService.language_post(postData).subscribe(
  //       (response:any)=>{
  //         if(response.status){
  //           this.alertService.show_alert(response.message);
  //           this.modalService.close_modal('#createLanguage');
  //           this.myForm.resetForm();
  //           this.addForm.patchValue({
  //             "status":'Active'
  //           })
  //           this.getLanguages();
  //         }
  //         this.addFormAction = false;
  //       },
  //       (error)=>{
  //         this.addFormAction = false;
  //       },
  //       ()=>{
  //         this.addFormAction =false;
  //       }
  //     )
  //   }
  // }

  // // onSubmitupdateForm() {
  // //   if (this.updateForm.valid) {
  // //     let putData = {
  // //       "token": this.commonService.getUserData('token'),
  // //       "language_id"   :this.updateDetail.language_id,
  // //       "language_code" :this.updateForm.value.language_code_update,
  // //       "language_name" :this.updateForm.value.language_update,
  // //       "status"	: this.updateForm.value.status_update,
  // //       "action"	: 'Update'
  // //     };
  // //     this.updateFormAction = true;
  // //     this.apiService.language_put(putData)
  // //       .subscribe(
  // //         (response: any) => {
  // //           if (response.status) {
  // //             this.modalService.close_modal('#updateLanguage');
  // //             this.alertService.show_alert(response.message);
  // //             this.c_index = null;
  // //             this.getLanguages();
  // //           }
  // //           this.updateFormAction = false;
  // //         },
  // //         (error) => {
  // //           this.updateFormAction = false;
  // //         },
  // //         () => {
  // //           this.updateFormAction = false;
  // //         }
  // //       );
  // //   }
  // // }

  // // onEditLanguage(language_id, c_index){
  // //   this.language_id = language_id;
  // //   this.c_index     = c_index;
  // //   this.apiService.all_languages_get({"language_id": this.language_id}).subscribe(
  // //     (response:any)=>{
  // //       if(response.status){
  // //         this.modalService.open_modal('#updateLanguage');
  // //         this.updateDetail = response.data[0];
  // //         this.updateForm.patchValue({
  // //           'language_id':this.updateDetail.language_id,
  // //           'language_update':this.updateDetail.language,
  // //           'language_code_update':this.updateDetail.language_code,
  // //           'status_update':this.updateDetail.status
  // //         });
  // //       }
  // //     }
  // //   )
  // // }

  // // getLanguages(){
  // //   this.apiService.all_languages_get({ "limit": this.itemsPerPage, "page": this.currentPage, "ob_key": "language_id", "ob_value": "DESC" }).subscribe(
  // //     (response:any)=>{
  // //       if(response.status){
  // //         this.languagesData = response.data;
  // //       }
  // //     }
  // //   )
  // // }


  // // totalLanguages(){
  // //   this.apiService.totalLanguagesCount({ }).subscribe(
  // //     (response:any)=>{
  // //       this.totalItems = response.data;
  // //       if(this.totalItems > this.itemsPerPage ){
  // //         this.languagesPagination = 1;
  // //       }
  // //     }
  // //   );
  // // }

  // checkLanguageContent(languageCodes:string, langCode:string){
  //   if(languageCodes && languageCodes.length > 0){
  //     let langRowArray = languageCodes.split(",");
  //     if(langRowArray.includes(langCode)) { return true; }
  //   }
  //   return false;
  // }

  // onManageContent(row_id:string, lang_code:string, lang_name:string, content_type:string, laction:string ){
  //   if(
  //     row_id && row_id.length > 0 &&
  //     lang_code && lang_code.length > 0 &&
  //     lang_name && lang_name.length > 0 &&
  //     content_type && content_type.length > 0 &&
  //     laction && laction.length > 0
  //   ){
  //     this.contentDetail.row_id          = row_id;
  //     this.contentDetail.lang_code       = lang_code;
  //     this.contentDetail.content_type    = content_type;
  //     this.contentDetail.action          = laction;
  //     this.contentLanguage               = lang_name;

  //     if(laction == 'Create'){
  //         this.modalService.open_modal('#ContentModal');
  //         this.contentForm.patchValue({
  //           'content_title' :   '',
  //           'content_detail':   ''
  //         });
  //     } else {
  //       let params = {
  //         "row_id"        : this.contentDetail.row_id,
  //         "lang_code"     : this.contentDetail.lang_code,
  //         "content_type"  : this.contentDetail.content_type
  //       };
  //       this.apiService.getLanguageContent(params).subscribe(
  //         (response:any)=>{
  //           if(response.status){
  //             this.modalService.open_modal('#ContentModal');

  //             let dbRowData = response.data;
  //             this.contentDetail.content_title    = dbRowData.content_title;
  //             this.contentDetail.content_detail   = dbRowData.content_detail;
  //             this.contentForm.patchValue({
  //               'content_title' :    this.contentDetail.content_title,
  //               'content_detail':    this.contentDetail.content_detail
  //             });
  //           }
  //         });
  //     }
  //   } else {
  //     this.alertService.show_alert('Required params are missing!');
  //   }
  // }

  // onSubmitContentForm(){
  //   if (this.contentForm.valid) {
  //     let postData = new FormData();
  //     postData.append('token',          this.commonService.getUserData('token'));
  //     postData.append('row_id',         this.contentDetail.row_id);
  //     postData.append('lang_code',      this.contentDetail.lang_code);
  //     postData.append('content_type',   this.contentDetail.content_type);
  //     postData.append('action',         this.contentDetail.action);
  //     postData.append('content_title',  this.contentForm.value.content_title);
  //     postData.append('content_detail', this.contentForm.value.content_detail);

  //     this.contentFormAction = true;
  //     this.apiService.languageContent_post(postData)
  //       .subscribe(
  //         (response: any) => {
  //           if (response.status) {
  //             this.modalService.close_modal('#ContentModal');
  //             this.alertService.show_alert(response.message);
  //             this.getLanguages();
  //           }
  //           this.contentFormAction = false;
  //         },
  //         (error) => {
  //           this.contentFormAction = false;
  //         },
  //         () => {
  //           this.contentFormAction = false;
  //         }
  //       );
  //   }
  // }

  // pageChanged(p:number) {
  //   this.currentPage = p;
  //   this.getLanguages();
  // }

  // setRemoveRowData(item_key:string, item_id:any, content_type:string, row_index:any){
  //   if(item_id &&  content_type && content_type.length > 0 ){
  //     this.removeRowData.item_key      =  item_key;
  //     this.removeRowData.item_id       =  item_id;
  //     this.removeRowData.content_type  =  content_type;
  //     this.removeRowData.row_index     =  row_index;
  //   }
  // }

  // processRemoveRowData(){
  //   this.apiService.remove_row_delete(this.removeRowData.item_key, this.removeRowData.item_id, this.removeRowData.content_type).subscribe(
	// 		(response: any) => {
	// 			if (response.status) {
  //         this.alertService.show_alert(response.message);
  //         this.languagesData.splice(this.removeRowData.row_index, 1);
  //         this.removeRowData.item_id       =  null;
  //         this.removeRowData.content_type  =  null;
  //         this.removeRowData.row_index     =  null;
	// 			} else {
	// 				this.alertService.show_alert(response.message, '', 'error');
	// 			}
	// 		}
	// 	);

  // }

}
