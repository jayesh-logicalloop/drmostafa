import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { CommonService } from '../services/common.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-feedbacks',
  templateUrl: './feedbacks.component.html',
  styleUrls: ['./feedbacks.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class FeedbacksComponent implements OnInit {
  userType:string;
  popoverToggle:boolean=false;
  searchForm:FormGroup;
  approved_status:string;
  search:string='';
  rating:number=null;
  activeRating:number=null;
  from_date='';
  to_date='';

  constructor(
	private translate: TranslateService,
    private title: Title,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private commonService: CommonService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Feedbacks');
    this.apiService.currentUserData.subscribe(
      (userData: any) => {
        this.userType = (userData.group_name) ? userData.group_name : this.commonService.getUserData('group_name');
      }
    );
    this.searchForm = this.formBuilder.group({
      approved_status: [''],
      search: [''],
      from_date:[''],
      to_date:[''],
    });
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
  }

  togglePopover() {
    if(this.popoverToggle) this.popoverToggle = false;
    else this.popoverToggle = true;
  }

  changeRating(r:number) {
    this.activeRating = r;
  }

  clearFilter() {
    this.searchForm.patchValue({'approved_status':'', 'rating':'', 'search':'', 'from_date':'','to_date':''});
    this.approved_status = '';
    this.search = '';
    this.rating = null;
    this.activeRating = null;
    this.from_date='';
    this.to_date='';
    this.togglePopover();
  }

  onSubmitSearchForm() {
    this.search = this.searchForm.value.search;
    this.approved_status = this.searchForm.value.approved_status;
    this.rating = this.activeRating;
    if(this.searchForm.value.from_date) {
      this.from_date = this.commonService.dateFormat(this.searchForm.value.from_date);
    }
    if(this.searchForm.value.to_date) {
      this.to_date = this.commonService.dateFormat(this.searchForm.value.to_date);
    }
    this.togglePopover();
  }

}
