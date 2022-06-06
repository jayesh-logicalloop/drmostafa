import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

import { CommonService } from '../../services/common.service';
import { EmailtemplateService } from '../../services/emailtemplate.service';
import { ModalService } from '../../services/modal.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-email-template',
  templateUrl: './email-template.component.html',
  styleUrls: ['./email-template.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class EmailTemplateComponent implements OnInit {

  editorConfig: any;

  @ViewChild('ngaddform', { static: false }) myForm: NgForm;
  @ViewChild('ngupdateform', { static: false }) ngupdateform: NgForm;
  emailTemplateForm: FormGroup;
  emailTemplateFormLoader = false;

  dataLoader = false;
  templateData = [];
  template_id = '';
  index:number;

  constructor(
	private translate: TranslateService,
    private title: Title,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private emailtemplateService: EmailtemplateService,
    private modalService: ModalService,
    private alertService: AlertService,
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Email Template');

    const userType = this.commonService.getUserData('group_name');
    /* const allowedUserTypes = ['Super Admin', 'Doctor'];
    if (!allowedUserTypes.includes(userType)) {
      this.commonService.userDefaultRoute();
    } */

    this.editorConfig = {
      allowedContent: true,
      removePlugins: ''
    }
    this.emailTemplateForm = this.formBuilder.group({
      template_code: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(200)
      ]],
      instruction: ['', [
        Validators.minLength(2),
        Validators.maxLength(200)
      ]],
      subject: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(200)
      ]],
      body: ['', [
        Validators.required
      ]]
    });
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.getTemplateData();
  }

  openForm() {
    this.emailTemplateForm.reset();
    this.modalService.open_modal('#createEmailTemplate');
  }

  getTemplateData() {
    this.dataLoader = true;
    this.emailtemplateService.get().subscribe(
      (response: any) => {
        if (response.status) {
          this.templateData = response.data;
        }
        this.dataLoader = false;
      }
    )
  }

  onSubmitAddForm() {
    if (this.emailTemplateForm.valid) {
      let postData = new FormData();
      postData.append('token', this.commonService.getUserData('token'));
      postData.append('template_code', this.emailTemplateForm.value.template_code);
      postData.append('instruction', this.emailTemplateForm.value.instruction);
      postData.append('subject', this.emailTemplateForm.value.subject);
      postData.append('body', this.emailTemplateForm.value.body);

      this.emailTemplateFormLoader = true;
      this.emailtemplateService.create(postData).subscribe(
        (response: any) => {
          if (response.status) {
            this.alertService.show_alert(response.message);
            this.getTemplateData();
          }
          this.modalService.close_modal('#createEmailTemplate');
          this.emailTemplateFormLoader = false;
        },
        (error) => { this.emailTemplateFormLoader = false; },
        () => { this.emailTemplateFormLoader = false; }
      );
    }
  }

  onClickEditBtn(template_id:string, index:number) {
    this.index = index;
    this.template_id = template_id;

    this.emailTemplateForm.patchValue({
      'template_code': this.templateData[index].template_code,
      'instruction': this.templateData[index].instruction,
      'subject': this.templateData[index].subject,
      'body': this.templateData[index].body
    });
    this.modalService.open_modal('#updateEmailTemplate');
  }

  onSubmitUpdateForm() {
    if (this.emailTemplateForm.valid) {
      let postData = {
        'token': this.commonService.getUserData('token'),
        'instruction': this.emailTemplateForm.value.instruction,
        'subject': this.emailTemplateForm.value.subject,
        'body': this.emailTemplateForm.value.body
      }
      this.emailTemplateFormLoader = true;
      this.emailtemplateService.update(this.template_id, postData).subscribe(
        (response: any) => {
          if (response.status) {
            this.alertService.show_alert(response.message);
            this.getTemplateData();
          }
          this.modalService.close_modal('#updateEmailTemplate');
          this.emailTemplateFormLoader = false;
        },
        (error) => { this.emailTemplateFormLoader = false; },
        () => { this.emailTemplateFormLoader = false; }
      );
    }
  }

}
