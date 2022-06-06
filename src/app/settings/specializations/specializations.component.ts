import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { fromEvent } from 'rxjs';
import { debounceTime, map } from "rxjs/operators";
import { TranslateService } from '@ngx-translate/core';

import { ApiService } from '../../services/api.service';
import { CommonService } from '../../services/common.service';
import { SpecializationService } from '../../services/specialization.service';
import { DiseaseService } from '../../services/disease.service';
import { ModalService } from '../../services/modal.service';
import { AlertService } from '../../services/alert.service';
import { Select2OptionData } from 'ng-Select2';
import { Options } from 'select2';

@Component({
  selector: 'app-specializations',
  templateUrl: './specializations.component.html',
  styleUrls: ['./specializations.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SpecializationsComponent implements OnInit {
  userType = '';

  currentPage = 1;
  itemsPerPage = 5;
  totalItems: number;

  @ViewChild('ngsearchinput', { static: false }) ngsearchinput: ElementRef;
  search = '';

  specialization_id='';
  dataLoader = false;
  specializations = [];
  allParentSpecializations = [];

  @ViewChild('ngspecializationaddupdateform', {static: false}) ngspecializationaddupdateform: NgForm;
  specializationAddUpdateForm: FormGroup;
  specializationAddUpdateFormLoader = false;

  @ViewChild('ngspecializationimageinput', {static: false}) ngspecializationimageinput: ElementRef;
  specializationImageSrc = '';
  specializationImageFileInput: File;

  public select2Data: Array<Select2OptionData>;
  public select2Options: Options = {width: '100%', multiple: true, tags: false};

  constructor(
	private translate: TranslateService,
    private title: Title,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private commonService: CommonService,
    private specializationService: SpecializationService,
    private diseaseService: DiseaseService,
    private modalService: ModalService,
    private alertService: AlertService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Specializations');
    this.apiService.currentUserData.subscribe(
      (userData: any) => {
        this.userType = (userData.group_name) ? userData.group_name : this.commonService.getUserData('group_name');
        /* const allowedUserTypes = ['Super Admin'];
        if (!allowedUserTypes.includes(this.userType)) {
          this.commonService.userDefaultRoute();
        } */
      }
    );

    this.specializationAddUpdateForm = this.formBuilder.group({
      parent_id: ['0', []],
      specialization_name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      status: ['Active', [
        Validators.required
      ]],
      diseases: ['']
    });

    this.diseasesSelect2();
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.getTotalSpecializations();
    this.getParentSpecializations()
  }

  ngAfterViewInit(): void {
    fromEvent(this.ngsearchinput.nativeElement, 'keyup').pipe(
      map((event: any) => { return event.target.value; }), debounceTime(1000)
    ).subscribe((text: string) => {
      this.search = text;
      this.currentPage = 1;
      this.getTotalSpecializations();
    });
  }

  diseasesSelect2() {
    this.diseaseService.select2().subscribe(
      (response: any) => {
        this.select2Data = response.data;
      }
    )
  }

  getParentSpecializations() {
    this.specializationService.get('', {pagination: "No", parent_id: "0", ob_key: "specialization_name", ob_value: "ASC"}).subscribe(
      (response: any) => {
        if (response.status) {
          let data = response.data;
          this.allParentSpecializations = data.filter(x => x.parent_id == 0);
        }
      }
    )
  }

  getTotalSpecializations() {
    this.specializationService.total({search: this.search}).subscribe(
      (response: any) => {
        this.totalItems = response.data;
        if (this.totalItems) {
          this.getSpecializations();
        }
      }
    );
  }

  getSpecializations(id = '') {
    this.dataLoader = true;
    let params = {
      limit: this.itemsPerPage,
      page: this.currentPage,
      search: this.search,
      parent_id: "0"
    };
    this.specializationService.get(id, params).subscribe(
      (response: any) => {
        if (response.status) {
          this.specializations = response.data;
        }
        this.dataLoader = false;
      },
      (error) => { this.dataLoader = false; }
    )
  }

  pageChanged(p: number) {
    this.currentPage = p;
    this.getSpecializations();
  }

  clearSearch() {
    this.ngsearchinput.nativeElement.value = '';
    this.search = '';
    this.getTotalSpecializations();
  }

  openAddSpecializationForm() {
    this.specializationAddUpdateForm.reset();
    this.ngspecializationaddupdateform.resetForm();
    this.removeSpecializationImage();
    this.specializationAddUpdateForm.patchValue({
      parent_id: '0',
      specialization_name: '',
      status: 'Active',
      diseases: '',
    });
    this.modalService.open_modal("#addFormModal");
  }

  onSubmitSpecializationAddForm() {
    if (this.specializationAddUpdateForm.valid) {
      let formData = new FormData();
      formData.append('token', this.commonService.getUserData('token'));
      formData.append('parent_id', this.specializationAddUpdateForm.value.parent_id);
      formData.append('specialization_name', this.specializationAddUpdateForm.value.specialization_name);
      formData.append('diseases', this.specializationAddUpdateForm.value.diseases);
      formData.append('status', this.specializationAddUpdateForm.value.status);
      if (this.specializationImageFileInput) {
        formData.append('specialization_image', this.specializationImageFileInput);
      }
      this.specializationAddUpdateFormLoader = true;
      this.specializationService.post(formData).subscribe(
        (response: any) => {
          if (response.status) {
            this.modalService.close_modal('#addFormModal');
            this.alertService.show_alert(response.message);
            this.getTotalSpecializations();
            this.getParentSpecializations();
          }
          this.specializationAddUpdateFormLoader = false;
        },
        (error) => { this.specializationAddUpdateFormLoader = false; }
      );
    }
  }

  openUpdateSpecializationForm(id:string, i: number, j:number=-1) {
    this.specialization_id = id;
    this.removeSpecializationImage()
    let data = this.specializations[i];
    this.ngspecializationaddupdateform.resetForm();
    if (i >= 0 && j >= 0) {
      data = this.specializations[i].sub_specialization[j];
    }

    let diseases = []
    for (let i = 0; i < data.diseases.length; i++) {
      diseases.push(data.diseases[i].disease_id);
    }
    this.specializationAddUpdateForm.patchValue({
      parent_id: data.parent_id,
      specialization_name: data.specialization_name,
      image: data.specialization_image,
      diseases: diseases,
      status: data.status,
    });
    if (data.specialization_image) {
      this.specializationImageSrc = data.specialization_image_url;
    }
    this.modalService.open_modal('#updateFormModal');
  }

  onSubmitSpecializationUpdateForm() {
    if (this.specializationAddUpdateForm.valid) {
      let formData = new FormData();
      formData.append('token', this.commonService.getUserData('token'));
      formData.append('parent_id', this.specializationAddUpdateForm.value.parent_id);
      formData.append('specialization_name', this.specializationAddUpdateForm.value.specialization_name);
      formData.append('diseases', this.specializationAddUpdateForm.value.diseases);
      formData.append('status', this.specializationAddUpdateForm.value.status);
      if (this.specializationImageFileInput) {
        formData.append('specialization_image', this.specializationImageFileInput);
      }
      this.specializationAddUpdateFormLoader = true;
      this.specializationService.post(formData, this.specialization_id).subscribe(
        (response: any) => {
          if (response.status) {
            this.modalService.close_modal('#updateFormModal');
            this.alertService.show_alert(response.message);
            this.getSpecializations();
            this.getParentSpecializations();
          }
          this.specializationAddUpdateFormLoader = false;
        },
        (error) => { this.specializationAddUpdateFormLoader = false; }
      );
    }
  }

  onDeleteSpecialization(id='') {
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
        this.specializationService.delete(id).subscribe(
          (response: any) => {
            if (response.status) {
              this.alertService.show_alert(response.message);
            }
            this.getSpecializations();
          },
          (error) => { this.dataLoader = false; },
        );
      }
    });
  }

  onChangeSpecializationImage(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      let file = fileInput.target.files[0];
      const max_height = 2000;
      const max_width = 2000;

      const allowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedFileTypes.includes(file.type)) {
        this.alertService.showValidationErrors('Only JPG or PNG files allowed');
        return false;
      }

      const allowedMaxSize = 2 * 1024 * 1024;
      if (file.size > allowedMaxSize) {
        this.alertService.showValidationErrors('Maximum size allowed is 2 MB');
        return false;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const provider_image = new Image();
        provider_image.src = e.target.result;
        provider_image.onload = rs => {
          const img_height = rs.currentTarget['height'];
          const img_width = rs.currentTarget['width'];

          if (img_height > max_height && img_width > max_width) {
            //this.alertService.showValidationErrors('Maximum dimentions allowed ' + max_height + '*' + max_width + 'px');
            //return false;
          }
          this.specializationImageSrc = e.target.result;
          this.specializationImageFileInput = file;
        };
      };
      reader.readAsDataURL(file);
      this.ngspecializationimageinput.nativeElement.value = '';
    }
  }

  removeSpecializationImage() {
    this.specializationImageSrc = '';
    this.specializationImageFileInput = null;
    this.ngspecializationimageinput.nativeElement.value = '';
  }

  deleteSpecializationImage() {
    this.specializationAddUpdateFormLoader = true;
    this.specializationService.delete_image(this.specialization_id).subscribe(
      (response: any) => {
        if (response.status) {
          //this.alertService.show_alert(response.message);
          this.removeSpecializationImage();
        }
        this.specializationAddUpdateFormLoader = false;
      }
    );
  }
}
