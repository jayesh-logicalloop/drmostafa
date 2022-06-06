import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { debounceTime, map } from "rxjs/operators";
import { fromEvent } from 'rxjs';
import { Select2OptionData } from 'ng-Select2';
import { Options } from 'select2';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

import { CommonService } from '../services/common.service';
import { UserClinicsService } from '../services/user-clinics.service';
import { ModalService } from '../services/modal.service';
import { AlertService } from '../services/alert.service';

import { iClinic } from '../services/interface/i-clinic';

@Component({
  selector: 'app-clinics',
  templateUrl: './clinics.component.html',
  styleUrls: ['./clinics.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ClinicsComponent implements OnInit {
  userType = '';

  @ViewChild('searchTerm', { static: false }) searchTerm: ElementRef;
  clinicsDataLoader = false;
  clinics:iClinic[] = [];
  searchItem = '';

  newClinicAction = '';

  joinEstablishmentsSelect2Options: Options = {width: '100%', multiple: false, tags: false};
  joinEstablishmentsSelect2Data: Select2OptionData[];
  @ViewChild('ngjoinleftform', { static: false} ) ngjoinleftform: NgForm;
  joinLefForm: FormGroup;
  joinLefFormLoader = false;

  infoFormLoader = false;
  emailRegex = this.commonService.emailRegex;
  @ViewChild('nginfoform', { static: false} ) nginfoform: NgForm;
  @ViewChild('nglogofileinput', { static: false }) nglogofileinput: ElementRef;
  logo_image_src = '';
  logo_image:File;
  amenitiesSelect2Options: Options = {width: '100%', multiple: true, tags: true};
  amenitiesSelect2Data: Select2OptionData[];
  infoForm: FormGroup;

  constructor(
    private title: Title,
    private formBuilder: FormBuilder,
	private translate: TranslateService,
    private commonService: CommonService,
    private userClinicsService: UserClinicsService,
    private modalService: ModalService,
    private alertService: AlertService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('My Establishments');
    this.userType = this.commonService.getUserData('group_name');
    /* const allowedUserTypes = ['Doctor'];
    if (!allowedUserTypes.includes(this.userType)) {
      this.commonService.userDefaultRoute();
    } */
    this.getEstablishments();

    this.infoForm = this.formBuilder.group({
      logo_image: ['', Validators.required],
      name: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(this.emailRegex)
      ]],
      phone_number: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(15),
      ]],
      introduction: ['', [
        Validators.required,
        Validators.minLength(20),
        Validators.maxLength(1000),
      ]],
      work_schedule: ['', [
        Validators.required,
        Validators.maxLength(250),
      ]],
      status: ['Active', [
        Validators.required
      ]],
      set_default: ['Yes', [
        Validators.required
      ]],
      amenities: ['']
    });

    this.joinLefForm = this.formBuilder.group({
      clinic_id: ['', [
        Validators.required
      ]]
    });

    this.getEstablishmentsSelect2();
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
  }

  ngAfterViewInit(): void {
    fromEvent(this.searchTerm.nativeElement, 'keyup').pipe(
      map((event: any) => { return event.target.value; }), debounceTime(1000)
    ).subscribe((text: string) => {
      this.searchItem = text;
      this.getEstablishments();
    });
  }

  getEstablishments() {
    this.clinicsDataLoader = true;
    this.userClinicsService.get({search:this.searchItem, ob_key: 'created_date', ob_value:'DESC'}).subscribe(
      (response: any) => {
        if (response.status) {
          this.clinics = response.data;
        }
        this.clinicsDataLoader = false;
      },
      (error) => { this.clinicsDataLoader = false; }
    )
  }

  getEstablishmentsSelect2() {
    this.userClinicsService.select2({name:this.searchItem}).subscribe(
      (response: any) => {
        if (response.status) {
          this.joinEstablishmentsSelect2Data = response.data
        };
      }
    )
  }

  clearSearch() {
    this.searchTerm.nativeElement.value = '';
    this.searchItem = '';
    this.getEstablishments();
  }

  setAsDefault(clinic_id:string) {
    Swal.fire({
      title: 'Set as default',
      text: 'Are you sure?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        this.clinicsDataLoader = true;
        let params = {
          token: this.commonService.getUserData('token'),
          clinic_id: clinic_id
        }
        this.userClinicsService.set_default_clinic(params).subscribe(
          (response: any) => {
            if (response.status) {
              this.getEstablishments();
            }
            this.clinicsDataLoader = false;
          },
          (error) => { this.clinicsDataLoader = false; }
        )
      }
    });
  }

  onChangeNewEstablishmentAction(action:string) {
    this.newClinicAction = action;
  }

  openAddInfoForm() {
    //this.nginfoform.resetForm();
    this.infoForm.reset();
    this.joinLefForm.reset();
    this.infoForm.patchValue({set_default:'Yes', status:'Active'});
    this.logo_image_src = '';
    this.logo_image = null;
    this.newClinicAction = '';
    this.modalService.open_modal('#addInfoModal');
  }

  onSelectLogo(files: any) {
    if (files.target.files && files.target.files[0]) {
      const allowed_max_size = 2 * 1024 * 1024; //2 MB
      const allowed_types = ['image/png', 'image/jpeg', 'image/jpg'];

      let file = files.target.files[0];

      if (!allowed_types.includes(file.type)) {
        this.alertService.showValidationErrors('Only JPG or PNG files allowed');
        return false;
      }

      if (file.size > allowed_max_size) {
        this.alertService.showValidationErrors('Maximum size allowed is 2 MB');
        return false;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logo_image_src = e.target.result;
        this.infoForm.patchValue({logo_image: e.target.result});
        this.logo_image = file;
      };
      reader.readAsDataURL(files.target.files[0]);
      this.nglogofileinput.nativeElement.value = '';
    }
  }

  onSubmitInfoForm() {
    if (this.infoForm.valid) {
      let formData = new FormData();
      formData.append('token', this.commonService.getUserData('token'));
      formData.append('logo_image', this.logo_image);
      formData.append('name', this.infoForm.value.name);
      formData.append('email', this.infoForm.value.email);
      formData.append('phone_number', this.infoForm.value.phone_number);
      formData.append('introduction', this.infoForm.value.introduction);
      formData.append('work_schedule', this.infoForm.value.work_schedule);
      formData.append('amenities', this.infoForm.value.amenities);
      formData.append('status', this.infoForm.value.status);
      formData.append('set_default', this.infoForm.value.set_default);
      this.infoFormLoader = true;
      this.userClinicsService.create(formData).subscribe(
        (response: any) => {
          if (response.status) {
            this.alertService.show_alert(response.message);
            this.modalService.close_modal('#addInfoModal');
            this.getEstablishments();
          }
          this.infoFormLoader = false;
        },
        (error) => { this.infoFormLoader = false; }
      );
    }
  }

  onSubmitJoinLefForm() {
    if (this.joinLefForm.valid) {
      let formData = {
        token: this.commonService.getUserData('token'),
        clinic_id: this.joinLefForm.value.clinic_id,
        status: 'Join'
      }
      this.joinLefFormLoader = true;
      this.userClinicsService.subscribe(formData).subscribe(
        (response:any) => {
          if(response.status) {
            this.alertService.show_alert(response.message);
            this.modalService.close_modal('#addInfoModal');
            this.getEstablishments();
          }
        }
      );
    }
  }

  onDeleteEshtablishment(clinic_id:string, action:string) {
    Swal.fire({
      title: action,
      text: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        if(action == 'Delete') {
          this.clinicsDataLoader = true;
          this.userClinicsService.delete({clinic_id: clinic_id}).subscribe(
            (response: any) => {
              if (response.status) {
                this.alertService.show_alert(response.message);
                this.getEstablishments();
              } else {
                this.clinicsDataLoader = false;
                this.alertService.show_alert(response.message, '', 'error');
              }
            },
            (error) => { this.clinicsDataLoader = false; }
          )
        } else {
          let formData = {
            token: this.commonService.getUserData('token'),
            clinic_id: clinic_id,
            status: 'Left'
          };
          this.clinicsDataLoader = true;
          this.userClinicsService.subscribe(formData).subscribe(
            (response:any) => {
              if(response.status) {
                if (response.status) {
                  this.alertService.show_alert(response.message);
                  this.getEstablishments();
                } else {
                  this.clinicsDataLoader = false;
                  this.alertService.show_alert(response.message, '', 'error');
                }
              }
            },
            (error) => { this.clinicsDataLoader = false; }
          );
        }
      }
    });
  }

}
