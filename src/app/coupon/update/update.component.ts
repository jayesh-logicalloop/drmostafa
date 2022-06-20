import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../services/common.service';
import { CouponService } from '../../services/coupon.service';
import { BookService } from '../../services/book.service';
import { CourseService } from '../../services/course.service';
import { SessionService } from '../../services/session.service';
import { AlertService } from '../../services/alert.service';

import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as _moment from 'moment';
import { UserServicesService } from './../../services/user-services.service';


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

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.css'],
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
export class UpdateComponent implements OnInit {

  coupon_id = '';
  coupon: any;
  image_src = '';

  books = [];
  courses = [];
  sessions = [];
  products = [];
  services: any = [];

  @ViewChild('ngimagefileinput', { static: false }) ngimagefileinput: ElementRef;
  @ViewChild('ngupdateform', { static: false }) ngupdateform: NgForm;
  updateForm: FormGroup;
  updateFormLoader = false;

  constructor(
    private translate: TranslateService,
    private title: Title,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private commonService: CommonService,
    private bookService: BookService,
    private courseService: CourseService,
    private sessionService: SessionService,
    private couponService: CouponService,
    private alertService: AlertService,
    private userServicesService: UserServicesService,

  ) {
    const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Update Course');
    const userType = this.commonService.getUserData('group_name');
    /* const allowedUserTypes = ['Super Admin', 'Doctor'];
    if (!allowedUserTypes.includes(userType)) {
      this.commonService.userDefaultRoute();
    } */

    this.activatedRoute.params.subscribe(routeParams => {
      this.coupon_id = routeParams.id;
    });

    this.updateForm = this.formBuilder.group({
      coupon_code: ['', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(15)
      ]],
      coupon_for: ['', [
        Validators.required
      ]],
      image: ['', [
        Validators.required
      ]],
      discount_type: ['', [
        Validators.required
      ]],
      discount_amount: ['', [
        Validators.required
      ]],
      usage_limit: ['', [
        Validators.required
      ]],
      start_date: ['', [
        Validators.required
      ]],
      end_date: ['', [
        Validators.required
      ]],
      description: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(250)
      ]],
      status: ['', [
        Validators.required
      ]]
    });
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.getCouponDetail();
  }

  getCouponDetail() {
    this.updateFormLoader = true;
    this.couponService.get(this.coupon_id).subscribe(
      (response: any) => {
        if (response.status) {
          this.coupon = response.data;
          this.products = response.data.products;
          this.getAllProducts();
          this.updateForm.patchValue({
            coupon_code: this.coupon.coupon_code,
            coupon_for: this.coupon.coupon_for,
            image: this.coupon.image,
            discount_type: this.coupon.discount_type,
            discount_amount: this.coupon.discount_amount,
            usage_limit: this.coupon.usage_limit,
            start_date: this.coupon.start_date ? moment(this.coupon.start_date) : '',
            end_date: this.coupon.end_date ? moment(this.coupon.end_date) : '',
            description: this.coupon.description,
            status: this.coupon.status
          });
          this.image_src = this.coupon.image ? this.coupon.image_url : '';
          this.updateFormLoader = false;
        } else {
          this.router.navigate(['/coupons']);
        }
      },
      (error) => { this.updateFormLoader = false; },
    );
  }

  getAllProducts() {

    this.services = [];
    let clinic_id = this.commonService.getUserData('clinic_id');
    let params = { clinic_id: clinic_id };

    this.userServicesService.get(params).subscribe((response: any) => {
      if (response.status) {
        this.services = response.data;
        console.log(this.products);

        if (this.services.length && this.products.length) {
          for (let i = 0; i < this.services.length; i++) {
            let service_id = this.services[i].service_id;
            for (let j = 0; j < this.products.length; j++) {

              if (this.products[j].product_type == 'Appointment' && service_id == this.products[j].product_id) {
                this.services[i]['checked'] = true;
              }
            }
          }
        }

      }
    });

    this.bookService.get().subscribe((response: any) => {
      if (response.status) {
        this.books = response.data;
        if (this.books.length && this.products.length) {
          for (let i = 0; i < this.books.length; i++) {
            let book_id = this.books[i].book_id;
            for (let j = 0; j < this.products.length; j++) {
              if (this.products[j].product_type == 'Book' && book_id == this.products[j].product_id) {
                this.books[i]['checked'] = true;
              }
            }
          }
        }
        //console.log('this.books', this.books);
      }
    }
    );




    this.courseService.get().subscribe(
      (response: any) => {
        if (response.status) {
          this.courses = response.data;
          if (this.courses.length && this.products.length) {
            for (let i = 0; i < this.courses.length; i++) {
              let course_id = this.courses[i].course_id;
              for (let j = 0; j < this.products.length; j++) {
                if (this.products[j].product_type == 'Course' && course_id == this.products[j].product_id) {
                  this.courses[i]['checked'] = true;
                }
              }
            }
          }
          //console.log('this.courses', this.courses);
        }
      }
    );

    this.sessionService.get().subscribe(
      (response: any) => {
        if (response.status) {
          this.sessions = response.data;
          if (this.sessions.length && this.products.length) {
            for (let i = 0; i < this.sessions.length; i++) {
              let session_id = this.sessions[i].session_id;
              for (let j = 0; j < this.products.length; j++) {
                if (this.products[j].product_type == 'Session' && session_id == this.products[j].product_id) {
                  this.sessions[i]['checked'] = true;
                }
              }
            }
          }
          //console.log('this.sessions', this.sessions);
        }
      }
    );
  }

  addUpdateProduct($event: boolean, product_type: string, product_id: string) {
    if ($event) {
      let product = {
        product_type: product_type,
        product_id: product_id
      }
      this.products.push(product);
    } else if (this.products.length) {
      for (let i = 0; i < this.products.length; i++) {
        if (this.products[i].product_type == product_type && this.products[i].product_id == product_id) {
          this.products.splice(i, 1);
        }
      }
    }
  }

  onSubmitUpdateForm() {
    //console.log(this.updateForm);
    if (this.updateForm.valid) {

      let formData = {
        token: this.commonService.getUserData('token'),
        coupon_code: this.updateForm.value.coupon_code,
        coupon_for: this.updateForm.value.coupon_for,
        discount_type: this.updateForm.value.discount_type,
        discount_amount: this.updateForm.value.discount_amount,
        usage_limit: this.updateForm.value.usage_limit,
        start_date: this.updateForm.value.start_date.format('YYYY-MM-DD'),
        end_date: this.updateForm.value.end_date.format('YYYY-MM-DD'),
        description: this.updateForm.value.description,
        status: this.updateForm.value.status,
        products: this.products,
        coupon_id: this.coupon_id
      }

      this.updateFormLoader = true;
      this.couponService.update(this.coupon_id, formData).subscribe(
        (response: any) => {
          if (response.status) {
            this.alertService.show_alert(response.message);
            this.updateForm.reset();
          }
          this.updateFormLoader = false;
        },
        (error) => { this.updateFormLoader = false; }
      );
    }
  }

  onChangeImage(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      let file: File = fileInput.target.files[0];
      const max_height = 2000;
      const max_width = 2000;

      const allowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedFileTypes.includes(file.type)) {
        this.alertService.showValidationErrors('Only JPG or PNG files are allowed');
        return false;
      }

      const allowedMaxSize = 0.25 * 1024 * 1024;
      if (file.size > allowedMaxSize) {
        this.alertService.showValidationErrors('Maximum size allowed is 500 KB');
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

          let formData = new FormData;
          formData.append('token', this.commonService.getUserData('token'));
          formData.append('image', file);

          this.updateFormLoader = true;
          this.couponService.update_media(this.coupon_id, formData).subscribe(
            (response: any) => {
              if (response.status) {
                this.image_src = response.data;
                this.updateForm.patchValue({ image: this.image_src });
              }
              this.updateFormLoader = false;
            },
            (error) => { this.updateFormLoader = false; },
          );
        };
      };
      reader.readAsDataURL(file);
      this.ngimagefileinput.nativeElement.value = '';
    }
  }

  removeImage() {
    this.updateFormLoader = true;
    this.couponService.delete_media(this.coupon_id, { file: 'image' }).subscribe(
      (response: any) => {
        if (response.status) {
          this.image_src = '';
          this.ngimagefileinput.nativeElement.value = '';
          this.updateForm.patchValue({ image: '' });
        }
        this.updateFormLoader = false;
      },
      (error) => { this.updateFormLoader = false; },
    );
  }

}
