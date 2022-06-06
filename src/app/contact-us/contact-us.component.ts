import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ContactUsService } from '../services/contact-us.service';
import { ModalService } from '../services/modal.service';
import { AlertService } from '../services/alert.service';
import { debounceTime, map } from "rxjs/operators";
import { fromEvent } from 'rxjs';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css']
})
export class ContactUsComponent implements OnInit {
  @ViewChild('searchTerm', { static: false }) searchTerm: ElementRef;

  careerData = [];
  search: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalItems: number;
  appLoader: boolean = false

  constructor(
	private commonService: CommonService,
	private translate: TranslateService,
    private title: Title,
    private contactUsService: ContactUsService,
    private alertService: AlertService,
    private modalService: ModalService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Contact Us');
  }
  addFormAction: boolean = false
  contactDetail = {
    "id": "",
    "full_name": "",
    "email": "",
    "mobile_number": "",
    "message": "",
    "user_type": "",
    "interested_in": "",
    "country": "",
    "city": "",
    "subject":"",
    "created_date":""
  };

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.total();
  }

  ngAfterViewInit(): void {
    fromEvent(this.searchTerm.nativeElement, 'keyup').pipe(
      map((event: any) => { return event.target.value; }), debounceTime(1000)
    ).subscribe((text: string) => {
      this.search = text;
      this.total();
    });
  }

  total() {
    this.contactUsService.total({ "search": this.search }).subscribe(
      (response: any) => {
        this.totalItems = response.data;
        this.getData();
      }
    );
  }

  getData() {
    this.contactUsService.getData({ "limit": this.itemsPerPage, "page": this.currentPage, "search": this.search, "ob_key": "created_date", "ob_value": "DESC" }).subscribe(
      (response: any) => {
        if (response.status) {
          this.careerData = response.data;
        } else {
          this.careerData = [];
        }
      }
    )
  }

  onDelete(career_id: string, c_index) {
    Swal.fire({
      title: 'Delete',
      text: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        this.appLoader = true;
        this.contactUsService.deleteData(career_id).subscribe(
          (response: any) => {
            if (response.status) {
              this.alertService.show_alert(response.message);
              this.careerData.splice(c_index, 1);
            }
            this.appLoader = false;
          },
          (error) => { this.appLoader = false; },
          () => { this.appLoader = false; }
        )
      }
    });
  }

  pageChanged(p: number) {
    this.currentPage = p;
    this.getData();
  }
  viewData(item) {
    this.contactDetail = item;
    this.modalService.open_modal('#viewModal')
  }

}
