import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { ApiService } from '../../services/api.service';
import { CommonService } from '../../services/common.service';
import { SessionService } from '../../services/session.service';
import { AlertService } from '../../services/alert.service';

import { iSession } from '../../services/interface/i-session';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class UpdateComponent implements OnInit {
  userType = '';

  session_id = '';
  dataLoader = true;
  session:iSession;
  image_src='';
  image_file:File;

  @ViewChild('ngimagefileinput', {static: false}) ngimagefileinput: ElementRef;
  @ViewChild('ngupdateform', {static: false}) ngupdateform: NgForm;
  updateForm: FormGroup;
  updateFormLoader = false;

  constructor(
	private translate: TranslateService,
    private title: Title,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private commonService: CommonService,
    private sessionService: SessionService,
    private alertService: AlertService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Update Session');
    this.apiService.currentUserData.subscribe(
      (userData: any) => {
        this.userType = (userData.group_name) ? userData.group_name : this.commonService.getUserData('group_name');
        /* const allowedUserTypes = ['Super Admin', 'Doctor'];
        if (!allowedUserTypes.includes(this.userType)) {
          this.commonService.userDefaultRoute();
        } */
      }
    );

    this.activatedRoute.params.subscribe(routeParams => {
      this.session_id = routeParams.id;
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
      session_time: ['', [
        Validators.required
      ]],
      image: ['', [
        Validators.required
      ]],
      price: ['', [
        Validators.required
      ]],
      offer_price: [''],
      url: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(250)
      ]],
      description: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(250)
      ]],
      status: ['', [
        Validators.required
      ]]
    });
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.getSessionDetail();
  }

  getSessionDetail() {
    this.dataLoader = true;
    this.sessionService.get(this.session_id).subscribe(
      (response: any) => {
        if(response.status) {
          this.session = response.data;
          this.updateForm.patchValue({
            name: this.session.name,
            author: this.session.author,
            duration: this.session.duration,
            session_time: this.session.session_time,
            image: this.session.image,
            price: this.session.price,
            offer_price: this.session.offer_price,
            url: this.session.url,
            description: this.session.description,
            status: this.session.status
          });
          this.image_src = this.session.image ? this.session.image_url : '';
          this.dataLoader = false;
        } else {
          this.router.navigate(['/sessions']);
        }
      },
      (error) => { this.dataLoader = false; },
    );
  }

  onSubmitUpdateForm() {
    //console.log(this.updateForm);
    if (this.updateForm.valid) {
      let formData = new FormData();
      formData.append('token', this.commonService.getUserData('token'));
      formData.append('name', this.updateForm.value.name);
      formData.append('author', this.updateForm.value.author);
      formData.append('duration', this.updateForm.value.duration);
      formData.append('session_time', this.commonService.dateTimeFormat(this.updateForm.value.session_time));
      formData.append('url', this.updateForm.value.url);
      if(this.image_file) formData.append('image', this.image_file);
      formData.append('price', this.updateForm.value.price);
      formData.append('offer_price', this.updateForm.value.offer_price);
      formData.append('description', this.updateForm.value.description);
      formData.append('status', this.updateForm.value.status);

      this.updateFormLoader = true;
      this.sessionService.update(this.session_id, formData).subscribe(
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

  onChangeImage(fileInput: any) {
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
          this.image_src = e.target.result;
          this.image_file = file;
          this.updateForm.patchValue({image:this.image_src});
        };
      };
      reader.readAsDataURL(file);
      this.ngimagefileinput.nativeElement.value = '';
    }
  }

  removeImage() {
    this.dataLoader = true;
    this.sessionService.delete_media(this.session_id, {file:'image'}).subscribe(
      (response: any) => {
        if(response.status) {
          this.image_src = '';
          this.image_file = null;
          this.ngimagefileinput.nativeElement.value = '';
          this.updateForm.patchValue({image:''});
        }
        this.dataLoader = false;
      },
      (error) => { this.dataLoader = false; },
    );
  }
}
