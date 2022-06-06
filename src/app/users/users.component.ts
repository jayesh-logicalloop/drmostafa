import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, map } from "rxjs/operators";
import { fromEvent } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../services/common.service';
import { AlertService } from '../services/alert.service';
import { ModalService } from '../services/modal.service';
import { UsersService } from '../services/users.service';
import { iUsers } from "../services/interface/i-users";
import { ExcelService } from '../services/excel.service';
import { DrugService } from '../services/drug.service';

@Component({
  selector: 'app-user',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class UsersComponent implements OnInit {
  userType = '';

  @ViewChild('searchTerm', { static: false }) searchTerm: ElementRef;

  currentPage = 1;
  itemsPerPage = 8;
  totalItems: number;
  search = '';

  dataLoader = false;
  users: iUsers[];

  @ViewChild('ngadddoctorform', {static:false}) ngadddoctorform: NgForm;
  @ViewChild('ngprofilimagefileinput', {static:false}) ngprofilimagefileinput: ElementRef;
  addDoctorForm: FormGroup;
  addDoctorFormLoader = false;
  emailRegex = this.commonService.emailRegex;
  profile_image_src = this.commonService.defaultImage;
  userSelectedImage: File;
  drugsSelect2Data = [];

  constructor(
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private title: Title,
    private router: Router,
    private commonService: CommonService,
    private usersService: UsersService,
    private alertService: AlertService,
    private modalService: ModalService,
    private excelService:ExcelService,
    private drugService: DrugService,
  ) {
    const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);

    this.title.setTitle('Patients');
    this.userType = this.commonService.getUserData('group_name');
    /* const allowedUserTypes = ['Super Admin', 'Clinic', 'Doctor'];
    if (!allowedUserTypes.includes(this.userType)) {
      this.commonService.userDefaultRoute();
    } */
    this.getTotalUsers();

    this.addDoctorForm = this.formBuilder.group({
      first_name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      last_name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      gender: ['Male', [
        Validators.required
      ]],
      mobile_number: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(15)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(this.emailRegex)
      ]],
      introduction: ['', [
        Validators.maxLength(250)
      ]],
    });
  }

  ngAfterViewInit(): void {
    fromEvent(this.searchTerm.nativeElement, 'keyup').pipe(
      map((event: any) => { return event.target.value; }), debounceTime(1000)
    ).subscribe((text: string) => {
      this.search = text;
      this.getTotalUsers();
    });
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
  }

  getTotalUsers() {
    this.usersService.total({search: this.search }).subscribe(
      (response: any) => {
        this.totalItems = response.data;
        this.getUsers()
      }
    );
  }

  getUsers() {
    this.dataLoader = true;
    this.usersService.get({limit: this.itemsPerPage, page: this.currentPage, search: this.search, ob_key: "user_id", ob_value: "DESC"}).subscribe(
      (response: any) => {
        if (response.status) {
          this.users = response.data;
        }
        this.dataLoader = false;
      },
      (error) => { this.dataLoader = false; }
    )
  }

  pageChanged(p: number) {
    this.currentPage = p;
    this.getUsers();
  }

  clearSearch() {
    this.searchTerm.nativeElement.value = '';
    this.search = '';
    this.getTotalUsers();
  }

  openAddForm() {
    this.ngadddoctorform.resetForm();
    this.addDoctorForm.patchValue({gender:'Male'});
    this.userSelectedImage = null;
    this.profile_image_src = this.commonService.defaultImage;
    this.ngprofilimagefileinput.nativeElement.value = '';
    this.modalService.open_modal('#addDoctorFormModal');
  }

  onChangeProfileImage(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      let file = fileInput.target.files[0];
      const max_height = 300;
      const max_width = 300;

      const allowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedFileTypes.includes(file.type)) {
        this.alertService.showValidationErrors('Only JPG or PNG files allowed');
        return false;
      }

      const allowedMaxSize = 1 * 1024 * 1024;
      if (file.size > allowedMaxSize) {
        this.alertService.showValidationErrors('Maximum size allowed is 1MB');
        return false;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const image = new Image();
        image.src = e.target.result;
        image.onload = rs => {
          const img_height = rs.currentTarget['height'];
          const img_width = rs.currentTarget['width'];
          if (img_height > max_height && img_width > max_width) {
            this.alertService.showValidationErrors('Maximum dimentions allowed ' + max_height + '*' + max_width + 'px');
            return false;
          } else if(img_height != img_width) {
            this.alertService.showValidationErrors('Image must be square shaped');
            return false;
          }
          this.profile_image_src = e.target.result;
          this.userSelectedImage = file;
        };
      };
      reader.readAsDataURL(file);
      this.ngprofilimagefileinput.nativeElement.value = '';
    }
  }

  onSubmitAddDoctorForm() {
    if (this.addDoctorForm.valid) {
      let postData = new FormData();
      postData.append('token', this.commonService.getUserData('token'));
      if (this.userSelectedImage) {
        postData.append('profile_image', this.userSelectedImage);
      }
      postData.append('first_name', this.addDoctorForm.value.first_name);
      postData.append('last_name', this.addDoctorForm.value.last_name);
      postData.append('gender', this.addDoctorForm.value.gender);
      postData.append('email', this.addDoctorForm.value.email);
      postData.append('mobile_number', this.addDoctorForm.value.mobile_number);
      postData.append('introduction', this.addDoctorForm.value.introduction);
      this.addDoctorFormLoader = true;
      this.usersService.create(postData).subscribe(
        (response: any) => {
          if (response.status) {
            this.alertService.show_alert(response.message);
            this.modalService.close_modal('#addDoctorFormModal');
            this.router.navigate(['/patients']);
          }
          this.addDoctorFormLoader = false;
        },
        (error) => { this.addDoctorFormLoader = false; }
      );
    }
  }

  getDrugList(patientsData) {
    let drugSelectData = [];
    this.drugService.select2().subscribe(
      (response: any) => {
        if (response.status) {
          this.drugsSelect2Data = response.data;
          if (response && response.data.length > 0) {
            response.data.forEach(item => {
              let object = {
                 Prescription : item.text
              }
              drugSelectData.push(object);
            });
            const resposeData = patientsData.slice();
            resposeData.push.apply(resposeData, drugSelectData);

            // const resposeData = [...patientsData, ...drugSelectData];
            if (patientsData.length > 0) {
              this.excelService.exportAsExcelFile(resposeData, 'Patients_ ' + new Date());
            }
          }
        }
      });
  }

  exportBookData() {
    let patientsData = [];
    let params = {
      search: this.search,
      limit: this.totalItems,
      page: 1,
      ob_key: 'created_date',
      ob_value: 'DESC'
    };
    this.usersService.get(params).subscribe((response :any)=>{
      if(response && response.data.length > 0){
        response.data.forEach((item) => {
          const object = {
            FullName: item.full_name,
          }
          patientsData.push(object);
        });
        // this.getDrugList(patientsData)
      }
    });
  }

}
