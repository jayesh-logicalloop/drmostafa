import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { ApiService } from '../../services/api.service';
import { CommonService } from '../../services/common.service';
import { DiseaseService } from '../../services/disease.service';
import { ModalService } from '../../services/modal.service';
import { AlertService } from '../../services/alert.service';


@Component({
  selector: 'app-diseases',
  templateUrl: './diseases.component.html',
  styleUrls: ['./diseases.component.css']
})
export class DiseasesComponent implements OnInit {
  userType = '';
  dataLoader = false;
  currentPage = 1;
  itemsPerPage = 10;
  totalItems: number;

  index:number;
  disease_id = '';
  diseases = [];

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
    private diseaseService: DiseaseService,
    private modalService: ModalService,
    private alertService: AlertService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Disease');

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
    this.total_diseases_get();
    this.addForm = this.formBuilder.group({
      disease: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      status: ['Active', [
        Validators.required
      ]]
    });
    this.updateForm = this.formBuilder.group({
      disease: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      status: ['', [
        Validators.required
      ]]
    });
  }

  total_diseases_get() {
    this.diseaseService.total().subscribe(
      (response: any) => {
        this.totalItems = response.data;
        if (this.totalItems > 0) {
          this.diseases_get();
        }
      }
    );
  }

  diseases_get(id='') {
    this.dataLoader = true;
    this.diseaseService.get(id, {limit: this.itemsPerPage, page: this.currentPage}).subscribe(
      (response: any) => {
        this.diseases = response.data;
        this.dataLoader = false;
      }, (error) => {this.dataLoader = false;}
    )
  }

  openAddForm() {
    this.ngaddform.resetForm();
    this.addForm.patchValue({
      disease: '',
      status: 'Active',
    });
    this.modalService.open_modal('#addFormModal');
  }

  onSubmitAddForm() {
    if (this.addForm.valid) {
      let postData = new FormData();
      postData.append("token", this.commonService.getUserData("token"));
      postData.append("disease", this.addForm.value.disease);
      postData.append("status", this.addForm.value.status);
      this.addFormLoader = true;
      this.diseaseService.post(postData).subscribe(
        (response: any) => {
          if (response.status) {
            this.alertService.show_alert(response.message);
            this.modalService.close_modal("#addFormModal");
            this.diseases_get();
          }
          this.addFormLoader = false;
        },
        (error) => {
          this.addFormLoader = false;
        }
      );
    }
  }

  onEditItem(id:string, i:number) {
    this.disease_id = id;
    this.index = i;
    let item = this.diseases[i];
    this.updateForm.patchValue({
      disease: item.disease,
      status: item.status,
    })
    this.modalService.open_modal('#updateFormModal');
  }

  onSubmitupdateForm() {
    if (this.updateForm.valid) {
      let postData = {
        token: this.commonService.getUserData("token"),
        disease: this.updateForm.value.disease,
        status: this.updateForm.value.status
      }
      this.updateFormLoader = true;
      this.diseaseService.put(this.disease_id, postData).subscribe(
        (response: any) => {
          if (response.status) {
            this.alertService.show_alert(response.message);
            this.modalService.close_modal('#updateFormModal');
            this.diseases[this.index]['disease'] = this.updateForm.value.disease;
            this.diseases[this.index]['status'] = this.updateForm.value.status;
          }
          this.updateFormLoader = false;
        },
        (error) => {
          this.updateFormLoader = false;
        }
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
        this.diseaseService.delete(id).subscribe(
          (response: any) => {
            if (response.status) {
              this.alertService.show_alert(response.message);
              this.diseases.splice(i, 1);
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
    this.diseases_get();
  }

}


