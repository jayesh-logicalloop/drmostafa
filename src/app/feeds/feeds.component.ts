import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { fromEvent } from 'rxjs';
import { debounceTime, map } from "rxjs/operators";
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { FeedService } from 'src/app/services/feed.service';
import { ModalService } from 'src/app/services/modal.service';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-feeds',
  templateUrl: './feeds.component.html',
  styleUrls: ['./feeds.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class FeedsComponent implements OnInit {

  userType = '';

  currentPage = 1;
  itemsPerPage = 5;
  totalItems: number;

  @ViewChild('ngsearchinput', { static: false }) ngsearchinput: ElementRef;
  search = '';

  id='';
  index:number
  dataLoader = false;
  feeds:any[] = [];

  @ViewChild('ng_add_update_form', {static: false}) ng_add_update_form: NgForm;
  addUpdateForm: FormGroup;
  addUpdateFormLoader = false;

  constructor(
	private translate: TranslateService,
    private title: Title,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private commonService: CommonService,
    private feedService: FeedService,
    private modalService: ModalService,
    private alertService: AlertService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Feeds');
    this.apiService.currentUserData.subscribe(
      (userData: any) => {
        this.userType = (userData.group_name) ? userData.group_name : this.commonService.getUserData('group_name');
        /* const allowedUserTypes = ['Super Admin', 'Doctor'];
        if (!allowedUserTypes.includes(this.userType)) {
          this.commonService.userDefaultRoute();
        } */
      }
    );

    this.addUpdateForm = this.formBuilder.group({
      feed: ['', [
        Validators.required,
        Validators.maxLength(500)
      ]]
    });
  }

  deleteLabel='Delete';
  areYouSureLabel='Are you sure?';
  okLabel='OK';
  cancelLabel='Cancel';
  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.translate.stream(['']).subscribe(translations => {
      this.deleteLabel = this.translate.instant('delete');
      this.areYouSureLabel = this.translate.instant('are_you_sure');
      this.okLabel = this.translate.instant('ok');
      this.cancelLabel = this.translate.instant('cancel');
    });
    this.getTotalFeeds();
  }

  ngAfterViewInit(): void {
    /* fromEvent(this.ngsearchinput.nativeElement, 'keyup').pipe(
      map((event: any) => { return event.target.value; }), debounceTime(1000)
    ).subscribe((text: string) => {
      this.search = text;
      this.currentPage = 1;
      this.getTotalFeeds();
    }); */
  }

  clearSearch() {
    this.ngsearchinput.nativeElement.value = '';
    this.search = '';
    this.getTotalFeeds();
  }

  pageChanged(p: number) {
    this.currentPage = p;
    this.getTotalFeeds();
  }

  getTotalFeeds() {
    this.feedService.total({search: this.search}).subscribe(
      (response: any) => {
        this.totalItems = response.data;
        this.getFeeds();
      }
    );
  }

  getFeeds(id = '') {
    this.dataLoader = true;
    let params = {
      limit: this.itemsPerPage,
      page: this.currentPage,
      search: this.search
    };
    this.feedService.get(id, params).subscribe(
      (response: any) => {
        if (response.status) {
          this.feeds = response.data;
        }
        this.dataLoader = false;
      },
      (error) => { this.dataLoader = false; }
    )
  }

  openAddForm() {
    this.id = '';
    this.index = null;
    this.addUpdateForm.reset();
    this.ng_add_update_form.resetForm();
    this.modalService.open_modal("#addUpdateFormModal");
  }

  openUpdateForm(id:string, i: number) {
    this.id = id;
    this.index = i;
    let data = this.feeds[i];
    this.ng_add_update_form.resetForm();

    this.addUpdateForm.patchValue({
      feed: data.feed,
    });
    this.modalService.open_modal('#addUpdateFormModal');
  }

  onSubmitAddUpdateForm() {
    if (this.addUpdateForm.valid) {
      let formData = new FormData();
      formData.append('token', this.commonService.getUserData('token'));
      formData.append('feed', this.addUpdateForm.value.feed);
      this.addUpdateFormLoader = true;
      this.feedService.create_update(this.id, formData).subscribe(
        (response: any) => {
          if (response.status) {
            this.modalService.close_modal('#addUpdateFormModal');
            this.alertService.show_alert(response.message);
            this.getTotalFeeds();
          }
          this.addUpdateFormLoader = false;
        },
        (error) => { this.addUpdateFormLoader = false; }
      );
    }
  }

  onDeleteFeed(id:string) {
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
        this.feedService.delete(id).subscribe(
          (response: any) => {
            if (response.status) {
              this.alertService.show_alert(response.message);
            }
            this.getTotalFeeds();
          },
          (error) => { this.dataLoader = false; },
        );
      }
    });
  }

}
