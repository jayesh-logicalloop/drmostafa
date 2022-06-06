import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../services/api.service';
import { CommonService } from '../../services/common.service';
import { SymptomsService } from '../../services/symptoms.service';
import { DiseaseService } from '../../services/disease.service';
import { ModalService } from '../../services/modal.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-symptoms',
  templateUrl: './symptoms.component.html',
  styleUrls: ['./symptoms.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SymptomsComponent implements OnInit {
  userType = '';
  dataLoader = false;
  currentPage = 1;
  itemsPerPage = 10;
  totalItems: number;

  symptoms = [];
  symptomDiseases = [];
  allDiseases = [];
  symptom_id = '';

  @ViewChild('ngaddform', { static: false }) ngaddform: NgForm;
  addForm: FormGroup;
  addFormLoader = false;

  @ViewChild('ngupdateform', { static: false }) ngupdateform: NgForm;
  updateForm: FormGroup;
  updateFormLoader = false;

  constructor(
	private translate: TranslateService,
    private title: Title,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private commonService: CommonService,
    private symptomsService: SymptomsService,
    private diseaseService: DiseaseService,
    private modalService: ModalService,
    private alertService: AlertService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Symptoms');
    this.apiService.currentUserData.subscribe(
      (userData: any) => {
        this.userType = (userData.group_name) ? userData.group_name : this.commonService.getUserData('group_name');
        /* const allowedUserTypes = ['Super Admin'];
        if (!allowedUserTypes.includes(this.userType)) {
          this.commonService.userDefaultRoute();
        } */
      }
    );

    this.addForm = this.formBuilder.group({
      symptom: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      status: ['Active', [
        Validators.required
      ]],
      diseases: [''],
      disease: [''],
      level: ['']
    });
    this.updateForm = this.formBuilder.group({
      symptom: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      status: ['', [
        Validators.required
      ]],
      diseases: [],
      disease: [''],
      level: ['']
    });
    this.getDiseases();
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.total_symptoms_get();
  }

  getDiseases() {
    this.diseaseService.get().subscribe(
      (response: any) => {
        this.allDiseases = response.data;
      }
    )
  }

  total_symptoms_get() {
    this.symptomsService.total().subscribe(
      (response: any) => {
        this.totalItems = response.data;
        if (this.totalItems > 0) {
          this.symptoms_get();
        }
      }
    );
  }

  symptoms_get(id='') {
    this.dataLoader = true;
    this.symptomsService.get(id, {limit: this.itemsPerPage, page: this.currentPage}).subscribe(
      (response: any) => {
        this.symptoms = response.data;
        this.dataLoader = false;
      },
      (error) => { this.dataLoader = false;}
    )
  }

  openAddForm() {
    this.ngaddform.resetForm();
    this.addForm.patchValue({
      symptom: '',
      status: 'Active',
      disease: '',
      level: ''
    });
    this.symptomDiseases = [];
    this.modalService.open_modal('#addFormModal');
  }

  addDisease(disease:any, level=0) {
    if (disease == '') {
      this.alertService.show_alert("Select disease", '', 'error');
      return false;
    }

    if (level <= 0) {
      this.alertService.show_alert("Level can not be blank or zero", '', 'error');
      return false;
    }

    if (disease && level) {
      this.symptomDiseases.push({
        disease_id: disease.disease_id,
        disease: disease.disease,
        level: level
      });
      this.addForm.patchValue({disease: '', level: ''});
      this.updateForm.patchValue({disease: '', level: ''});
    }
  }

  removeDisease(i:number) {
    this.symptomDiseases.splice(i, 1);
  }

  onSubmitAddForm() {
    if (this.addForm.valid) {
      let postData = {
        token: this.commonService.getUserData("token"),
        symptom: this.addForm.value.symptom,
        diseases: this.symptomDiseases,
        status: this.addForm.value.status
      };
      this.addFormLoader = true;
      this.symptomsService.post(postData).subscribe(
        (response: any) => {
          if (response.status) {
            this.alertService.show_alert(response.message);
            this.modalService.close_modal("#addFormModal");
            this.symptoms_get();
          }
          this.addFormLoader = false;
        },
        (error) => { this.addFormLoader = false; }
      );
    }
  }

  onEditItem(id='', i:number) {
    this.symptom_id = id;
    let item = this.symptoms[i];
    this.updateForm.patchValue({
      symptom: item.symptom,
      status: item.status,
      disease: '',
      level: ''
    })
    this.symptomDiseases = item.diseases;
    this.modalService.open_modal('#updateFormModal');
  }

  onSubmitupdateForm() {
    if (this.updateForm.valid) {
      let postData = {
        token: this.commonService.getUserData("token"),
        symptom: this.updateForm.value.symptom,
        diseases: this.symptomDiseases,
        status: this.updateForm.value.status
      }
      this.updateFormLoader = true;
      this.symptomsService.put(this.symptom_id, postData).subscribe(
        (response: any) => {
          if (response.status) {
            this.alertService.show_alert(response.message);
            this.modalService.close_modal('#updateFormModal');
            this.symptoms_get();
          }
          this.updateFormLoader = false;
        },
        (error) => { this.updateFormLoader = false; }
      );
    }
  }

  onDeleteItem(id='', i:number) {
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
        this.symptomsService.delete(id).subscribe(
          (response: any) => {
            if (response.status) {
              this.alertService.show_alert(response.message);
              this.symptoms_get();
            }
            this.dataLoader = false;
          },
          (error) => { this.dataLoader = false; }
        )
      }
    });
  }

  pageChanged(p: number) {
    this.currentPage = p;
    this.symptoms_get();
  }

}
