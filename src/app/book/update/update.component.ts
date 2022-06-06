import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../services/api.service';
import { CommonService } from '../../services/common.service';
import { BookService } from '../../services/book.service';
import { AlertService } from '../../services/alert.service';

import { iBook } from '../../services/interface/i-book';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class UpdateComponent implements OnInit {
  userType = '';

  book_id = '';
  dataLoader = true;
  book:iBook;
  image_src='';
  image_file:File;

  document_name='';
  document_file:File;

  @ViewChild('ngimagefileinput', {static: false}) ngimagefileinput: ElementRef;
  @ViewChild('ngdocumentfileinput', {static: false}) ngdocumentfileinput: ElementRef;
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
    private bookService: BookService,
    private alertService: AlertService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Update Book');
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
      this.book_id = routeParams.id;
    });

    this.updateForm = this.formBuilder.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      type: ['', [
        Validators.required
      ]],
      image: ['', [
        Validators.required
      ]],
      file: [''],
      price: ['', [
        Validators.required
      ]],
      offer_price: [''],
      total_pages: ['', [
        Validators.required
      ]],
      author: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      language: ['', [
        Validators.required,
      ]],
      category: ['', [
        Validators.required,
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
    this.updateForm.get('type').valueChanges.subscribe(value => {
      if(value == 'eBook') {
        this.updateForm.get('file').setValidators([Validators.required]);
      } else {
        this.updateForm.get('file').clearValidators();
        this.clearDocument();
      }
      this.updateForm.get('file').updateValueAndValidity();
    })
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.getBookDetail();
  }

  getBookDetail() {
    this.dataLoader = true;
    this.bookService.get(this.book_id).subscribe(
      (response: any) => {
        if(response.status) {
          this.book = response.data;
          this.updateForm.patchValue({
            name: this.book.name,
            type: this.book.type,
            image: this.book.image,
            file: this.book.file,
            price: this.book.price,
            offer_price: this.book.offer_price,
            total_pages: this.book.total_pages,
            author: this.book.author,
            language: this.book.language,
            category: this.book.category,
            description: this.book.description,
            status: this.book.status
          });
          this.image_src = this.book.image ? this.book.image_url : '';
          this.document_name = this.book.file ? this.book.file : '';
          this.dataLoader = false;
        } else {
          this.router.navigate(['/books']);
        }
      },
      (error) => { this.dataLoader = false; },
    );
  }

  onSubmitUpdateForm() {
    if (this.updateForm.valid) {
      let formData = new FormData();
      formData.append('token', this.commonService.getUserData('token'));
      formData.append('name', this.updateForm.value.name);
      formData.append('type', this.updateForm.value.type);
      if(this.image_file) formData.append('image', this.image_file);
      formData.append('file', this.document_file);
      formData.append('price', this.updateForm.value.price);
      formData.append('offer_price', this.updateForm.value.offer_price);
      formData.append('total_pages', this.updateForm.value.total_pages);
      formData.append('author', this.updateForm.value.author);
      formData.append('language', this.updateForm.value.language);
      formData.append('category', this.updateForm.value.category);
      formData.append('description', this.updateForm.value.description);
      formData.append('status', this.updateForm.value.status);

      this.updateFormLoader = true;
      this.bookService.update(this.book_id, formData).subscribe(
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
    this.bookService.delete_media(this.book_id, {file:'image'}).subscribe(
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

  onChangeDocument(fileInput:any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      let file = fileInput.target.files[0];

      const allowedFileTypes = ['application/pdf'];
      if (!allowedFileTypes.includes(file.type)) {
        this.alertService.showValidationErrors('Only PDF files are allowed for eBook');
        return false;
      }

      const allowedMaxSize = 20 * 1024 * 1024;
      if (file.size > allowedMaxSize) {
        this.alertService.showValidationErrors('Maximum size allowed is 20 MB for eBook');
        return false;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.document_name = file.name;
        this.document_file = file;
        this.updateForm.patchValue({document:this.document_name});
      };
      reader.readAsDataURL(file);
      this.ngdocumentfileinput.nativeElement.value = '';
    }
  }

  removeDocument() {
    this.dataLoader = true;
    this.bookService.delete_media(this.book_id, {file:'document'}).subscribe(
      (response: any) => {
        if(response.status) {
          this.clearDocument();
        }
        this.dataLoader = false;
      },
      (error) => { this.dataLoader = false; },
    );
  }

  clearDocument() {
    this.document_name = '';
    this.document_file = null;
    this.ngdocumentfileinput.nativeElement.value = '';
    this.updateForm.patchValue({file:''});
  }

}
