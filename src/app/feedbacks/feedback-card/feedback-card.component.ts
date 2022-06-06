import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

import { ApiService } from '../../services/api.service';
import { CommonService } from '../../services/common.service';
import { FeedbackService } from '../../services/feedback.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector : 'app-feedback-card',
  templateUrl : './feedback-card.component.html',
  encapsulation: ViewEncapsulation.None
})

export class FeedbackCardComponent implements OnInit {
  userType:string='';
  @Input() doctor_id:string='';
  @Input() showContentLoader:boolean=true;
  @Input() currentPage:number=1;
  @Input() itemsPerPage:number=6;
  @Input() totalItems:number=null;
  @Input() feedbacks = [];
  @Input() approved_status:string='';
  @Input() search:string='';
  @Input() rating:string='';
  @Input() from_date='';
  @Input() to_date='';

  constructor (
	private translate: TranslateService,
    private apiService: ApiService,
    private feedbackService: FeedbackService,
    private alertService: AlertService,
    private commonService: CommonService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.total_feedbacks();
    this.apiService.currentUserData.subscribe(
      (userData: any) => {
        this.userType = (userData.group_name) ? userData.group_name : this.commonService.getUserData('group_name');
      }
    );
  }

  ngOnChanges(changes:any) {
    if(changes.hasOwnProperty('approved_status') || changes.hasOwnProperty('search') || changes.hasOwnProperty('rating') || changes.hasOwnProperty('from_date') || changes.hasOwnProperty('to_date') ) {
      if(changes.hasOwnProperty('approved_status')) this.approved_status = changes.approved_status.currentValue;
      if(changes.hasOwnProperty('search')) this.search = changes.search.currentValue;
      if(changes.hasOwnProperty('rating')) this.rating = changes.rating.currentValue;
      if(changes.hasOwnProperty('from_date')) this.from_date = changes.from_date.currentValue;
      if(changes.hasOwnProperty('to_date')) this.to_date = changes.to_date.currentValue;
      this.total_feedbacks();
    }
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
  }

  total_feedbacks() {
    if(this.rating == null || this.rating == undefined) {
      this.rating = '';
    }
    if(this.approved_status == null || this.approved_status == undefined) {
      this.approved_status = '';
    }
    let params = {'doctor_id':this.doctor_id, 'approved_status':this.approved_status,
    'search':this.search, 'rating':this.rating, 'from_date':this.from_date,'to_date':this.to_date,
    'limit':this.itemsPerPage, 'page':this.currentPage};
    this.feedbackService.feedbacks_total(params).subscribe(
      (response:any) => {
        this.totalItems = response.data;
        if(this.totalItems > 0) {
          this.get_feedbacks();
        } else {
          this.showContentLoader = false;
        }
      }
    );
  }

  get_feedbacks() {
    if(this.rating == null || this.rating == undefined) {
      this.rating = '';
    }
    if(this.approved_status == null || this.approved_status == undefined) {
      this.approved_status = '';
    }
    let params = {'doctor_id':this.doctor_id, 'approved_status':this.approved_status,
    'search':this.search, 'rating':this.rating, 'from_date':this.from_date, 'to_date':this.to_date,
    'limit':this.itemsPerPage, 'page':this.currentPage};
    this.showContentLoader = true;
    this.feedbackService.feedbacks(params).subscribe(
      (response:any)=>{
        if(response.status) {
          this.feedbacks = response.data;
        }
        this.showContentLoader = false;
      }
    );
  }

  pageChanged(p:number) {
    this.currentPage = p;
    this.get_feedbacks();
  }

  changeFeedbackStatus(feed_status:string, feed_id:string, index:number) {
    Swal.fire({
      title: 'Chage status to ' + feed_status,
      text: '',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        this.showContentLoader = true
        this.feedbackService.approve_feedback(feed_id, {'approved_status':feed_status}).subscribe(
          (response:any) => {
            if (response.status) {
              this.feedbacks[index].approved_status = feed_status;
              this.alertService.show_alert(response.message);
            }
            this.showContentLoader = false;
          },
          (error:any) => { this.showContentLoader = false; },
          () => { this.showContentLoader = false; }
        );
      }
    });
  }

}
