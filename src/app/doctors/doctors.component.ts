import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { DoctorService } from '../services/doctor.service';
import { SpecializationService } from '../services/specialization.service';
import { CommonService } from '../services/common.service';
import { AlertService } from '../services/alert.service';
import { ModalService } from '../services/modal.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-doctors',
  templateUrl: './doctors.component.html',
  styleUrls: ['./doctors.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DoctorsComponent implements OnInit {
  userType = '';
  mySubscription: any;

  viewType = 'box';

  searchForm: FormGroup;
  search = '';
  specialization_id = '';
  gender = '';
  status = '';
  account_status = '';
  rating = '';

  @ViewChild('ngadddoctorform', {static:false}) ngadddoctorform: NgForm;
  @ViewChild('ngprofilimagefileinput', {static:false}) ngprofilimagefileinput: ElementRef;
  addDoctorForm: FormGroup;
  addDoctorFormLoader = false;
  emailRegex = this.commonService.emailRegex;
  profile_image_src = this.commonService.defaultImage;
  userSelectedImage: File;

  popoverToggle = false;
  specializations = [];

  constructor(
	private translate: TranslateService,
    private title: Title,
    private formBuilder: FormBuilder,
    private router: Router,
    private doctorService: DoctorService,
    private specializationService: SpecializationService,
    private commonService: CommonService,
    private alertService: AlertService,
    private modalService: ModalService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Doctors');
    this.router.routeReuseStrategy.shouldReuseRoute = function () { return false; };
    this.mySubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) this.router.navigated = false;
    });
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
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
    this.userType = this.commonService.getUserData('group_name');
    this.get_specializations();

    this.searchForm = this.formBuilder.group({
      search: [''],
      specialization_id: [''],
      gender: [''],
      status: [''],
      account_status: [''],
      rating: ['']
    });
  }

  changeViewType(viewType: string) {
    this.viewType = viewType;
  }

  onSubmitSearchForm() {
    this.search = this.searchForm.value.search;
    this.specialization_id = this.searchForm.value.specialization_id;
    this.gender = this.searchForm.value.gender;
    this.status = this.searchForm.value.status;
    this.account_status = this.searchForm.value.account_status;
    this.rating = this.searchForm.value.rating;
    this.togglePopover();
  }

  changeRating(r: number) {
    this.searchForm.patchValue({rating:r});
  }

  togglePopover() {
    if (this.popoverToggle) this.popoverToggle = false;
    else this.popoverToggle = true;
  }

  clearFilter() {
    this.searchForm.patchValue({search: '', specialization_id: '', gender: '', status: '', account_status: '', rating: ''});
    this.search = '';
    this.specialization_id = '';
    this.gender = '';
    this.status = '';
    this.account_status = '';
    this.rating = '';
    this.togglePopover();
  }

  get_specializations() {
    this.specializationService.get().subscribe(
      (response: any) => {
        if (response.status) {
          this.specializations = response.data;
        }
      }
    )
  }

  openAddDoctorForm() {
    this.ngadddoctorform.resetForm();
    this.addDoctorForm.patchValue({gender:'Male'});
    this.userSelectedImage = null;
    this.profile_image_src = this.commonService.defaultImage;
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
      this.doctorService.create(postData).subscribe(
        (response: any) => {
          if (response.status) {
            this.alertService.show_alert(response.message);
            this.modalService.close_modal('#addDoctorFormModal');
            this.router.navigate(['/doctors']);
          }
          this.addDoctorFormLoader = false;
        },
        (error) => { this.addDoctorFormLoader = false; }
      );
    }
  }

  ngOnDestroy() {
    if (this.mySubscription) {
      this.mySubscription.unsubscribe();
    }
  }

}
