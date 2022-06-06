import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, NgForm, FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

import { CmsSliderService } from '../../services/cms-slider.service';
import { CommonService } from '../../services/common.service';
import { ModalService } from '../../services/modal.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-manage-sliders',
  templateUrl: './manage-sliders.component.html',
  styleUrls: ['./manage-sliders.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ManageSlidersComponent implements OnInit {
  @ViewChild('mycrudform', { static: false }) mycrudform: NgForm;
  @ViewChild('myfileInput', { static: false }) myfileInput: ElementRef;
  currentAction = 'Create';
  imageSrc = '';
  imageFile: File;
  crudForm: FormGroup;
  crudFormLoader = false;

  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalItems: number;
  dataLoader = false;
  crudData = [];
  id = '';
  index:number;

  constructor(
	private translate: TranslateService,
    private title: Title,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private CmsSliderService: CmsSliderService,
    private modalService: ModalService,
    private alertService: AlertService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Manage Slider');
    this.crudForm = this.formBuilder.group({
      file: ['', [
        Validators.required
      ]],
      slider_for: ['', [
        Validators.required
      ]],
      sort_order: ['', Validators.required],
      status: ['']
    });
  }


  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.totalCmsSpeciality();
  }

  totalCmsSpeciality() {
    this.CmsSliderService.getCmsTotalSlider({}).subscribe(
      (response: any) => {
        this.totalItems = response.data;
        if (this.totalItems) {
          this.getCMSSlider();
        }
      }
    )
  }

  getCMSSlider() {
    this.dataLoader = true;
    this.CmsSliderService.getCmsSlider('', {limit: this.itemsPerPage, page: this.currentPage}).subscribe(
      (response: any) => {
        if (response.status) {
          this.crudData = response.data;
        }
        this.dataLoader = false;
      },
      (error) => { this.dataLoader = false; }
    )
  }

  onManageCrud(item_id: string, action: string, index: number=null) {
    this.index = index;
    this.currentAction = action;
    this.id = item_id;
    this.imageFile = null;
    this.imageSrc = '';
    if (action == 'Create') {
      this.mycrudform.resetForm();
      this.crudForm.patchValue({
        'status': 'Active'
      });
      this.modalService.open_modal('#CrudModal');
    }

    if (action == 'Update' && item_id) {
      let dbRowData = this.crudData[index];
      this.crudForm.patchValue({
        slider_for: dbRowData.slider_for,
        sort_order: dbRowData.sort_order,
        status: dbRowData.status
      });
      if (dbRowData.file_name) {
        this.imageSrc = dbRowData.file_url;
        this.crudForm.patchValue({
          file: dbRowData.file_url
        });
      }
      this.modalService.open_modal('#CrudModal');
    }
  }

  onSubmitCrudForm() {
    if (this.crudForm.valid) {
      let postData = new FormData();
      postData.append('token', this.commonService.getUserData('token'));
      //postData.append('slider_id', this.id);
      postData.append('action', this.currentAction);
      if(this.imageFile){
        postData.append('file', this.imageFile);
      }
      postData.append('name', this.crudForm.value.name);
      postData.append('sort_order', this.crudForm.value.sort_order);
      postData.append('status', this.crudForm.value.status);
      this.crudFormLoader = true;
      this.CmsSliderService.cmsSliderCRUD(this.id, postData).subscribe(
        (response: any) => {
          if (response.status) {
            this.modalService.close_modal('#CrudModal');
            this.alertService.show_alert(response.message);
            if(this.currentAction == 'Update') {
              if (this.imageFile) {
                this.crudData[this.index]['file'] = this.imageFile.name;
                this.crudData[this.index]['file_url'] = this.imageSrc;
              }
              this.crudData[this.index]['sort_order'] = this.crudForm.value.sort_order;
              this.crudData[this.index]['status'] = this.crudForm.value.status;
            } else {
              this.getCMSSlider();
            }
          }
          this.crudFormLoader = false;
        },
        (error) => { this.crudFormLoader = false; }
      );
    }
  }

  deleteCrudData(item_id:string, index:number) {
    Swal.fire({
      title: 'Delete',
      text: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        let postData = new FormData();
        postData.append('token', this.commonService.getUserData('token'));
        postData.append('action', 'Delete');
        //postData.append('slider_id', item_id);
        this.CmsSliderService.cmsSliderCRUD(item_id, postData).subscribe(
          (response: any) => {
            if (response.status) {
              this.crudData.splice(index, 1);
            }
          }
        );
      }
    });
  }

  onFileInput(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      const file = fileInput.target.files[0];

      const max_height = 2000;
      const max_width = 2000;

      const allowed_types = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowed_types.includes(file.type)) {
        this.alertService.showValidationErrors('Only JPG and PNG files are allowed');
        return false;
      }

      const max_size = 1024 * 1024 * 1;
      if (file.size > max_size) {
        this.alertService.showValidationErrors('Maximum size allowed is 1 MB');
        return false;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const image = new Image();
        image.src = e.target.result;
        image.onload = rs => {
          const img_height = rs.currentTarget['height'];
          const img_width = rs.currentTarget['width'];
          if (img_height > max_height && img_width > max_width) {
            //this.alertService.showValidationErrors('Maximum dimentions allowed ' + max_height + '*' + max_width + 'px');
            //return false;
          }
          this.imageFile = file;
          this.imageSrc = e.target.result;
          this.crudForm.patchValue({
            file: this.imageSrc
          });
          this.myfileInput.nativeElement.value = '';
        };
      };
      reader.readAsDataURL(file);
    }
  }

  paginate(up: number) {
    this.currentPage = up;
    this.getCMSSlider();
  }

}
