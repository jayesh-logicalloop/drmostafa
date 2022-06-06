import { Component, OnInit, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, map } from "rxjs/operators";
import { fromEvent } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { ApiService } from    'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { ModalService } from 'src/app/services/modal.service';
import { AlertService } from 'src/app/services/alert.service';
import { AdministrationService } from 'src/app/services/administration.service';

import { iUsers } from 'src/app/services/interface/i-users';

@Component({
  selector: 'app-administrators',
  templateUrl: './administrators.component.html',
  styleUrls: ['./administrators.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AdministratorsComponent implements OnInit {

  userType = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalItems: number;

  @ViewChild('searchEle', {static: false}) searchEle: ElementRef;
  search = '';
  status = '';
  dataLoader = false;
  admins:iUsers[] = [];


  @ViewChild('ngaddform', {static: false}) ngaddform: NgForm;
  addForm: FormGroup;
  addFormLoader = false;
  emailRegex = this.commonService.emailRegex;
  id='';

  constructor(
	private translate: TranslateService,
    private title: Title,
    private formBuilder: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private commonService: CommonService,
    private modalService: ModalService,
    private alertService: AlertService,
    private administrationService: AdministrationService,   
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Manage administrators');

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
      first_name: ['', [Validators.required,  Validators.minLength(2), Validators.maxLength(100)]],
      last_name: ['', [Validators.required,  Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required,  Validators.email, Validators.pattern(this.emailRegex), Validators.maxLength(100)]],
      mobile_number: ['', [Validators.required,  Validators.minLength(6), Validators.maxLength(100)]],
      status:['', [Validators.required]],
      password:['', [Validators.required,  Validators.minLength(2), Validators.maxLength(10)]],
      group_id:['', [Validators.required]],      
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
      this.getTotalItems();     
    });
  }

  getTotalItems() {
    this.administrationService.total({search: this.search}).subscribe(
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
      limit:  this.itemsPerPage,
      page:   this.currentPage,
      ob_key: 'created_date',
      ob_value: 'DESC'
    };
    this.administrationService.get('', params).subscribe(
      (response: any) => {
        this.admins = response.data;
        this.dataLoader = false;
      },
      (error) => { this.dataLoader = false; },
    )
  }

  openAddForm() {
    this.id = '';
    this.ngaddform.resetForm();
    this.addForm.reset();
    this.addForm.patchValue({
      first_name: '',
      last_name: '',
      email: '',
      mobile_number: '',      
      group_id: '',
      status: '',
      password: ''
    });
    this.modalService.open_modal("#addFormModal");
  }

  openUpdateForm(user:any) {
    console.log(user);
    this.id = user.user_id;
    this.addForm.patchValue({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      mobile_number: user.mobile_number,      
      group_id: user.group_id,
      status: user.status,
      password: 'Info9179@'
    });
    //this.ngaddform.resetForm();
    this.modalService.open_modal("#addFormModal");
  }

  onSubmitAddForm() {
    if (this.addForm.valid) {
      let postData = new FormData();    
      postData.append("token", this.commonService.getUserData("token"));
      postData.append("group_id", this.addForm.value.group_id);
      postData.append("first_name", this.addForm.value.first_name);
      postData.append("last_name", this.addForm.value.last_name);
      postData.append("email", this.addForm.value.email);
      postData.append("mobile_number", this.addForm.value.mobile_number);
      postData.append("status", this.addForm.value.status);
      postData.append("password", this.addForm.value.password);
      
      this.addFormLoader = true;

      this.administrationService.create(this.id, postData).subscribe(
        (resp: any) => {   
          if (resp.status) {           
            this.modalService.close_modal("#addFormModal");
            this.alertService.show_alert(resp.message);
            this.getTotalItems();
            this.router.navigate(['/administration/administrators']);
          }
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
