import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

import { CommonService } from '../../services/common.service';
import { UserDocumentsService } from '../../services/user-documents.service';
import { AlertService } from '../../services/alert.service';
import { ModalService } from '../../services/modal.service';

import { iRequiredDocs } from '../../services/interface/i-required-docs';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DocumentsComponent implements OnInit {
  userType = '';
  user_id = '';

  documentFormLoader = false;
  requiredDocs:iRequiredDocs[];

  rejectDocumentFormLoader = false;
  rejectDocumentForm: FormGroup;
  @ViewChild('ngrejectdocumentform', {static: false}) ngrejectdocumentform: NgForm;

  constructor(
	private translate: TranslateService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private userDocumentsService: UserDocumentsService,
    private alertService: AlertService,
    private modalService: ModalService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);

  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.rejectDocumentForm = this.formBuilder.group({
      reason: ['', [
        Validators.required,
        Validators.maxLength(200)
      ]]
    });

    this.userType = this.commonService.getUserData('group_name');
    /* const allowedUserTypes = ['Clinic', 'Doctor', 'Super Admin'];
    if (!allowedUserTypes.includes(this.userType)) {
      this.commonService.userDefaultRoute();
    } */

    this.activatedRoute.params.subscribe(routeParams => {
      if(this.userType != 'Doctor') {
        this.user_id = routeParams.user_id ? routeParams.user_id : '';
      }
      this.getRequiredDocs();
    });
  }

  getRequiredDocs() {
    this.documentFormLoader = true;
    let params = {type:'doctor'};
    if(this.userType != 'Doctor') {
      params['user_id'] = this.user_id;
    }
    this.userDocumentsService.get(params).subscribe(
      (response:any) => {
        this.requiredDocs = response;
        this.documentFormLoader = false;
      },
      (error) => { this.documentFormLoader = false; }
    );
  }

  onChangeDocument(files: any, key:string) {
    if (files.target.files && files.target.files[0]) {
      const allowed_max_size = 20 * 1024 * 1024; //20 MB
      const allowed_types = ['image/png', 'image/jpeg', 'image/jpg'];
      const allowed_max_height = 2000;
      const allowed_max_width = 2000;

      let file = files.target.files[0];

      if (!allowed_types.includes(file.type)) {
        this.alertService.showValidationErrors('Only JPG or PNG files allowed');
        return false;
      }

      if (file.size > allowed_max_size) {
        this.alertService.showValidationErrors('Maximum size allowed is 20 MB');
        return false;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const provider_image = new Image();
        provider_image.src = e.target.result;
        provider_image.onload = rs => {
          const img_height = rs.currentTarget['height'];
          const img_width = rs.currentTarget['width'];

          if (img_height > allowed_max_height && img_width > allowed_max_width) {
            //this.alertService.showValidationErrors('Maximum dimentions allowed ' + allowed_max_height + '*' + allowed_max_width + 'px');
            //return false;
          }

          let formData = new FormData();
          formData.append('token', this.commonService.getUserData('token'));
          if(this.userType != 'Doctor') {
            formData.append('user_id', this.user_id);
          }
          formData.append('type', 'Doctor');
          formData.append('title', key);
          formData.append('document_file', file);
          this.documentFormLoader = true;
          this.userDocumentsService.create_update(formData).subscribe(
            (response: any) => {
              if (response.status) {
                this.getRequiredDocs();
              }
              this.documentFormLoader = false;
            },
            (error) => { this.documentFormLoader = false; }
          );
        };
      };
      reader.readAsDataURL(files.target.files[0]);
    }
  }

  deleteDocument(document_id:string) {
    Swal.fire({
      title: 'Delete',
      text: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        let formData = {
          document_id: document_id
        }
        if(this.userType != 'Doctor') {
          formData['user_id'] = this.user_id;
        }
        this.documentFormLoader = true;
        this.userDocumentsService.delete(formData).subscribe(
          (response: any) => {
            if (response.status) {
              this.getRequiredDocs();
              this.alertService.show_alert(response.message);
            }
            this.documentFormLoader = false;
          },
          (error) => { this.documentFormLoader = false; }
        )
      }
    });
  }

  document_id='';
  verification_status='';
  updateVerification(document_id:string, verification_status:string) {
    this.document_id = document_id;
    this.verification_status = verification_status;

    if(verification_status == 'Rejected') {
      this.ngrejectdocumentform.resetForm();
      this.modalService.open_modal('#rejectDocumentFormModal');
      return false;
    }

    Swal.fire({
      title: 'Mark this document as verified',
      text: 'Are you sure?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        let formData = {
          token: this.commonService.getUserData('token'),
          document_id: document_id,
          verification_status: 'Verified'
        }
        this.documentFormLoader = true;
        this.userDocumentsService.update_verification(formData).subscribe(
          (response: any) => {
            if (response.status) {
              this.getRequiredDocs();
              this.alertService.show_alert(response.message);
            }
            this.documentFormLoader = false;
          },
          (error) => { this.documentFormLoader = false; }
        )
      }
    });
  }

  submitRejectDocumentForm() {
    let formData = {
      token: this.commonService.getUserData('token'),
      document_id: this.document_id,
      verification_status: this.verification_status,
      reason: this.rejectDocumentForm.value.reason
    }
    this.rejectDocumentFormLoader = true;
    this.userDocumentsService.update_verification(formData).subscribe(
      (response: any) => {
        if (response.status) {
          this.getRequiredDocs();
          this.modalService.close_modal('#rejectDocumentFormModal');
          this.alertService.show_alert(response.message);
        }
        this.rejectDocumentFormLoader = false;
      },
      (error) => { this.rejectDocumentFormLoader = false; }
    )
  }

}
