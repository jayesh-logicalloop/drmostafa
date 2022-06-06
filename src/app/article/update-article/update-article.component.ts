import { Component, OnInit, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Select2OptionData } from 'ng-Select2';
import { Options } from 'select2';
import { TranslateService } from '@ngx-translate/core';

import { CommonService } from '../../services/common.service';
import { ArticleService } from '../../services/article.service';
import { ArticleCategoryService } from '../../services/article-category.service';
import { AlertService } from '../../services/alert.service';


@Component({
  selector: 'app-update-article',
  templateUrl: './update-article.component.html',
  styleUrls: ['./update-article.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class UpdateArticleComponent implements OnInit {
  userType = '';
  editorConfig = {
    allowedContent: true,
    removePlugins: ''
  };

  allCategories = [];
  articleCategories = [];
  articleSubCategories = [];

  public select2Data: Array<Select2OptionData>;
  public select2Options: Options = { width: '100%', multiple: true, tags: true };

  @ViewChild('ngmyform', {static: false}) ngmyform: NgForm;
  @ViewChild('ngfileInput', { static: false }) ngfileInput: ElementRef;
  updateForm: FormGroup;
  updateFormLoader = false;
  imageSrc = '';
  imageFile: File;

  articleDetail = {
    "article_id": "",
    "title": "",
    "content": "",
    "alias": "",
    "image": "",
    "tags": [],
    "meta_tag": "",
    "meta_description": "",
    "status": "",
    "is_approved": "",
    "liked": "",
    "total_likes": "",
    "category_id": "",
    "category_name": "",
    "sub_category_id": "",
    "sub_category_name": "",
    "created_by_name": "",
    "created_by": "",
    "specialization_name": "",
    "sub_specialization_name": "",
    "created_date": "",
    "created_date_formatted": "",
    "image_url": ""
  };

  constructor(
	private translate: TranslateService,
    private title: Title,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private articleService: ArticleService,
    private articleCategoryService: ArticleCategoryService,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private alertService: AlertService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Update Healthfeed');
    this.userType = this.commonService.getUserData('group_name');
    this.updateForm = this.formBuilder.group({
      title: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(150),
      ]],
      status: ['Active', [
        Validators.required
      ]],
      category_id: ['', [
        Validators.required
      ]],
      sub_category_id: ['', [
        Validators.required
      ]],
      content: ['', [
        Validators.required
      ]],
      image:['',[
        Validators.required
      ]],
      tags: [''],
      is_approved:['Pending',[
        Validators.required
      ]],
      meta_tag: ['', [
        Validators.maxLength(100),
      ]],
      meta_description: ['', [
        Validators.maxLength(250)
      ]]
    });

    this.activatedRoute.params.subscribe(routeParams => {
      let id_alias = routeParams.article_id;
      this.updateFormLoader = true;
      this.articleService.get(id_alias).subscribe(
        (response: any) => {
          if (response.status) {
            this.updateFormLoader = false;
            this.articleDetail = response.data;
            this.selectSubCat(this.articleDetail.category_id);
            this.updateForm.patchValue({
              title: this.articleDetail.title,
              status: this.articleDetail.status,
              content: this.articleDetail.content,
              tags: this.articleDetail.tags,
              is_approved: this.articleDetail.is_approved,
              meta_tag: this.articleDetail.meta_tag,
              meta_description: this.articleDetail.meta_description
            });
            if(this.articleDetail.image) {
              this.imageSrc = this.articleDetail.image_url;
              this.updateForm.patchValue({
                image: this.articleDetail.image
              });
            }
            this.get_article_categories();
          } else {
            if(this.userType != 'Super Admin') {
              this.router.navigate(['/healthfeeds']);
            } else {
              this.router.navigate(['/article']);
            }
          }
        },
        (error) => { this.updateFormLoader = false; }
      )
    });
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.get_tags();
  }

  get_article_categories() {
    this.articleCategoryService.get('', {pagination: "No"}).subscribe(
      (response: any) => {
        if (response.status) {
          this.allCategories = response.data;
          this.articleCategories = this.allCategories.filter(x => x.parent_id == 0);
          if(this.articleDetail.category_id){
            this.articleSubCategories=this.allCategories.filter(x => x.parent_id == this.articleDetail.category_id);
            this.updateForm.patchValue({
              category_id: this.articleDetail.category_id,
              sub_category_id: this.articleDetail.sub_category_id
            });
          }
        }
      }
    )
  }

  onSubmitUpdateForm() {
    if (this.updateForm.valid) {
      //console.log(this.updateForm.value);
      let postData = new FormData();
      postData.append('token', this.commonService.getUserData('token'));
      postData.append('title', this.updateForm.value.title);
      postData.append('status', this.updateForm.value.status);
      postData.append('category_id', this.updateForm.value.category_id);
      postData.append('sub_category_id', this.updateForm.value.sub_category_id);
      if(this.imageFile) {
        postData.append('image', this.imageFile);
      }
      postData.append('content', this.updateForm.value.content);
      postData.append('tags', this.updateForm.value.tags);
      postData.append('is_approved', this.updateForm.value.is_approved);
      postData.append('meta_tag', this.updateForm.value.meta_tag);
      postData.append('meta_description', this.updateForm.value.meta_description);

      this.updateFormLoader = true;
      this.articleService.post(this.articleDetail.article_id, postData).subscribe(
        (response: any) => {
          if (response.status) {
            this.alertService.show_alert(response.message);
            /* if(this.userType != 'Super Admin') {
              this.router.navigate(['/healthfeeds']);
            } else {
              this.router.navigate(['/article']);
            } */
          }
          this.updateFormLoader = false;
        },
        (error) => { this.updateFormLoader = false; }
      );
    }
  }

  onFileInput(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      const max_height = 2000;
      const max_width = 2000;

      const allowed_types = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowed_types.includes(fileInput.target.files[0].type)) {
        this.alertService.showValidationErrors('Only Images are allowed ( JPG | PNG )');
        return false;
      }

      const max_size = 2000000;
      if (fileInput.target.files[0].size > max_size) {
        this.alertService.showValidationErrors('Maximum size allowed is 2 MB');
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
            //this.alertService.showValidationErrors('Maximum dimentions allowed '+max_height+'*'+max_width+'px');
            //return false;
          }

          this.imageFile = fileInput.target.files[0];
          this.imageSrc = e.target.result;
          this.updateForm.patchValue({image: e.target.result});
          this.ngfileInput.nativeElement.value = '';
        };
      };
      reader.readAsDataURL(fileInput.target.files[0]);
    }
  }

  get_tags() {
    this.articleService.tags().subscribe(
      (response: any) => {
        if (response.status) {
          this.select2Data = response.data;
        }
      }
    )
  }

  selectSubCat(subCategory_id='') {
    this.articleSubCategories = [];
    if (subCategory_id != '') {
      this.articleSubCategories = this.allCategories.filter(x => x.parent_id == subCategory_id);
    } else {
      this.articleSubCategories = [];
      this.updateForm.patchValue({sub_category_id: ''});
    }
  }
}
