import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { fromEvent } from 'rxjs';
import { debounceTime, map } from "rxjs/operators";
import { TranslateService } from '@ngx-translate/core';

import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { WalkthroughService } from 'src/app/services/walkthrough.service';
import { ModalService } from 'src/app/services/modal.service';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-walkthrough',
  templateUrl: './walkthrough.component.html',
  styleUrls: ['./walkthrough.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class WalkthroughComponent implements OnInit {

  userType = '';

  currentPage = 1;
  itemsPerPage = 5;
  totalItems: number;

  @ViewChild('ngsearchinput', { static: false }) ngsearchinput: ElementRef;
  search = '';

  id='';
  index:number
  dataLoader = false;
  wtData:any[] = [];

  @ViewChild('ng_add_update_form', {static: false}) ng_add_update_form: NgForm;
  addUpdateForm: FormGroup;
  addUpdateFormLoader = false;

  @ViewChild('ng_image_input', {static: false}) ng_image_input: ElementRef;
  imageSrc = '';
  imageFileInput: File;

  constructor(
	private translate: TranslateService,
    private title: Title,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private commonService: CommonService,
    private walkthroughService: WalkthroughService,
    private modalService: ModalService,
    private alertService: AlertService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Walkthrough Screens');
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
      title: ['', [
        Validators.required,
        Validators.maxLength(100)
      ]],
      description: ['', [
        Validators.required,
        Validators.maxLength(250)
      ]],
      image: ['',[
        Validators.required,
      ]],
      sort_order: ['', [
        Validators.required
      ]]
    });
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
    this.getTotalWTData();
  }

  ngAfterViewInit(): void {
    /* fromEvent(this.ngsearchinput.nativeElement, 'keyup').pipe(
      map((event: any) => { return event.target.value; }), debounceTime(1000)
    ).subscribe((text: string) => {
      this.search = text;
      this.currentPage = 1;
      this.getTotalWTData();
    }); */
  }

  clearSearch() {
    this.ngsearchinput.nativeElement.value = '';
    this.search = '';
    this.getTotalWTData();
  }

  pageChanged(p: number) {
    this.currentPage = p;
    this.getTotalWTData();
  }

  getTotalWTData() {
    this.walkthroughService.total({search: this.search}).subscribe(
      (response: any) => {
        this.totalItems = response.data;
        this.getWTData();
      }
    );
  }

  getWTData(id = '') {
    this.dataLoader = true;
    let params = {
      limit: this.itemsPerPage,
      page: this.currentPage,
      search: this.search
    };
    this.walkthroughService.get(id, params).subscribe(
      (response: any) => {
        if (response.status) {
          this.wtData = response.data;
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
    this.modalService.open_modal("#addUpdateFormModal");
  }

  openUpdateForm(id:string, i: number) {
    this.id = id;
    this.index = i;
    this.clearImage();
    let data = this.wtData[i];
    //this.ng_add_update_form.resetForm();

    this.addUpdateForm.patchValue({
      sort_order: data.sort_order,
      title: data.title,
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
      formData.append('sort_order', this.addUpdateForm.value.sort_order);
      formData.append('title', this.addUpdateForm.value.title);
      formData.append('description', this.addUpdateForm.value.description);
      if (this.imageFileInput) {
        formData.append('image', this.imageFileInput);
      }
      this.addUpdateFormLoader = true;
      this.walkthroughService.create_update(this.id, formData).subscribe(
        (response: any) => {
          if (response.status) {
            this.modalService.close_modal('#addUpdateFormModal');
            this.alertService.show_alert(response.message);
            this.getTotalWTData();
          }
          this.addUpdateFormLoader = false;
        },
        (error) => { this.addUpdateFormLoader = false; }
      );
    }
  }

  onDeleteWTData(id:string) {
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
        this.walkthroughService.delete(id).subscribe(
          (response: any) => {
            if (response.status) {
              this.alertService.show_alert(response.message);
            }
            this.getTotalWTData();
          },
          (error) => { this.dataLoader = false; },
        );
      }
    });
  }

  deleteMedia() {
    this.addUpdateFormLoader = true;
    this.walkthroughService.delete_media(this.id, {file:'image'}).subscribe(
      (response: any) => {
        if (response.status) {
          this.alertService.show_alert(response.message);
        }
        this.addUpdateFormLoader = false;
        this.getWTData();
        this.clearImage();
      },
      (error) => { this.addUpdateFormLoader = false; },
    );
  }

  onChangeImage(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      let file = fileInput.target.files[0];
      const max_height = 2000;
      const max_width = 2000;

      const allowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedFileTypes.includes(file.type)) {
        this.alertService.showValidationErrors(this.only_jpg_png_files_allowed);
        return false;
      }

      const allowedMaxSize = 2 * 1024 * 1024;
      if (file.size > allowedMaxSize) {
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

          if(this.id) {
            this.addUpdateFormLoader = true;
            let formData = new FormData();
            formData.append('token', this.commonService.getUserData('token'));
            formData.append('image', this.imageFileInput);
            this.walkthroughService.update_media(this.id, formData).subscribe(
              (response:any) => {
                this.alertService.show_alert(response.message);
                this.addUpdateFormLoader = false;
                this.getWTData();
              },
              (error) => {
                this.addUpdateFormLoader = false;
              }
            );
          }
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
    this.addUpdateForm.patchValue({'image':''});
  }

}
