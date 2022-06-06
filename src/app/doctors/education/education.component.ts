import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

import { CommonService } from '../../services/common.service';
import { UserEducationService } from '../../services/user-education.service';
import { AlertService } from '../../services/alert.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-education',
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class EducationComponent implements OnInit {
  userType = '';
  user_id = '';

  dataLoader = false;
  total:number;
  userEducationData = [];
  id = '';
  index:number;
  years = [];

  addEducationForm: FormGroup;
  @ViewChild('ngaddeduform', {static: false}) ngaddeduform: NgForm;
  updateEducationForm: FormGroup;
  @ViewChild('ngupdateeduform', {static: false}) ngupdateeduform: NgForm;
  educationFormLoader = false;

  constructor(
	private translate: TranslateService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private userEducationService: UserEducationService,
    private modalService: ModalService,
    private alertService: AlertService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.years = this.commonService.years();

    this.addEducationForm = this.formBuilder.group({
      degree: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(200)
      ]],
      university: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(200)
      ]],
      year: ['', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(4)
      ]],
    });

    this.updateEducationForm = this.formBuilder.group({
      degree: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(200)
      ]],
      university: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(200)
      ]],
      year: ['', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(4)
      ]],
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
      this.getUserEducations();
    });
  }

  getUserEducations() {
    this.dataLoader = true;
    let params = {};
    if(this.userType != 'Doctor') {
      params['user_id'] = this.user_id;
    }
    this.userEducationService.get(params).subscribe(
      (response:any) => {
        if(response.status) {
          this.userEducationData = response.data;
          this.total = this.userEducationData.length;
        } else {
          this.total = 0;
        }
        this.dataLoader = false;
      },
      (error) => { this.dataLoader = false; }
    )
  }

  openAddEducationFormModal() {
    this.ngaddeduform.resetForm();
    this.addEducationForm.patchValue({
      degree: '',
      university: '',
      year: ''
    });
    this.modalService.open_modal('#addEducationModal');
  }

  onSubmitAddEducationForm() {
    if (this.addEducationForm.valid) {
      let formData = new FormData();
      formData.append('token', this.commonService.getUserData('token'));
      formData.append('degree', this.addEducationForm.value.degree);
      formData.append('university', this.addEducationForm.value.university);
      formData.append('year', this.addEducationForm.value.year);
      if(this.userType != 'Doctor') {
        formData.append('user_id', this.user_id);
      }
      this.educationFormLoader = true;
      this.userEducationService.create(formData).subscribe(
        (response: any) => {
          if (response.status) {
            this.alertService.show_alert(response.message);
            this.createUpdateItem('create', this.addEducationForm, response.data);
            this.modalService.close_modal("#addEducationModal");
          }
          this.educationFormLoader = false;
        },
        (error) => { this.educationFormLoader = false; }
      );
    }
  }

  openUpdateEducationModal(id:string, i:number) {
    this.id = id;
    this.index = i;
    this.updateEducationForm.patchValue({
      degree: this.userEducationData[i].degree,
      university: this.userEducationData[i].university,
      year: this.userEducationData[i].year
    });
    this.modalService.open_modal('#updateEducationModal');
  }

  onSubmitUpdateEducationForm() {
    if (this.updateEducationForm.valid) {
      let formData = {
        token: this.commonService.getUserData('token'),
        id: this.id,
        degree: this.updateEducationForm.value.degree,
        university: this.updateEducationForm.value.university,
        year: this.updateEducationForm.value.year
      }
      if(this.userType != 'Doctor') {
        formData['user_id'] = this.user_id;
      }
      this.educationFormLoader = true;
      this.userEducationService.update(formData).subscribe(
        (response: any) => {
          if (response.status) {
            this.alertService.show_alert(response.message);
            this.createUpdateItem('update', this.updateEducationForm);
            this.modalService.close_modal('#updateEducationModal');
          }
          this.educationFormLoader = false;
        },
        (error) => {
          this.educationFormLoader = false;
        }
      );
    }
  }

  onDeleteEducation(id:string, i:number) {
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
          id: id
        }
        if(this.userType != 'Doctor') {
          formData['user_id'] = this.user_id;
        }
        this.dataLoader = true;
        this.userEducationService.delete(formData).subscribe(
          (response: any) => {
            if (response.status) {
              this.userEducationData.splice(i, 1);
              this.total = this.userEducationData.length;
              this.alertService.show_alert(response.message);
            }
            this.dataLoader = false;
          },
          (error) => { this.dataLoader = false; }
        )
      }
    });
  }

  createUpdateItem(action:string, formData:FormGroup, id='') {
    if(action == 'create') {
      let item = {
        id: id,
        degree: formData.value.degree,
        university: formData.value.university,
        year: formData.value.year
      };
      this.userEducationData.push(item);
    }
    if(action == 'update') {
      this.userEducationData[this.index].degree = formData.value.degree;
      this.userEducationData[this.index].university = formData.value.university;
      this.userEducationData[this.index].year = formData.value.year;
    }
    this.total = this.userEducationData.length;
  }

}
