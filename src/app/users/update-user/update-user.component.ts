import { Component, OnInit, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

import { ApiService } from '../../services/api.service';
import { CommonService } from '../../services/common.service';
import { UsersService } from '../../services/users.service';
import { UserFamilyService } from '../../services/user-family.service';
import { AppointmentService } from '../../services/appointment.service';
import { HealthRecordService } from '../../services/health-record.service';
import { AlertService } from '../../services/alert.service';
import { ModalService } from '../../services/modal.service';

import { iUserDetail } from '../../services/interface/i-user-detail';
import { iHealthRecord } from '../../services/interface/i-health-record';
import { iFamily } from '../../services/interface/i-family';

import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as _moment from 'moment';
const moment = _moment;
export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
import { SearchCountryField, TooltipLabel, CountryISO } from 'ngx-intl-tel-input';

@Component({
  selector: 'app-update-user',
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class UpdateUserComponent implements OnInit {
  userType = '';
  user_alias = '';
  user_id = '';
  created_by = 0;

  activeTab = '';

  dataLoader = true;
  userData: iUserDetail;
  userFamilyData: iFamily;

  find_in = 'session';
  storage_type = false;
  localUserData: any;

  @ViewChild('ngprofileimagefileinput', { static: false }) ngprofileimagefileinput: ElementRef;
  updateUserForm: FormGroup;
  updateUserFormLoader = false;
  emailRegex = this.commonService.emailRegex;
  maxDateDob = this.commonService.maxDobDate;
  allBloodGroups = this.commonService.blood_groups();

  familyMembers:iFamily[] = [];
  familyMembersDataLoader = false;
  patient_id = '';
  @ViewChild('ngaddfamilymemberform', { static: false }) ngaddfamilymemberform: NgForm;
  @ViewChild('ngupdatefamilymemberform', { static: false }) ngupdatefamilymemberform: NgForm;
  familyMemberFormLoader = false;
  familyMemberForm: FormGroup;
  @ViewChild('ngpatientimagefileinput', { static: false }) ngpatientimagefileinput:ElementRef;
  familyMemberImage: File;
  familyMemberImageSrc = '';

  healthRecordsDataLoader = false;
  healthRecords: iHealthRecord[];
  @ViewChild('ngaddhealthrecordform', { static: false }) ngaddhealthrecordform: NgForm;
  @ViewChild('ngaddhealthrecordfileinput', { static: false }) ngaddhealthrecordfileinput: ElementRef;
  addHealthRecordForm: FormGroup;
  addHealthRecordFormLoader = false;
  addHealthRecordFileInput: File;
  record_type = '';

  appointments = [];

  SearchCountryField = SearchCountryField;
	TooltipLabel = TooltipLabel;
	CountryISO = CountryISO;
	preferredCountries: CountryISO[] = [CountryISO.Kuwait];
  selectedCountryCode: string = CountryISO.Kuwait;

  constructor(
	  private translate: TranslateService,
    private title: Title,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,

    private apiService: ApiService,
    private commonService: CommonService,
    private userService: UsersService,
    private userFamilyService: UserFamilyService,
    private appointmentService: AppointmentService,
    private healthRecordService: HealthRecordService,
    private alertService: AlertService,
    private modalService: ModalService
  ) {
	  const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Update Profile');
    this.userType = this.commonService.getUserData('group_name');
    this.created_by = this.commonService.getUserData('created_by');
    /* const allowedUserTypes = ['Super Admin', 'Clinic', 'Doctor', 'Patient'];
    if (!allowedUserTypes.includes(this.userType)) {
      this.commonService.userDefaultRoute();
    } */

    this.activatedRoute.queryParamMap.subscribe(params => {
      this.activeTab = params.get('tab') ? params.get('tab') : 'info';
    });

    this.updateUserForm = this.formBuilder.group({
      first_name: [{value: '', disabled: this.userType=='Clinic'}, [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      last_name: [{value: '', disabled: this.userType=='Clinic'}, [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      email: [{value: '', disabled: this.userType=='Clinic'}, [
        Validators.required,
        Validators.email,
        Validators.pattern(this.emailRegex)
      ]],
      dial_code: [{value: '', disabled: this.userType=='Clinic'}, [
        Validators.required,
      ]],
      country_code: [{value: '', disabled: this.userType=='Clinic'}, [
        Validators.required,
      ]],
      mobile_number: [{value: '', disabled: this.userType=='Clinic'}, [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(15)
      ]],
      gender: [{value: '', disabled: this.userType=='Clinic'}, [
        Validators.required
      ]],
      dob: [{value: '', disabled: this.userType=='Clinic'}, [
        Validators.required
      ]],
      blood_group: [{value: '', disabled: this.userType=='Clinic'}],
      height: [{value: '', disabled: this.userType=='Clinic'}, [
        Validators.maxLength(3)
      ]],
      weight: [{value: '', disabled: this.userType=='Clinic'}, [
        Validators.maxLength(3)
      ]],
      allergy: [{value: '', disabled: this.userType=='Clinic'}, [
        Validators.maxLength(1000)
      ]],
      medical_history: [{value: '', disabled: this.userType=='Clinic'}, [
        Validators.maxLength(1000)
      ]],
      email_verification_status: [{value: '', disabled: this.userType=='Clinic'}],
      mobile_verification_status: [{value: '', disabled: this.userType=='Clinic'}],
      status: [{value: '', disabled: this.userType=='Clinic'}]
    });

    this.familyMemberForm = this.formBuilder.group({
      patient_name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      patient_email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(this.emailRegex),
        Validators.maxLength(100)
      ]],
      patient_mobile: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(15)
      ]],
      patient_gender: ['', [
        Validators.required,
      ]],
      patient_dob: ['', [
        Validators.required
      ]],
      blood_group: [''],
      height: ['', [
        Validators.maxLength(3)
      ]],
      weight: ['', [
        Validators.maxLength(3)
      ]],
      allergy: ['', [
        Validators.maxLength(1000)
      ]],
      medical_history: ['', [
        Validators.maxLength(1000)
      ]]
    });

    this.addHealthRecordForm = this.formBuilder.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(200)
      ]],
      record_for: ['Self', [
        Validators.required
      ]],
      patient_id: [''],
      doctor: [''],
      description: [''],
      file: ['', [
        Validators.required
      ]],
      record_date: ['', [
        Validators.required
      ]],
      record_type: ['', [
        Validators.required
      ]]
    });

    this.addHealthRecordForm.get('record_for').valueChanges.subscribe(value => {
      if (value == 'Self') {
        this.addHealthRecordForm.patchValue({patient_id: ''});
        this.addHealthRecordForm.get('patient_id').clearValidators();
      } else {
        this.addHealthRecordForm.get('patient_id').setValidators([Validators.required]);
      }
      this.addHealthRecordForm.get('patient_id').updateValueAndValidity();
    });
  }

  deleteLabel='Delete';
  areYouSureLabel='Are you sure?';
  okLabel='OK';
  cancelLabel='Cancel';
  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.activatedRoute.params.subscribe(routeParams => {
      if(this.userType != 'Patient') {
        this.user_alias = routeParams.user_alias;
      }
      this.getUserDetail();
    });

    if(this.userType == 'Patient') {
      this.find_in = localStorage.getItem('find_in');
      if(this.find_in == 'local') {
        this.storage_type = true;
      }
      this.localUserData = this.commonService.getUserData();
    }
    this.translate.stream(['']).subscribe(translations => {
      this.deleteLabel = this.translate.instant('delete');
      this.areYouSureLabel = this.translate.instant('are_you_sure');
      this.okLabel = this.translate.instant('ok');
      this.cancelLabel = this.translate.instant('cancel');
    });
  }

  getUserDetail() {
    this.dataLoader = true;
    let params = '';
    if(this.userType != 'Patient') {
      params = this.user_alias;
    }
    this.userService.detail(params).subscribe(
      (response: any) => {
        this.userData = response.data;
        this.userFamilyData = response.data.family_info;
        this.user_id = this.userData.user_id;
        this.selectedCountryCode = this.userData.country_code;
        this.updateUserForm.patchValue({
          first_name: this.userData.first_name,
          last_name: this.userData.last_name,
          email: this.userData.email,
          mobile_number: this.userData.mobile_number,
          dial_code: this.userData.dial_code,
          country_code: this.userData.country_code,
          gender: this.userData.gender,
          dob: this.userData.dob ? moment(this.userData.dob) : '',
          blood_group: this.userFamilyData.blood_group,
          height: this.userFamilyData.height,
          weight: this.userFamilyData.weight,
          allergy: this.userFamilyData.allergy,
          medical_history: this.userFamilyData.medical_history
        });
        if(this.userType == 'Super Admin' || this.userType == 'Doctor') {
          this.updateUserForm.patchValue({
            email_verification_status: this.userData.email_verification_status,
            mobile_verification_status: this.userData.mobile_verification_status,
            status: this.userData.status
          });
        }
        if(this.userType == 'Patient' || this.userType == 'Super Admin') {
          this.getFamilyMembers();
          this.getHealthRecords();
        }
        this.getUserAppointments();
        this.dataLoader = false;
      },
      (error) => { this.dataLoader = false; }
    );
  }

  onChangeProfileImage(files: any) {
    if (files.target.files && files.target.files[0]) {
      let file = files.target.files[0];

      const allowedMaxSize = 2 * 1024 * 1024;
      const allowedFileTypes = ['image/png', 'image/jpeg'];
      const allowedMaxHeight = 300;
      const allowedMaxWidth = 300;

      if (!allowedFileTypes.includes(file.type)) {
        this.alertService.showValidationErrors('Only JPG or PNG files allowed (  )');
        return false;
      }

      if (file.size > allowedMaxSize) {
        this.alertService.showValidationErrors('Maximum size allowed is 2 MB');
        return false;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const image = new Image();
        image.src = e.target.result;
        image.onload = rs => {
          const img_height = rs.currentTarget['height'];
          const img_width = rs.currentTarget['width'];

          if (img_height > allowedMaxHeight && img_width > allowedMaxWidth) {
            //this.alertService.showValidationErrors('Maximum dimentions allowed ' + allowedMaxHeight + '*' + allowedMaxWidth + 'px');
            //return false;
          }

          const formData = new FormData;
          formData.append('token', this.commonService.getUserData('token'));
          if(this.userType == 'Super Admin') {
            formData.append('user_id', this.userData.user_id);
          }
          formData.append('profile_image', file);
          this.updateUserFormLoader = true;
          this.userService.update_profile_image(formData).subscribe(
            (response: any) => {
              if (response.status) {
                this.userData.profile_image_url = response.data;
                if(this.userType == 'Patient') {
                  this.localUserData.profile_image_url = response.data;
                  this.commonService.setUserData(this.localUserData, this.storage_type);
                  this.apiService.userData.next(this.localUserData);
                }
              } else {
                this.alertService.show_alert(response.messages, '', 'error');
              }
              this.updateUserFormLoader = false;
            },
            (error) => { this.updateUserFormLoader = false; }
          );
          this.ngprofileimagefileinput.nativeElement.value = '';
        };
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmitUserUpdateForm() {
    if (this.updateUserForm.valid) {
      let putData = {
        token: this.commonService.getUserData('token'),
        first_name: this.updateUserForm.value.first_name,
        last_name: this.updateUserForm.value.last_name,
        gender: this.updateUserForm.value.gender,
        mobile_number: this.updateUserForm.value.mobile_number.number.replace(/\s+/g, ''),
        country_code: this.updateUserForm.value.mobile_number.countryCode,
        dial_code: this.updateUserForm.value.mobile_number.dialCode.substring(1),
        email: this.updateUserForm.value.email,
        dob: this.updateUserForm.value.dob.format("YYYY-MM-DD"),
        blood_group: this.updateUserForm.value.blood_group,
        height: this.updateUserForm.value.height,
        weight: this.updateUserForm.value.weight,
        allergy: this.updateUserForm.value.allergy,
        medical_history: this.updateUserForm.value.medical_history,
      };
      let user_id = '';
      if(this.userType == 'Super Admin' || this.userType == 'Doctor') {
        user_id = this.userData.user_id;
        putData['email_verification_status'] = this.updateUserForm.value.email_verification_status;
        putData['mobile_verification_status'] = this.updateUserForm.value.mobile_verification_status;
        putData['status'] = this.updateUserForm.value.status;
      }

      this.updateUserFormLoader = true;
      this.userService.update(putData, user_id).subscribe(
        (response: any) => {
          if (response.status) {
            this.alertService.show_alert(response.message);
            if (this.userType == 'Patient') {
              this.localUserData.full_name = this.updateUserForm.value.first_name + ' ' + this.updateUserForm.value.last_name;
              this.commonService.setUserData(this.localUserData, this.storage_type);
              this.apiService.userData.next(this.localUserData);
            }
          }
          this.updateUserFormLoader = false;
        },
        (error:any) => {
          this.updateUserFormLoader = false;
        }
      );
    }
  }

  getFamilyMembers() {
    this.familyMembersDataLoader = true;
    let formData = {}
    if(this.userType == 'Super Admin') {
      formData['user_id'] = this.user_id;
    }
    this.userFamilyService.get(formData).subscribe(
      (response: any) => {
        if (response.status) {
          this.familyMembers = response.data;
        }
        this.familyMembersDataLoader = false;
      },
      (error) => { this.familyMembersDataLoader = false; }
    )
  }

  openAddFamilyMemberFormModal() {
    this.familyMemberForm.reset();
    this.familyMemberForm.patchValue({
      patient_gender: '',
      blood_group: '',
    });
    this.removeFamilyMemberImage();
    this.modalService.open_modal('#addFamilyMemberModal');
  }

  onSubmitAddFamilyMemberForm() {
    if (this.familyMemberForm.valid) {
      let formData = new FormData();

      formData.append("token", this.commonService.getUserData("token"));
      if (this.familyMemberImage) {
        formData.append('patient_image', this.familyMemberImage);
      }
      formData.append("patient_name", this.familyMemberForm.value.patient_name);
      formData.append("patient_gender", this.familyMemberForm.value.patient_gender);
      formData.append("patient_email", this.familyMemberForm.value.patient_email);
      formData.append("patient_mobile", this.familyMemberForm.value.patient_mobile);
      formData.append("blood_group", this.familyMemberForm.value.blood_group);
      formData.append("patient_dob", this.familyMemberForm.value.patient_dob.fomat('YYYY-MM-DD'));
      formData.append("height", this.familyMemberForm.value.height);
      formData.append("weight", this.familyMemberForm.value.weight);
      formData.append("allergy", this.familyMemberForm.value.allergy);
      formData.append("medical_history", this.familyMemberForm.value.medical_history);
      this.familyMemberFormLoader = true;
      this.userFamilyService.create(formData).subscribe(
        (response: any) => {
          if (response.status) {
            this.getFamilyMembers();
            this.alertService.show_alert(response.message);
            this.modalService.close_modal("#addFamilyMemberModal");
          }
          this.familyMemberFormLoader = false;
        },
        (error) => { this.familyMemberFormLoader = false; },
      );
    }
  }

  openFamilyMemberUpdateFormModal(patient_id='', i:number) {
    this.patient_id = patient_id;
    this.familyMemberImageSrc = this.familyMembers[i].patient_image ? this.familyMembers[i].patient_image_url : '';
    this.familyMemberForm.patchValue({
      patient_name: this.familyMembers[i].patient_name,
      patient_email: this.familyMembers[i].patient_email,
      patient_mobile: this.familyMembers[i].patient_mobile,
      patient_gender: this.familyMembers[i].patient_gender,
      patient_dob: this.familyMembers[i].patient_dob ? moment(this.familyMembers[i].patient_dob) : '',
      blood_group: this.familyMembers[i].blood_group,
      height: this.familyMembers[i].height,
      weight: this.familyMembers[i].weight,
      allergy: this.familyMembers[i].allergy,
      medical_history: this.familyMembers[i].medical_history
    });
    this.modalService.open_modal("#updateFamilyMemberFormModal");
  }

  onSubmitFamilyMemberUpdateForm() {
    if (this.familyMemberForm.valid) {
      let formData = new FormData();
      formData.append("token", this.commonService.getUserData("token"));
      if (this.familyMemberImage) {
        formData.append('patient_image', this.familyMemberImage);
      }
      formData.append("patient_name", this.familyMemberForm.value.patient_name);
      formData.append("patient_email", this.familyMemberForm.value.patient_email);
      formData.append("patient_mobile", this.familyMemberForm.value.patient_mobile);
      formData.append("blood_group", this.familyMemberForm.value.blood_group);
      formData.append("patient_id", this.patient_id);
      formData.append("patient_gender", this.familyMemberForm.value.patient_gender);
      formData.append("patient_dob", this.familyMemberForm.value.patient_dob.format("YYYY-MM-DD"));
      formData.append("height", this.familyMemberForm.value.height);
      formData.append("weight", this.familyMemberForm.value.weight);
      formData.append("allergy", this.familyMemberForm.value.allergy);
      formData.append("medical_history", this.familyMemberForm.value.medical_history);

      this.familyMemberFormLoader = true;
      this.userFamilyService.update(formData).subscribe(
        (response: any) => {
          if (response.status) {
            this.alertService.show_alert(response.message);
            this.modalService.close_modal("#updateFamilyMemberFormModal");
            this.getFamilyMembers();
          }
          this.familyMemberFormLoader = false;
        },
        (error) => { this.familyMemberFormLoader = false; }
      );
    }
  }

  onDeleteFamilyMember(patient_id:string) {
    Swal.fire({
      title: this.deleteLabel,
      text: this.areYouSureLabel,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.okLabel,
      cancelButtonText: this.cancelLabel
    }).then((result) => {
      if (result.value) {
        this.familyMembersDataLoader = true;
        this.userFamilyService.delete({ patient_id: patient_id }).subscribe(
          (response: any) => {
            if (response.status) {
              this.alertService.show_alert(response.message);
              this.getFamilyMembers();
            }
            this.familyMembersDataLoader = false;
          },
          (error) => { this.familyMembersDataLoader = false; }
        )
      }
    });
  }

  onChangeFamilyMemberImage(files: any) {
    if (files.target.files && files.target.files[0]) {
      let file = files.target.files[0];

      const allowedMaxSize = 2 * 1024 * 1024;
      const allowedFileTypes = ['image/png', 'image/jpeg'];

      if (!allowedFileTypes.includes(file.type)) {
        this.alertService.showValidationErrors('Only JPG or PNG files allowed (  )');
        return false;
      }

      if (file.size > allowedMaxSize) {
        this.alertService.showValidationErrors('Maximum size allowed is 2 MB');
        return false;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.familyMemberImageSrc = e.target.result;
        this.familyMemberImage = files;
      };
      reader.readAsDataURL(file);
      this.ngpatientimagefileinput.nativeElement.value = '';
    }
  }

  removeFamilyMemberImage() {
    this.familyMemberImageSrc = '';
    this.familyMemberImage = null;
  }

  getHealthRecords() {
    this.healthRecordsDataLoader = true;
    let formData = {}
    if(this.userType == 'Super Admin') {
      formData['user_id'] = this.user_id;
    }
    this.healthRecordService.get(formData).subscribe(
      (response:any) => {
        if(response.status) {
          this.healthRecords = response.data;
        }
        this.healthRecordsDataLoader = false;
      },
      (error) => { this.healthRecordsDataLoader = false; }
    );
  }

  openAddHealthRecordFormModal() {
    this.record_type = '';
    this.addHealthRecordFileInput = null;
    this.addHealthRecordFormLoader = false
    this.removeHealthRecordFile();
    this.addHealthRecordForm.reset();
    this.ngaddhealthrecordform.resetForm();
    this.addHealthRecordForm.patchValue({record_for:'Self'});
    this.modalService.open_modal('#addHealthRecordModal');
  }

  onChangeHealthRecordFile(fileInput:any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      let file = fileInput.target.files[0];

      const allowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      if (!allowedFileTypes.includes(file.type)) {
        this.alertService.showValidationErrors('Only JPG, PNG and PDF files are allowed');
        return false;
      }

      const allowedMaxSize = 5 *1024 * 1024;
      if (file.size > allowedMaxSize) {
        this.alertService.showValidationErrors("Maximum 5MB file allowed");
        return false;
      }

      this.addHealthRecordForm.patchValue({file: "yes"})
      this.addHealthRecordFileInput = file;
      this.ngaddhealthrecordfileinput.nativeElement.value = '';
    }
  }

  removeHealthRecordFile() {
    this.addHealthRecordFileInput = null;
    this.addHealthRecordForm.patchValue({file: ""});
    this.ngaddhealthrecordfileinput.nativeElement.value = '';
  }

  onChangeHealthRecordType(record_type:string) {
    this.addHealthRecordForm.patchValue({record_type: record_type});
    this.record_type = record_type;
  }

  onSubmitAddHealthRecordForm() {
    if (this.addHealthRecordForm.valid) {
      this.addHealthRecordFormLoader = true;
      let postData = new FormData();
      postData.append("token", this.commonService.getUserData("token"));
      postData.append("name", this.addHealthRecordForm.value.name);
      postData.append("record_for", this.addHealthRecordForm.value.record_for);
      postData.append("patient_id", this.addHealthRecordForm.value.patient_id);
      postData.append("doctor", this.addHealthRecordForm.value.doctor);
      postData.append("file", this.addHealthRecordFileInput);
      postData.append("record_date", this.addHealthRecordForm.value.record_date.format('YYYY-MM-DD'));
      postData.append("record_type", this.addHealthRecordForm.value.record_type);
      postData.append("description", this.addHealthRecordForm.value.description);

      this.healthRecordService.post(postData).subscribe(
        (response: any) => {
          if (response.status) {
            this.alertService.show_alert(response.message);
            this.modalService.close_modal("#addHealthRecordModal");
            this.getHealthRecords();
          }
          this.addHealthRecordFormLoader = false;
        },
        (error) => { this.addHealthRecordFormLoader = false; },
      );
    }
  }

  deleteHealthRecord(id: string) {
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
          id: id
        }
        if(this.userType == 'Super Admin') {
          formData['user_id'] = this.user_id;
        }
        this.healthRecordsDataLoader = true;
        this.healthRecordService.delete(formData).subscribe(
          (response: any) => {
            if (response.status) {
              this.alertService.show_alert(response.message);
              this.getHealthRecords();
            }
            this.healthRecordsDataLoader = false;
          },
          (error) => { this.healthRecordsDataLoader = false; }
        );
      }
    });
  }

  getUserAppointments() {
    let params = {}
    if(this.userType != 'Patient') {
      params['user_id'] = this.user_id;
    }
    this.appointmentService.appointments(params).subscribe(
      (response: any) => {
        if (response.status) {
          this.appointments = response.data;
        }
      }
    )
  }

}
