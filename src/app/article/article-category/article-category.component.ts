import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../services/common.service';
import { ArticleCategoryService } from '../../services/article-category.service';
import { ModalService } from '../../services/modal.service';
import { AlertService } from '../../services/alert.service';
import { iCategory } from 'src/app/services/interface/i-category';


@Component({
  selector: 'app-article-category',
  templateUrl: './article-category.component.html',
  styleUrls: ['./article-category.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ArticleCategoryComponent implements OnInit {
  userType = '';

  currentPage = 1;
  itemsPerPage = 5;
  totalItems: number;

  i:number;
  j:number;
  id='';
  search = '';
  categories: iCategory[] = [];
  allParentCategories = [];
  dataLoader = false;

  @ViewChild('ngaddform', {static: false}) ngaddform: NgForm;
  addForm: FormGroup;
  addFormLoader = false;

  @ViewChild('ngfileinput', {static: false}) ngfileinput: ElementRef;
  imageSrc = '';
  imageFile: File;

  @ViewChild('ngupdateform', {static: false}) ngupdateform: NgForm;
  updateForm: FormGroup;
  updateFormLoader = false;

  constructor(
	private translate: TranslateService,
    private title: Title,
    private formBuilder: FormBuilder,
    private articleCategoryService: ArticleCategoryService,
    private commonService: CommonService,
    private modalService: ModalService,
    private alertService: AlertService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Categories');

    const userType = this.commonService.getUserData('group_name');
    /* const allowedUserTypes = ['Super Admin', 'Doctor'];
    if (!allowedUserTypes.includes(userType)) {
      this.commonService.userDefaultRoute();
    } */

    this.addForm = this.formBuilder.group({
      parent_id: ['', []],
      category_name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      image: ['', [
        Validators.required
      ]],
      status: ['Active', [
        Validators.required
      ]]
    });
    this.updateForm = this.formBuilder.group({
      parent_id: ['', []],
      category_name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      image: ['', [
        Validators.required
      ]],
      status: ['', [
        Validators.required
      ]]
    });
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.total_articles_category();
    this.getAllCategories();
  }

  total_articles_category() {
    this.articleCategoryService.total().subscribe(
      (response: any) => {
        this.totalItems = response.data;
        if(this.totalItems) {
          this.get_article_categories();
        }
      }
    );
  }

  //For listing
  get_article_categories(id='') {
    this.dataLoader = true;
    let params = {
      limit: this.itemsPerPage,
      page: this.currentPage,
      ob_key: "",
      ob_value: "",
      search: this.search,
      parent_id: "0"
    };
    this.articleCategoryService.get(id, params).subscribe(
      (response: any) => {
        if (response.status) {
          this.categories = response.data;
        }
        this.dataLoader = false;
      },
      (error) => { this.dataLoader = false; },
      () => { this.dataLoader = false; }
    )
  }

  getAllCategories() {
    this.articleCategoryService.get('', {pagination: "No", parent_id: "0", ob_key: "category_name", ob_value: "ASC"}).subscribe(
      (response: any) => {
        if (response.status) {
          let data = response.data;
          this.allParentCategories = data.filter(x => x.parent_id == 0);
        }
      }
    )
  }

  pageChanged(p: number) {
    this.currentPage = p;
    this.get_article_categories();
  }

  openAddForm() {
    this.addForm.reset();
    this.ngaddform.resetForm();
    this.imageSrc = '';
    this.imageFile = null;
    this.addForm.patchValue({
      parent_id: "",
      image: "",
      status: "Active",
    })
    this.modalService.open_modal('#addFormModal');
  }

  openEditForm(id:string, i: number, j:number=-1) {
    this.id = id;
    this.i = i;
    this.j = j;
    this.imageSrc = '';
    this.imageFile = null;
    let data = this.categories[i];
    this.ngupdateform.resetForm();
    if (i >= 0 && j >= 0) {
      data = this.categories[i].subCategory[j];
    }
    this.updateForm.patchValue({
      parent_id: data.parent_id,
      category_name: data.category_name,
      image: data.category_image,
      status: data.status,
    });
    if (data.category_image) {
      this.imageSrc = data.category_image_url;
      this.updateForm.patchValue({image: data.category_image});
    }
    this.modalService.open_modal('#updateFormModal');
  }

  onSubmitAddForm() {
    if (this.addForm.valid) {
      let postData = new FormData();
      postData.append('token', this.commonService.getUserData('token'));
      if (this.imageFile) {
        postData.append('category_image', this.imageFile);
      }
      postData.append('parent_id', this.addForm.value.parent_id);
      postData.append('category_name', this.addForm.value.category_name);
      postData.append('status', this.addForm.value.status);
      this.addFormLoader = true;
      this.articleCategoryService.post('', postData).subscribe(
        (response: any) => {
          if (response.status) {
            this.modalService.close_modal('#addFormModal');
            this.alertService.show_alert(response.message);
            this.get_article_categories();
            this.getAllCategories();
            this.ngaddform.resetForm();
            this.addForm.patchValue({ 'parent_id': '', 'status': 'Active' });
          }
          this.addFormLoader = false;
        },
        (error:any) => { this.addFormLoader = false; },
      )
    }
  }

  onSubmitupdateForm() {
    if (this.updateForm.valid) {
      let postData = new FormData();
      postData.append('token', this.commonService.getUserData('token'));
      if (this.imageFile) {
        postData.append('category_image', this.imageFile);
      }
      postData.append('parent_id', this.updateForm.value.parent_id);
      postData.append('category_name', this.updateForm.value.category_name);
      postData.append('status', this.updateForm.value.status);

      this.updateFormLoader = true;
      this.articleCategoryService.post(this.id, postData).subscribe(
        (response: any) => {
          if (response.status) {
            this.modalService.close_modal('#updateFormModal');
            this.alertService.show_alert(response.message);
            this.get_article_categories();
            this.getAllCategories();
          }
          this.updateFormLoader = false;
        },
        (error) => {this.updateFormLoader = false;}
      );
    }
  }

  onFileInput(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      const max_height = 500;
      const max_width = 500;

      const allowed_types = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowed_types.includes(fileInput.target.files[0].type)) {
        this.alertService.showValidationErrors('Only JPG and PNG files allowed');
        return false;
      }

      const max_size = 2000000;
      if (fileInput.target.files[0].size > max_size) {
        this.alertService.showValidationErrors('Maximum size allowed is 2 MB');
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
          this.imageFile = fileInput.target.files[0];
          this.addForm.patchValue({image:e.target.result});
          this.updateForm.patchValue({image:e.target.result});
          this.ngfileinput.nativeElement.value = '';
        };
      };
      reader.readAsDataURL(fileInput.target.files[0]);
    }
  }
}
