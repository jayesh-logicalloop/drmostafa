import { Component, OnInit, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, map } from "rxjs/operators";
import { fromEvent } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { ApiService } from '../services/api.service';
import { CommonService } from '../services/common.service';
import { CourseService } from '../services/course.service';
import { ModalService } from '../services/modal.service';
import { AlertService } from '../services/alert.service';

import { iCourse } from '../services/interface/i-course';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CourseComponent implements OnInit {
  userType = '';

  currentPage = 1;
  itemsPerPage = 10;
  totalItems: number;

  @ViewChild('searchEle', {static: false}) searchEle: ElementRef;
  search = '';
  status = '';
  dataLoader = false;
  courses:iCourse[] = [];

  @ViewChild('ngaddform', {static: false}) ngaddform: NgForm;
  addForm: FormGroup;
  addFormLoader = false;

  constructor(
	private translate: TranslateService,
    private title: Title,
    private formBuilder: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private commonService: CommonService,
    private courseService: CourseService,
    private alertService: AlertService,
    private modalService: ModalService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Manage Courses');
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
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]]
    });
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.getTotalItems();
  }

  ngAfterViewInit(): void {
    fromEvent(this.searchEle.nativeElement, 'keyup').pipe(
      map((event: any) => {return event.target.value;}), debounceTime(1000)
    ).subscribe((text: string) => {
      this.search = text;
      if (this.search.length > 1) {
        this.getTotalItems();
      }
    });
  }

  getTotalItems() {
    this.courseService.total({search: this.search, status: this.status}).subscribe(
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
    this.courseService.get('', params).subscribe(
      (response: any) => {
        this.courses = response.data;
        this.dataLoader = false;
      },
      (error) => { this.dataLoader = false; },
    )
  }

  openAddForm() {
    this.ngaddform.resetForm();
    this.addForm.reset();
    this.addForm.patchValue({
      item_type: '',
      item_unit: '',
      status: 'Active'
    });
    this.modalService.open_modal("#addFormModal");
  }

  onSubmitAddForm() {
    if (this.addForm.valid) {
      let postData = new FormData();
      postData.append("token", this.commonService.getUserData("token"));
      postData.append("name", this.addForm.value.name);
      this.addFormLoader = true;
      this.courseService.create(postData).subscribe(
        (response: any) => {
          this.modalService.close_modal("#addFormModal");
          this.alertService.show_alert(response.message);
          this.router.navigate(['/course/update/'+response.data]);
          this.addFormLoader = false;
        },
        (error) => { this.addFormLoader = false; }
      );
    }
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
