import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, map } from "rxjs/operators";
import { fromEvent } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { CommonService } from '../services/common.service';
import { EstablishmentService } from '../services/establishment.service';
import { AlertService } from '../services/alert.service';
import { ModalService } from '../services/modal.service';

import { iEstablishment } from "../services/interface/i-establishment";
// import { iUsers } from "../services/interface/i-users";

@Component({
  selector: 'app-establishment',
  templateUrl: './establishment.component.html',
  styleUrls: ['./establishment.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class EstablishmentComponent implements OnInit {
  userType: string = '';

  currentPage = 1;
  itemsPerPage = 8;
  totalItems: number;
  search = '';
  @ViewChild('searchTerm', { static: false }) searchTerm: ElementRef;

  addFormLoader = false;
  addForm: FormGroup;
  emailRegex = this.commonService.emailRegex;

  dataLoader = false;
  establishment: iEstablishment[] = [];

  constructor(
	private translate: TranslateService,
    private title: Title,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private modalService: ModalService,
    private commonService: CommonService,
    private establishmentService: EstablishmentService,
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Clinics & Hospitals');
    this.userType = this.commonService.getUserData('group_name');
    /* const allowedUserTypes = ['Super Admin'];
    if (!allowedUserTypes.includes(this.userType)) {
      this.commonService.userDefaultRoute();
    } */
    this.users_total();
  }

  ngAfterViewInit(): void {
    fromEvent(this.searchTerm.nativeElement, 'keyup').pipe(
      map((event: any) => { return event.target.value; }), debounceTime(1000)
    ).subscribe((text: string) => {
      this.search = text;
      this.users_total();
    });
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.addForm = this.formBuilder.group({
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
      status: ['', [
        Validators.required,
      ]],
    });
  }

  users_total() {
    this.establishmentService.users_total({ "search": this.search }).subscribe(
      (response: any) => {
        this.totalItems = response.data;
        this.users_get()
      }
    );
  }

  users_get() {
    this.dataLoader = true;
    this.establishmentService.users_get({limit: this.itemsPerPage, page: this.currentPage, search: this.search, ob_key: "user_id", ob_value: "DESC" }).subscribe(
      (response: any) => {
        if (response.status) {
          this.establishment = response.data;
        }
        this.dataLoader = false;
      }, (error) => { this.dataLoader = false; }
    )
  }

  pageChanged(p: number) {
    this.currentPage = p;
    this.users_get();
  }

  clearSearch() {
    this.searchTerm.nativeElement.value = '';
    this.search = '';
    this.users_total();
  }

  openAddForm(){
    this.addForm.reset();
    this.addForm.patchValue({
      "status":"Active"
    })
    this.modalService.open_modal('#addEstablishmentModal');
  }

  onSubmitAddForm() {
    if (this.addForm.valid) {
      let postData = new FormData();
      postData.append('token', this.commonService.getUserData('token'));
      postData.append('first_name', this.addForm.value.first_name);
      postData.append('last_name', this.addForm.value.last_name);
      postData.append('email', this.addForm.value.email);
      postData.append('mobile_number', this.addForm.value.mobile_number);
      this.addFormLoader = true;
      this.establishmentService.postData(postData).subscribe(
        (response: any) => {
          if (response.status) {
            this.alertService.show_alert(response.message);
            this.modalService.close_modal('#addEstablishmentModal');
          }
          this.addFormLoader = false;
        },
        (error) => { this.addFormLoader = false; }
      );
    }
  }

}
