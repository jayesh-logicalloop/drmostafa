import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

import { CommonService } from '../../services/common.service';
import { UserAwardsService } from '../../services/user-awards.service';
import { AlertService } from '../../services/alert.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-awards',
  templateUrl: './awards.component.html',
  styleUrls: ['./awards.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AwardsComponent implements OnInit {
  userType = '';
  user_id = '';

  dataLoader = false;
  total:number;
  userAwardData = [];
  id = '';
  index:number;

  awardFormLoader = false;

  awardFilesInput: File;
  awardFilesB64Src = '';
  image_url = '';
  addAwardForm: FormGroup;
  @ViewChild('ngaddawardfileinput', {static: false}) ngaddawardfileinput: ElementRef;
  @ViewChild('ngupdateawardfileinput', {static: false}) ngupdateawardfileinput: ElementRef;
  @ViewChild('ngaddawardform', {static: false}) ngaddawardform: NgForm;

  updateAwardForm: FormGroup;
  @ViewChild('ngupdateawardform', {static: false}) ngupdateawardform: NgForm;

  constructor(
	private translate: TranslateService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private userAwardsService: UserAwardsService,
    private modalService: ModalService,
    private alertService: AlertService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.addAwardForm = this.formBuilder.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(200)
      ]],
      description: ['', [
        Validators.maxLength(250)
      ]]
    });

    this.updateAwardForm = this.formBuilder.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(200)
      ]],
      description: ['', [
        Validators.maxLength(250)
      ]]
    });
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.userType = this.commonService.getUserData('group_name');
    /* const allowedUserTypes = ['Clinic', 'Doctor', 'Super Admin'];
    if (!allowedUserTypes.includes(this.userType)) {
      this.commonService.userDefaultRoute();
    } */

    this.activatedRoute.params.subscribe(routeParams => {
      if(this.userType != 'Doctor') {
        this.user_id = routeParams.user_id ? routeParams.user_id : '';
      }
      this.getUserAwards();
    });
  }

  getUserAwards() {
    this.dataLoader = true;
    let params = {};
    if(this.userType != 'Doctor') {
      params['user_id'] = this.user_id;
    }
    this.userAwardsService.get(params).subscribe(
      (response:any) => {
        if(response.status) {
          this.userAwardData = response.data;
          this.total = this.userAwardData.length;
        } else {
          this.total = 0;
        }
        this.dataLoader = false;
      },
      (error) => { this.dataLoader = false; }
    )
  }

  openAddAwardFormModal() {
    this.ngaddawardform.resetForm();
    this.addAwardForm.patchValue({
      name: '',
      description: ''
    });
    this.awardFilesInput = null;
    this.awardFilesB64Src = '';
    this.ngaddawardfileinput.nativeElement.value = '';
    this.modalService.open_modal('#addAwardModal');
  }

  onSubmitAddAwardForm() {
    if (this.addAwardForm.valid) {
      let formData = new FormData();
      formData.append('token', this.commonService.getUserData('token'));
      formData.append('name', this.addAwardForm.value.name);
      if (this.awardFilesInput) {
        formData.append("image", this.awardFilesInput);
      }
      formData.append('description', this.addAwardForm.value.description);
      if(this.userType != 'Doctor') {
        formData.append('user_id', this.user_id);
      }
      this.awardFormLoader = true;
      this.userAwardsService.create(formData).subscribe(
        (response: any) => {
          if (response.status) {
            this.alertService.show_alert(response.message);
            this.getUserAwards();
            this.modalService.close_modal("#addAwardModal");
          }
          this.awardFormLoader = false;
        },
        (error) => { this.awardFormLoader = false; }
      );
    }
  }

  openUpdateAwardModal(id:string, i:number) {
    this.id = id;
    this.index = i;
    this.updateAwardForm.patchValue({
      name: this.userAwardData[i].name,
      description: this.userAwardData[i].description
    });
    this.image_url = this.userAwardData[i].image ? this.userAwardData[i].image_url : '';
    this.awardFilesInput = null;
    this.awardFilesB64Src = '';
    this.ngupdateawardfileinput.nativeElement.value = '';
    this.modalService.open_modal('#updateAwardModal');
  }

  onSubmitUpdateAwardForm() {
    if (this.updateAwardForm.valid) {
      let formData = new FormData();
      formData.append('token', this.commonService.getUserData('token'));
      formData.append('award_id', this.id);
      formData.append('name', this.updateAwardForm.value.name);
      if (this.awardFilesInput) {
        formData.append("image", this.awardFilesInput);
      }
      formData.append('description', this.updateAwardForm.value.description);
      if(this.userType != 'Doctor') {
        formData.append('user_id', this.user_id);
      }
      this.awardFormLoader = true;
      this.userAwardsService.update(formData).subscribe(
        (response: any) => {
          if (response.status) {
            this.alertService.show_alert(response.message);
            this.getUserAwards();
            this.modalService.close_modal('#updateAwardModal');
          }
          this.awardFormLoader = false;
        },
        (error) => {
          this.awardFormLoader = false;
        }
      );
    }
  }

  onDeleteAward(id:string, i:number) {
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
          token: this.commonService.getUserData('token'),
          award_id: id
        }
        if(this.userType != 'Doctor') {
          formData['user_id'] = this.user_id;
        }
        this.dataLoader = true;
        this.userAwardsService.delete(formData).subscribe(
          (response: any) => {
            if (response.status) {
              this.userAwardData.splice(i, 1);
              this.total = this.userAwardData.length;
              this.alertService.show_alert(response.message);
            }
            this.dataLoader = false;
          },
          (error) => { this.dataLoader = false; }
        )
      }
    });
  }

  onChangeAwardImage(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      const allowedMaSize = 2 * 1024 *1024;
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];

      let file = fileInput.target.files[0];

      if (!allowedTypes.includes(file.type)) {
        this.alertService.showValidationErrors("Only JPG or PNG files allowed");
        return false;
      }

      if (file.size > allowedMaSize) {
        this.alertService.showValidationErrors("File size should not be greater than 2 MB");
        return false;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.awardFilesB64Src = e.target.result;
        this.awardFilesInput = file;
      };
      reader.readAsDataURL(file);
      this.ngaddawardfileinput.nativeElement.value = '';
      this.ngupdateawardfileinput.nativeElement.value = '';
    }
  }

  removeFile() {
    this.awardFilesB64Src = '';
    this.awardFilesInput = null;
    this.ngaddawardfileinput.nativeElement.value = '';
    this.ngupdateawardfileinput.nativeElement.value = '';
  }

  deleteImage() {
    let formData = {
      token: this.commonService.getUserData('token'),
      award_id: this.id
    }
    if(this.userType != 'Doctor') {
      formData['user_id'] = this.user_id;
    }
    this.awardFormLoader = true;
    this.userAwardsService.delete_image(formData).subscribe(
      (response: any) => {
        if (response.status) {
          this.getUserAwards();
          this.alertService.show_alert(response.message);
        }
        this.awardFormLoader = false;
      },
      (error) => { this.awardFormLoader = false; }
    );
  }

}
