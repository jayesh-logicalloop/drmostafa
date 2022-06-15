import { Component, OnInit, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, map } from "rxjs/operators";
import { fromEvent } from 'rxjs';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

import { ApiService } from '../services/api.service';
import { CommonService } from '../services/common.service';
import { CouponService } from '../services/coupon.service';
import { ModalService } from '../services/modal.service';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-coupon',
  templateUrl: './coupon.component.html',
  styleUrls: ['./coupon.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CouponComponent implements OnInit {
  userType = '';

  currentPage = 1;
  itemsPerPage = 10;
  totalItems: number;

  @ViewChild('searchEle', { static: false }) searchEle: ElementRef;
  search = '';
  status = '';
  dataLoader = false;
  coupons: any = [];
  services: any = [];

  @ViewChild('ngaddform', { static: false }) ngaddform: NgForm;
  addForm: FormGroup;
  addFormLoader = false;

  constructor(
    private translate: TranslateService,
    private title: Title,
    private formBuilder: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private commonService: CommonService,
    private couponService: CouponService,
    private modalService: ModalService,
    private alertService: AlertService,


  ) {
    const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Manage Coupons');
    this.apiService.currentUserData.subscribe(
      (userData: any) => {
        this.userType = (userData.group_name) ? userData.group_name : this.commonService.getUserData('group_name');
        /* const allowedUserTypes = ['Super Admin', 'Doctor'];
        if (!allowedUserTypes.includes(this.userType)) {
          this.commonService.userDefaultRoute();
        } */
      }
    );
    this.addForm = this.formBuilder.group({
      coupon_code: ['', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(15)
      ]]
    });
  }

  deleteLabel = 'Delete';
  areYouSureLabel = 'Are you sure?';
  okLabel = 'OK';
  cancelLabel = 'Cancel';
  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.translate.stream(['']).subscribe(translations => {
      this.deleteLabel = this.translate.instant('delete');
      this.areYouSureLabel = this.translate.instant('are_you_sure');
      this.okLabel = this.translate.instant('ok');
      this.cancelLabel = this.translate.instant('cancel');
    });
    this.getTotalItems();
  }

  ngAfterViewInit(): void {
    fromEvent(this.searchEle.nativeElement, 'keyup').pipe(
      map((event: any) => { return event.target.value; }), debounceTime(1000)
    ).subscribe((text: string) => {
      this.search = text;
      if (this.search.length > 1) {
        this.getTotalItems();
      }
    });
  }

  getTotalItems() {
    this.couponService.total({ search: this.search, status: this.status }).subscribe(
      (response: any) => {
        this.totalItems = response.data;
        if (this.totalItems > 0) {
          this.getItems();
        }
      }
    );
  }

  getItems() {
    this.dataLoader = true;
    let params = {
      search: this.search,
      status: this.status,
      limit: this.itemsPerPage,
      page: this.currentPage,
      ob_key: 'created_date',
      ob_value: 'DESC'
    };
    this.couponService.get('', params).subscribe(
      (response: any) => {
        this.coupons = response.data;
        this.dataLoader = false;
      },
      (error) => { this.dataLoader = false; },
    )
  }



  openAddForm() {
    this.ngaddform.resetForm();
    this.addForm.reset();
    this.modalService.open_modal("#addFormModal");
  }

  onSubmitAddForm() {
    if (this.addForm.valid) {
      let postData = new FormData();
      postData.append("token", this.commonService.getUserData("token"));
      postData.append("coupon_code", this.addForm.value.coupon_code);
      this.addFormLoader = true;
      this.couponService.create(postData).subscribe(
        (response: any) => {
          this.modalService.close_modal("#addFormModal");
          this.alertService.show_alert(response.message);
          this.router.navigate(['/coupons/' + response.data]);
          this.addFormLoader = false;
        },
        (error) => { this.addFormLoader = false; }
      );
    }
  }

  deleteItem(coupon_id: string, i: number) {
    Swal.fire({
      title: this.deleteLabel,
      text: this.areYouSureLabel,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.okLabel,
      cancelButtonText: this.cancelLabel
    }).then((result) => {
      if (result.value) {
        this.dataLoader = true;
        this.couponService.delete(coupon_id).subscribe(
          (response: any) => {
            if (response.status) {
              this.getItems();
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
    this.getItems();
  }

  clearSearch() {
    this.searchEle.nativeElement.value = '';
    this.search = '';
    this.getTotalItems();
  }

}
