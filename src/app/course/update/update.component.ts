import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

import { CommonService } from '../../services/common.service';
import { CourseService } from '../../services/course.service';
import { AlertService } from '../../services/alert.service';
import { ModalService } from '../../services/modal.service';

import { iCourse } from '../../services/interface/i-course';
import { iCourseItem } from '../../services/interface/i-course-item';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class UpdateComponent implements OnInit {

  course_id = '';
  item_id = '';
  item_index:number;
  dataLoader = true;
  course:iCourse;
  course_items:iCourseItem[] = [];
  image_src='';

  @ViewChild('ngimagefileinput', {static: false}) ngimagefileinput: ElementRef;
  @ViewChild('ngvideofileinput', {static: false}) ngvideofileinput: ElementRef;
  @ViewChild('ngupdateform', {static: false}) ngupdateform: NgForm;
  updateForm: FormGroup;
  updateFormLoader = false;

  @ViewChild('ngaddnewvideoform', {static: false}) ngaddnewvideoform: NgForm;
  addNewVideoForm: FormGroup;
  addNewVideoFormLoader = false;

  @ViewChild('ngupdatevideoform', {static: false}) ngupdatevideoform: NgForm;
  updateVideoForm: FormGroup;
  updateVideoFormLoader = false;

  constructor(
	private translate: TranslateService,
    private title: Title,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private commonService: CommonService,
    private courseService: CourseService,
    private alertService: AlertService,
    private modalService: ModalService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Update Course');
    const userType = this.commonService.getUserData('group_name');
    /* const allowedUserTypes = ['Super Admin', 'Doctor'];
    if (!allowedUserTypes.includes(userType)) {
      this.commonService.userDefaultRoute();
    } */

    this.activatedRoute.params.subscribe(routeParams => {
      this.course_id = routeParams.id;
    });

    this.updateForm = this.formBuilder.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      author: ['', [
        Validators.required
      ]],
      duration: ['', [
        Validators.required
      ]],
      language: ['', [
        Validators.required
      ]],
      price: ['', [
        Validators.required
      ]],
      offer_price: [''],
      description: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(250)
      ]],
      status: ['', [
        Validators.required
      ]]
    });

    this.addNewVideoForm = this.formBuilder.group({
      title: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      description: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(250)
      ]]
    });

    this.updateVideoForm = this.formBuilder.group({
      title: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      description: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(250)
      ]]
    });
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.getCourseDetail();
  }

  getCourseDetail() {
    this.dataLoader = true;
    this.courseService.get(this.course_id).subscribe(
      (response: any) => {
        if(response.status) {
          this.course = response.data;
          this.course_items = response.data.items;
          this.updateForm.patchValue({
            name: this.course.name,
            author: this.course.author,
            duration: this.course.duration,
            language: this.course.language,
            image: this.course.image,
            price: this.course.price,
            offer_price: this.course.offer_price,
            description: this.course.description,
            status: this.course.status
          });
          this.image_src = this.course.image ? this.course.image_url : '';
          this.dataLoader = false;
        } else {
          this.router.navigate(['/courses']);
        }
      },
      (error) => { this.dataLoader = false; },
    );
  }

  onSubmitUpdateForm() {
    if (this.updateForm.valid) {
      let formData = {
        token: this.commonService.getUserData('token'),
        name: this.updateForm.value.name,
        author: this.updateForm.value.author,
        duration: this.updateForm.value.duration,
        language: this.updateForm.value.language,
        price: this.updateForm.value.price,
        offer_price: this.updateForm.value.offer_price,
        description: this.updateForm.value.description,
        status: this.updateForm.value.status,
        course_id: this.course_id
      };

      this.updateFormLoader = true;
      this.courseService.update(this.course_id, formData).subscribe(
        (response: any) => {
          if (response.status) {
            this.alertService.show_alert(response.message);
            this.updateForm.reset();
          }
          this.updateFormLoader = false;
        },
        (error) => { this.updateFormLoader = false; }
      );
    }
  }

  onChangeCourseImage(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      let file = fileInput.target.files[0];
      const max_height = 2000;
      const max_width = 2000;

      const allowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedFileTypes.includes(file.type)) {
        this.alertService.showValidationErrors('Only JPG or PNG files are allowed');
        return false;
      }

      const allowedMaxSize = 0.25 * 1024 * 1024;
      if (file.size > allowedMaxSize) {
        this.alertService.showValidationErrors('Maximum size allowed is 500 KB');
        return false;
      }

      this.updateFormLoader = true;
      let formData = new FormData();
      formData.append('token', this.commonService.getUserData('token'));
      formData.append('image', file);

      this.courseService.update_media(this.course_id, '', formData).subscribe(
        (response:any) => {
          if(response.status) {
            this.image_src = response.data;
          }
          this.updateFormLoader = false;
        },
        (error) => { this.updateFormLoader = false; },
        () => { this.updateFormLoader = false; }
      );
    }
  }

  openNewVideForm() {
    this.ngaddnewvideoform.resetForm();
    this.addNewVideoForm.reset();
    this.addNewVideoForm.patchValue({
      title: '',
      description: ''
    });
    this.modalService.open_modal("#addNewVideoFormModal");
  }

  onSubmitAddNewVideoForm() {
    if (this.addNewVideoForm.valid) {
      let formData = new FormData();
      formData.append('token', this.commonService.getUserData('token'));
      formData.append('title', this.addNewVideoForm.value.title);
      formData.append('description', this.addNewVideoForm.value.description);

      this.addNewVideoFormLoader = true;
      this.courseService.create_item(this.course_id, formData).subscribe(
        (response: any) => {
          if (response.status) {
            this.alertService.show_alert(response.message);
            this.addNewVideoForm.reset();
          }
          this.course_items.push(response.data);
          this.modalService.close_modal("#addNewVideoFormModal");
          this.addNewVideoFormLoader = false;
        },
        (error) => { this.addNewVideoFormLoader = false; }
      );
    }
  }

  onChangeItemImage(fileInput: any, item_id:string, index:number) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      let file:File = fileInput.target.files[0];

      const allowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedFileTypes.includes(file.type)) {
        this.alertService.showValidationErrors('Only JPG or PNG files are allowed');
        return false;
      }

      const allowedMaxSize = 0.25 * 1024 * 1024;
      if (file.size > allowedMaxSize) {
        this.alertService.showValidationErrors('Maximum size allowed is 500 KB');
        return false;
      }

      this.updateFormLoader = true;
      let formData = new FormData();
      formData.append('token', this.commonService.getUserData('token'));
      formData.append('image', file);

      this.courseService.update_media(this.course_id, item_id, formData).subscribe(
        (response:any) => {
          if(response.status) {
            this.course_items[index].image = file.name;
            this.course_items[index].image_url = response.data;
            this.alertService.show_alert(response.message);
          }
          this.updateFormLoader = false;
        },
        (error) => { this.updateFormLoader = false; },
        () => { this.updateFormLoader = false; }
      );
    }
  }

  onChangeItemVideo(fileInput:any, item_id:string, index:number) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      let file:File = fileInput.target.files[0];

      const allowedFileTypes = ['video/mp4'];
      if (!allowedFileTypes.includes(file.type)) {
        this.alertService.showValidationErrors('Only MP4 files are allowed');
        return false;
      }

      const allowedMaxSize = 200 * 1024 * 1024;
      if (file.size > allowedMaxSize) {
        this.alertService.showValidationErrors('Maximum size allowed is 200 MB');
        return false;
      }

      this.updateFormLoader = true;
      let formData = new FormData();
      formData.append('token', this.commonService.getUserData('token'));
      formData.append('video', file);

      this.courseService.update_media(this.course_id, item_id, formData).subscribe(
        (response:any) => {
          if(response.status) {
            this.course_items[index].file_name = file.name;
            this.course_items[index].file_type = file.type;
            this.course_items[index].file_url = response.data;
            this.alertService.show_alert(response.message);
          }
          this.updateFormLoader = false;
        },
        (error) => { this.updateFormLoader = false; },
        () => { this.updateFormLoader = false; }
      );
    }
  }

  onDeleteVideo(item_id:string, index:number) {
    Swal.fire({
      title: 'Delete',
      text: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        this.updateFormLoader = true;
        this.courseService.delete_item(this.course_id, item_id).subscribe(
          (response: any) => {
            if (response.status) {
              this.alertService.show_alert(response.message);
              this.course_items.splice(index, 1);
            }
            this.updateFormLoader = false;
          },
          (error) => { this.updateFormLoader = false; }
        );
      }
    });
  }

  openUpdateVideForm(item_id:string, index:number) {
    this.item_id = item_id;
    this.item_index = index;
    this.ngupdatevideoform.resetForm();
    this.updateVideoForm.reset();
    this.updateVideoForm.patchValue({
      title: this.course_items[index].title,
      description: this.course_items[index].description
    });
    this.modalService.open_modal("#updateVideoFormModal");
  }

  onSubmitUpdateVideoForm() {
    if (this.updateVideoForm.valid) {
      let formData = {
        token: this.commonService.getUserData('token'),
        title: this.updateVideoForm.value.title,
        description: this.updateVideoForm.value.description,
      };

      this.updateVideoFormLoader = true;
      this.courseService.update_item(this.course_id, this.item_id, formData).subscribe(
        (response: any) => {
          if (response.status) {
            this.course_items[this.item_index] = response.data;
            this.alertService.show_alert(response.message);
          }
          this.modalService.close_modal("#updateVideoFormModal");
          this.updateVideoFormLoader = false;
        },
        (error) => { this.updateVideoFormLoader = false; }
      );
    }
  }

}
