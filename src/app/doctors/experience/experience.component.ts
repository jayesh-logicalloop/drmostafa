import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

import { CommonService } from '../../services/common.service';
import { ExperiencesService } from '../../services/experiences.service';
import { AlertService } from '../../services/alert.service';
import { ModalService } from '../../services/modal.service';

import { iUserExperiences } from '../../services/interface/i-user-experience';

@Component({
  selector: 'app-experience',
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ExperienceComponent implements OnInit {
  userType = '';
  user_id = '';

  dataLoader = false;
  total:number;
  experiences:iUserExperiences[] = [];
  id = '';
  index:number;
  months = [];
  years = [];

  addExperienceForm: FormGroup;
  @ViewChild('ngaddexpform', {static: false}) ngaddexpform: NgForm;
  updateExperienceForm: FormGroup;
  @ViewChild('ngupdateexpform', {static: false}) ngupdateexpform: NgForm;
  experienceFormLoader = false;

  constructor(
	private translate: TranslateService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private experiencesService: ExperiencesService,
    private modalService: ModalService,
    private alertService: AlertService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.months = this.commonService.months();
    this.years = this.commonService.years();

    this.addExperienceForm = this.formBuilder.group({
      organization: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      designation: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      description: ['', [
        Validators.maxLength(1000)
      ]],
      currently_working: ['No', [
        Validators.required
      ]],
      start_month: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(2)
      ]],
      start_year: ['', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(4)
      ]],
      end_month: ['', [
        Validators.minLength(1),
        Validators.maxLength(2)
      ]],
      end_year: ['', [
        Validators.minLength(4),
        Validators.maxLength(4)
      ]]
    });

    this.updateExperienceForm = this.formBuilder.group({
      organization: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      designation: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      description: ['', [
        Validators.maxLength(1000)
      ]],
      currently_working: ['No', [
        Validators.required
      ]],
      start_year: ['', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(4)
      ]],
      start_month: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(2)
      ]],
      end_year: ['', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(4)
      ]],
      end_month: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(2)
      ]]
    })
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
      this.getUserExperiences();
    });

    this.addExperienceForm.get('currently_working').valueChanges.subscribe(value => {
      if(value == 'Yes') {
        this.addExperienceForm.get('end_year').clearValidators();
        this.addExperienceForm.get('end_month').clearValidators();
      } else {
        this.addExperienceForm.get('end_year').setValidators([Validators.required,Validators.minLength(4),Validators.maxLength(4)]);
        this.addExperienceForm.get('end_month').setValidators([Validators.required]);
      }
      this.addExperienceForm.get('end_year').updateValueAndValidity();
      this.addExperienceForm.get('end_month').updateValueAndValidity();
    });
  }

  getUserExperiences() {
    this.dataLoader = true;
    let params = {};
    if(this.userType != 'Doctor') {
      params['user_id'] = this.user_id;
    }
    this.experiencesService.get(params).subscribe(
      (response:any) => {
        if(response.status) {
          this.experiences = response.data;
          this.total = this.experiences.length;
        } else {
          this.total = 0;
        }
        this.dataLoader = false;
      },
      (error) => { this.dataLoader = false; }
    );
  }

  openAddExperienceFormModal() {
    this.ngaddexpform.resetForm();
    this.addExperienceForm.patchValue({
      currently_working: 'No',
      start_year: '',
      start_month: '',
      end_year: '',
      end_month: ''
    });
    this.modalService.open_modal('#addExperienceModal');
  }

  onSubmitAddExperienceForm() {
    if (this.addExperienceForm.valid) {
      let formData = new FormData();
      formData.append('token', this.commonService.getUserData('token'));
      formData.append('designation', this.addExperienceForm.value.designation);
      formData.append('organization', this.addExperienceForm.value.organization);
      formData.append('currently_working', this.addExperienceForm.value.currently_working);
      formData.append('start_year', this.addExperienceForm.value.start_year);
      formData.append('start_month', this.addExperienceForm.value.start_month);
      formData.append('end_year', this.addExperienceForm.value.end_year);
      formData.append('end_month', this.addExperienceForm.value.end_month);
      formData.append('description', this.addExperienceForm.value.description);
      if(this.userType != 'Doctor') {
        formData.append('user_id', this.user_id);
      }
      this.experienceFormLoader = true;
      this.experiencesService.create(formData).subscribe(
        (response: any) => {
          if (response.status) {
            this.alertService.show_alert(response.message);
            this.createUpdateItem('create', this.addExperienceForm, response.data);
            this.modalService.close_modal('#addExperienceModal');
          }
          this.experienceFormLoader = false;
        },
        (error) => { this.experienceFormLoader = false; }
      );
    }
  }

  openUpdateExperienceFormModal(id:string, i:number) {
    this.id = id;
    this.index = i;
    this.updateExperienceForm.patchValue({
      designation: this.experiences[i].designation,
      organization: this.experiences[i].organization,
      currently_working: this.experiences[i].currently_working,
      start_year: this.experiences[i].start_year,
      start_month: this.experiences[i].start_month,
      end_year: this.experiences[i].end_year,
      end_month: this.experiences[i].end_month,
      description: this.experiences[i].description
    });
    this.modalService.open_modal('#updateExperienceModal');
  }

  onSubmitUpdateExperienceForm() {
    if (this.updateExperienceForm.valid) {
      let formData = {
        token: this.commonService.getUserData('token'),
        id: this.id,
        designation: this.updateExperienceForm.value.designation,
        organization: this.updateExperienceForm.value.organization,
        currently_working: this.updateExperienceForm.value.currently_working,
        start_year: this.updateExperienceForm.value.start_year,
        start_month: this.updateExperienceForm.value.start_month,
        end_year: this.updateExperienceForm.value.end_year,
        end_month: this.updateExperienceForm.value.end_month,
        description: this.updateExperienceForm.value.description,
      }
      if(this.userType != 'Doctor') {
        formData['user_id'] = this.user_id;
      }
      this.experienceFormLoader = true;
      this.experiencesService.update(formData).subscribe(
        (response: any) => {
          if (response.status) {
            this.alertService.show_alert(response.message);
            this.createUpdateItem('update', this.updateExperienceForm);
            this.modalService.close_modal("#updateExperienceModal");
          }
          this.experienceFormLoader = false;
        },
        (error) => { this.experienceFormLoader = false; }
      );
    }
  }

  onDeleteExperience(id:string, i:number) {
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
        this.experiencesService.delete(formData).subscribe(
          (response: any) => {
            if (response.status) {
              this.experiences.splice(i, 1);
              this.total = this.experiences.length;
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
    let start_month_formatted = '';
    let end_month_formatted = '';

    this.months.map(x => {
      if(x.id == formData.value.start_month) {
        start_month_formatted = x.alias;
      }
      if(x.id == formData.value.end_month) {
        end_month_formatted = x.alias;
      }
    });
    if(action == 'create') {
      let item = {
        id: id,
        organization: formData.value.organization,
        designation: formData.value.designation,
        description: formData.value.description,
        currently_working: formData.value.currently_working,
        start_year: formData.value.start_year,
        start_month: formData.value.start_month,
        start_month_formatted: start_month_formatted,
        end_year: formData.value.end_year,
        end_month: formData.value.end_month,
        end_month_formatted: end_month_formatted
      };
      this.experiences.push(item);
    }
    if(action == 'update') {
      this.experiences[this.index].organization = formData.value.organization;
      this.experiences[this.index].designation = formData.value.designation;
      this.experiences[this.index].description = formData.value.description;
      this.experiences[this.index].currently_working = formData.value.currently_working;
      this.experiences[this.index].start_year = formData.value.start_year;
      this.experiences[this.index].start_month = formData.value.start_month;
      this.experiences[this.index].start_month_formatted = start_month_formatted;
      this.experiences[this.index].end_year = formData.value.end_year;
      this.experiences[this.index].end_month = formData.value.end_month;
      this.experiences[this.index].end_month_formatted = end_month_formatted;
    }
    this.total = this.experiences.length;
  }

}
