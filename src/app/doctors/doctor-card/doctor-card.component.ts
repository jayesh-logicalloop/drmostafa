import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core'
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

import { CommonService } from '../../services/common.service';
import { DoctorService } from '../../services/doctor.service';
import { AccountService } from '../../services/account.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector : 'app-doctor-card',
  templateUrl : './doctor-card.component.html',
  encapsulation: ViewEncapsulation.None
})

export class DoctorCardComponent implements OnInit {
  user_id = '';
  userType = '';

  @Input() showContentLoader = false;
  @Input() viewType = 'box';
  @Input() currentPage = 1;
  @Input() itemsPerPage = 12;
  @Input() totalItems:number;
  @Input() doctors = [];
  @Input() search = '';
  @Input() gender = '';
  @Input() rating = '';
  @Input() specialization_id = '';
  @Input() account_status = '';
  @Input() status = '';

  constructor (
	private translate: TranslateService,
    private doctorService: DoctorService,
    private alertService: AlertService,
    private commonService: CommonService,
    private accountService: AccountService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.userType = this.commonService.getUserData('group_name');
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
  }

  ngOnChanges(changes:any){
    if(changes.hasOwnProperty('search') || changes.hasOwnProperty('gender') || changes.hasOwnProperty('rating') || changes.hasOwnProperty('specialization_id') || changes.hasOwnProperty('account_status') || changes.hasOwnProperty('status')) {
      if(changes.hasOwnProperty('search')) this.search = changes.search.currentValue;
      if(changes.hasOwnProperty('gender')) this.gender = changes.gender.currentValue;
      if(changes.hasOwnProperty('rating')) this.rating = changes.rating.currentValue;
      if(changes.hasOwnProperty('specialization_id')) this.specialization_id = changes.specialization_id.currentValue;
      if(changes.hasOwnProperty('account_status')) this.account_status = changes.account_status.currentValue;
      if(changes.hasOwnProperty('status')) this.status = changes.status.currentValue;
      this.totalDoctors();
    }
  }

  totalDoctors() {
    this.doctorService.total({account_status:this.account_status, status:this.status, search:this.search, specialization_id:this.specialization_id, gender:this.gender, rating:this.rating}).subscribe(
      (response:any)=>{
        this.totalItems = response.data;
        if(this.totalItems > 0) {
          this.getDoctors();
        }
      }
    );
  }

  getDoctors() {
    this.showContentLoader = true;
    this.doctorService.doctors({limit: this.itemsPerPage, page:this.currentPage, account_status:this.account_status, search:this.search,specialization_id:this.specialization_id,gender:this.gender, rating:this.rating, ob_key: "created_date", ob_value:"DESC"}).subscribe(
      (response:any)=>{
        if(response.status) {
          this.doctors = response.data;
        }
        this.showContentLoader = false;
      }
    );
  }

  deleteUser(user_id:string, i:number) {
    Swal.fire({
      title: 'Delete',
      text: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        this.doctorService.delete({user_id:user_id}).subscribe(
          (response:any) => {
            if(response.status) {
              this.alertService.show_alert(response.message);
              this.totalDoctors();
            }
          }
        );
      }
    });

  }

  pageChanged(p:number) {
    this.currentPage = p;
    this.totalDoctors();
  }

  statusChange(user_id:string) {
    this.accountService.account_status({user_id: user_id }).subscribe(
      (response: any) => {
        this.alertService.show_alert(response.message);
        this.getDoctors();
      }
    )
  }

}
