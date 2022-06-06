import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { fromEvent } from 'rxjs';
import { debounceTime, map } from "rxjs/operators";
import { TranslateService } from '@ngx-translate/core';

import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { AnnouncementService } from 'src/app/services/announcement.service';
import { ModalService } from 'src/app/services/modal.service';
import { AlertService } from 'src/app/services/alert.service';
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";

@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AnnouncementsComponent implements OnInit {

  userType = '';

  currentPage = 1;
  itemsPerPage = 5;
  totalItems: number;

  @ViewChild('ngsearchinput', { static: false }) ngsearchinput: ElementRef;
  search = '';

  id='';
  index:number
  dataLoader = false;
  announcements:any[] = [];

  @ViewChild('ng_add_update_form', {static: false}) ng_add_update_form: NgForm;
  addUpdateForm: FormGroup;
  addUpdateFormLoader = false;

  @ViewChild('ng_image_input', {static: false}) ng_image_input: ElementRef;
  imageSrc = '';
  imageFileInput: File;


  statusArray = [{value:'active',label:'Active'},{value:'inactive',label:'InActive'}]

  constructor(
	private translate: TranslateService,
    private title: Title,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private commonService: CommonService,
    private announcementService: AnnouncementService,
    private modalService: ModalService,
    private alertService: AlertService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Announcements');
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
      // type: ['Text', [
      //   Validators.required
      // ]],
      // title: ['', [
      //   Validators.required,
      //   Validators.maxLength(100)
      // ]],
      description: [],
      image: [''],
      url : [''],
      status:['']
    });

    // this.addUpdateForm.get('type').valueChanges.subscribe(value => {
    //   if (value == 'Image') {
    //     this.addUpdateForm.get('title').clearValidators();
    //     this.addUpdateForm.get('description').clearValidators();
    //     this.addUpdateForm.get('image').setValidators([Validators.required]);
    //   } else {
    //     this.addUpdateForm.get('image').clearValidators();
    //     this.addUpdateForm.get('title').setValidators([Validators.required, Validators.maxLength(100)]);
    //     this.addUpdateForm.get('description').setValidators([Validators.required, Validators.maxLength(250)]);
    //   }
    //   this.addUpdateForm.get('image').updateValueAndValidity();
    //   this.addUpdateForm.get('title').updateValueAndValidity();
    //   this.addUpdateForm.get('description').updateValueAndValidity();
    // });
  }

  deleteLabel='Delete';
  areYouSureLabel='Are you sure?';
  okLabel='OK';
  cancelLabel='Cancel';
  only_jpg_png_files_allowed='Only JPG or PNG files allowed';
  file_size_should_not_be_greater_than_2_mb='File size should not be greater than 2 MB';
  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.translate.stream(['']).subscribe(translations => {
      this.deleteLabel = this.translate.instant('delete');
      this.areYouSureLabel = this.translate.instant('are_you_sure');
      this.okLabel = this.translate.instant('ok');
      this.cancelLabel = this.translate.instant('cancel');
      this.only_jpg_png_files_allowed = this.translate.instant('only_jpg_png_files_allowed');
      this.file_size_should_not_be_greater_than_2_mb = this.translate.instant('file_size_should_not_be_greater_than_2_mb');
    });
    this.getTotalAnnouncements();
  }

  ngAfterViewInit(): void {
    /* fromEvent(this.ngsearchinput.nativeElement, 'keyup').pipe(
      map((event: any) => { return event.target.value; }), debounceTime(1000)
    ).subscribe((text: string) => {
      this.search = text;
      this.currentPage = 1;
      this.getTotalAnnouncements();
    }); */
  }

  clearSearch() {
    this.ngsearchinput.nativeElement.value = '';
    this.search = '';
    this.getTotalAnnouncements();
  }

  pageChanged(p: number) {
    this.currentPage = p;
    this.getTotalAnnouncements();
  }

  getTotalAnnouncements() {
    this.announcementService.total({search: this.search}).subscribe(
      (response: any) => {
        this.totalItems = response.data;
        this.getAnnouncements();
      }
    );
  }

  getAnnouncements(id = '') {
    this.dataLoader = true;
    let params = {
      limit: this.itemsPerPage,
      page: this.currentPage,
      search: this.search
    };
    this.announcementService.get(id, params).subscribe(
      (response: any) => {
        if (response.status) {
          this.announcements = response.data;
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
    this.clearImage();
    // this.addUpdateForm.patchValue({
    //   type: 'Text'
    // });
    this.modalService.open_modal("#addUpdateFormModal");
  }

  openUpdateForm(id:string, i: number) {
    this.id = id;
    this.index = i;
    this.clearImage();
    let data = this.announcements[i];
    this.ng_add_update_form.resetForm();

    this.addUpdateForm.patchValue({
      // type: data.type,
      // title: data.title,
      image: data.image,
      description: data.description
    });
    if (data.image) {
      this.imageSrc = data.image_url;
    }
    this.modalService.open_modal('#addUpdateFormModal');
  }

  onSubmitAddUpdateForm() {
    if (this.addUpdateForm.valid) {
      let formData = new FormData();
      formData.append('token', this.commonService.getUserData('token'));
      formData.append('type', "Image");
      // formData.append('title', null);
      formData.append('status', this.addUpdateForm.value.status);
      formData.append('url', this.addUpdateForm.value.url);
      formData.append('description', this.addUpdateForm.value.description);
      formData.append('redirect_url', this.addUpdateForm.value.url);
      // if (this.imageFileInput) {
        formData.append('image', this.imageFileInput);
      // }
      this.addUpdateFormLoader = true;
      this.announcementService.create_update(this.id, formData).subscribe(
        (response: any) => {
          if (response.status) {
            this.modalService.close_modal('#addUpdateFormModal');
            this.alertService.show_alert(response.message);
            this.getTotalAnnouncements();
          }
          this.addUpdateFormLoader = false;
        },
        (error) => { this.addUpdateFormLoader = false; }
      );
    }
  }

  onDeleteAnnouncement(id:string) {
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
        this.announcementService.delete(id).subscribe(
          (response: any) => {
            if (response.status) {
              this.alertService.show_alert(response.message);
            }
            this.getTotalAnnouncements();
          },
          (error) => { this.dataLoader = false; },
        );
      }
    });
  }

  onChangeImage(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      let file = fileInput.target.files[0];
      const max_height = 2000;
      const max_width = 2000;

      const allowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedFileTypes.includes(file.type)) {
        this.ng_image_input.nativeElement.value = '';
        this.alertService.showValidationErrors(this.only_jpg_png_files_allowed);
        return false;
      }

      const allowedMaxSize = 2 * 1024 * 1024;
      if (file.size > allowedMaxSize) {
        this.ng_image_input.nativeElement.value = '';
        this.alertService.showValidationErrors(this.file_size_should_not_be_greater_than_2_mb);
        return false;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const provider_image = new Image();
        provider_image.src = e.target.result;
        provider_image.onload = rs => {
          const img_height = rs.currentTarget['height'];
          const img_width = rs.currentTarget['width'];

          if (img_height > max_height && img_width > max_width) {
            //this.alertService.showValidationErrors('Maximum dimentions allowed ' + max_height + '*' + max_width + 'px');
            //return false;
          }
          this.imageSrc = e.target.result;
          this.imageFileInput = file;
          this.addUpdateForm.patchValue({'image': this.imageSrc});
        };
      };
      reader.readAsDataURL(file);
      this.ng_image_input.nativeElement.value = '';
    }
  }

  clearImage() {
    this.imageSrc = '';
    this.imageFileInput = null;
    this.ng_image_input.nativeElement.value = '';
  }


  onDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.announcements, event.previousIndex, event.currentIndex);
    this.announcements.forEach((announcements, idx) => {
      announcements.order = idx + 1;
    });
  }

}
