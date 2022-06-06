import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, NgForm, FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../services/api.service';
import { CommonService } from '../../services/common.service';
import { FaqService } from '../../services/faq.service';
import { ModalService } from '../../services/modal.service';
import { AlertService } from '../../services/alert.service';


@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class FaqComponent implements OnInit {
  userType = '';
  dataLoader = false;
  faqs = [];
  id = '';
  index:number;

  @ViewChild('ngaddform', { static: false }) ngaddform: NgForm;
  addForm: FormGroup;
  addFormLoader = false;

  @ViewChild('ngupdateform', { static: false }) ngupdateform: NgForm;
  updateForm: FormGroup;
  updateFormLoader = false;

  constructor(
	private translate: TranslateService,
    private formBuilder: FormBuilder,
    private title: Title,
    private faqService: FaqService,
    private apiService: ApiService,
    private commonService: CommonService,
    private modalService: ModalService,
    private alertService: AlertService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('FAQ');
    this.apiService.currentUserData.subscribe(
      (userData: any) => {
        this.userType = (userData.group_name) ? userData.group_name : this.commonService.getUserData('group_name');
        /* const allowedUserTypes = ['Super Admin'];
        if (!allowedUserTypes.includes(this.userType)) {
          this.commonService.userDefaultRoute();
        } */
      }
    );
    this.getfaq();
    this.addForm = this.formBuilder.group({
      faq: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(200)
      ]],
      faq_answer: ['', [
        Validators.required,
      ]],
      page: [''],
      sort_order: [''],
      status: ['Active', [
        Validators.required
      ]]
    });
    this.updateForm = this.formBuilder.group({
      faq: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(200)
      ]],
      faq_answer: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(1000)
      ]],
      page: [''],
      sort_order: [''],
      status: ['Active', [
          Validators.required
      ]]
    });
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
  }

  getfaq(id='') {
    this.faqService.faq_get(id).subscribe(
      (response: any) => {
        if (response.status) {
          this.faqs = response.data;
        }
      }
    )
  }

  onManageCrud(item_id: string, action: string, index: number=null) {
    //console.log(item_id, action, index);
    this.index = index;
    this.id = item_id;
    if (action == 'Create') {
      this.ngaddform.resetForm();
      this.addForm.patchValue({
        'status': 'Active'
      });
      this.modalService.open_modal('#CrudModal');
    }

    if (action == 'Update' && item_id) {
      let faq = this.faqs[index];
      this.updateForm.patchValue({
        faq: faq.faq,
        faq_answer: faq.faq_answer,
        sort_order: faq.sort_order,
        status: faq.status
      });
      this.modalService.open_modal('#CrudModalUpdate');
    }
  }

  onSubmitCrudForm() {
    if (this.addForm.valid) {
      let postData = new FormData();
      postData.append('token', this.commonService.getUserData('token'));
      postData.append('faq', this.addForm.value.faq);
      postData.append('faq_answer', this.addForm.value.faq_answer);
      postData.append('sort_order', this.addForm.value.sort_order);
      postData.append('status', this.addForm.value.status);
      this.addFormLoader = true;
      this.faqService.faq_post(postData).subscribe(
        (response: any) => {
          if (response.status) {
            this.modalService.close_modal('#CrudModal');
            this.alertService.show_alert(response.message);
            this.getfaq();
          }
          this.addFormLoader = false;
        },
        (error) => {this.addFormLoader = false;},
        () => {this.addFormLoader = false;}
      );
    }
  }

  onSubmitCrudUpdateForm() {
    if (this.updateForm.valid) {
      let postData = {
        'token':this.commonService.getUserData('token'),
        'faq':this.updateForm.value.faq,
        'faq_answer':this.updateForm.value.faq_answer,
        'sort_order':this.updateForm.value.sort_order,
        'status':this.updateForm.value.status
      }
      this.updateFormLoader = true;
      this.faqService.faq_update(this.id, postData).subscribe(
        (response: any) => {
          if (response.status) {
            this.modalService.close_modal('#CrudModalUpdate');
            this.alertService.show_alert(response.message);
            this.faqs[this.index]['faq'] = this.updateForm.value.faq;
            this.faqs[this.index]['faq_answer'] = this.updateForm.value.faq_answer;
            this.faqs[this.index]['sort_order'] = this.updateForm.value.sort_order;
            this.faqs[this.index]['status'] = this.updateForm.value.status;
          }
          this.updateFormLoader = false;
        },
        (error) => {this.updateFormLoader = false;},
        () => {this.updateFormLoader = false;}
      );
    }
  }

  deleteFAQ(id:string) {
    Swal.fire({
      title: 'Delete',
      text: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        this.dataLoader = true;
        this.faqService.faq_delete(id).subscribe(
          (response: any) => {
            if (response.status) {
              this.alertService.show_alert(response.message);
              this.getfaq();
            }
            this.dataLoader = false;
          },
          (error) => { this.dataLoader = false; },
          () => { this.dataLoader = false; }
        )
      }
    });
  }

}
