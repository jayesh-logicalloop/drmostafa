import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CareersService } from '../services/careers.service';
import { CommonService } from '../services/common.service';
import { ModalService } from '../services/modal.service';
import { AlertService } from '../services/alert.service';
import { debounceTime, map } from "rxjs/operators";
import { fromEvent } from 'rxjs';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-careers',
  templateUrl: './careers.component.html',
  styleUrls: ['./careers.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CareersComponent implements OnInit {
  @ViewChild('searchTerm', {static: false}) searchTerm: ElementRef;

  career_id: number = null;
  c_index: number = null;
  careerData = [];
  search: string = '';
  userType: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalItems: number;
  appLoader: boolean = false

  constructor(
	private translate: TranslateService,
    private title: Title,
    private careersService: CareersService,
    private alertService: AlertService,
    private commonService: CommonService,
    private modalService: ModalService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Careers');
  }
  
  addFormAction:boolean=false
  careerDetail = {
    "id": "",
    "department": "",
    "full_name": "",
    "email": "",
    "mobile_number": "",
    "message": "",
    "file": "",
    "created_date": "",
    "user_id": "",
    "file_url": "",
    "file_path": "",
    "gender":""
  };

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.total_careers();
  }

  ngAfterViewInit(): void {
    fromEvent(this.searchTerm.nativeElement, 'keyup').pipe(
      map((event: any) => {return event.target.value;}),debounceTime(1000)
    ).subscribe((text: string) => {
      this.search = text;
      this.total_careers();
    });
  }

  total_careers() {
    this.careersService.careersTotal({ "search": this.search }).subscribe(
      (response: any) => {
        this.totalItems = response.data;
        this.get_careers();
      }
    );
  }

  get_careers() {
    this.careersService.careersGet({ "limit": this.itemsPerPage, "page": this.currentPage, "search": this.search, "ob_key": "created_date", "ob_value": "DESC" }).subscribe(
      (response: any) => {
        if (response.status) {
          this.careerData = response.data;
        } else {
          this.careerData = [];
        }
      }
    )
  }

  onDeleteCareer(career_id:string,c_index:number) {
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
        this.careersService.careersDelete(career_id).subscribe(
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
    this.get_careers();
  }
  viewCareers(item){
    this.careerDetail = item;
    this.modalService.open_modal('#viewModal')
  }
}
