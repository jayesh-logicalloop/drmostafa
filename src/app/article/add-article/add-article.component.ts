import { Component, OnInit, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Select2OptionData } from 'ng-Select2';
import { Options } from 'select2';
import { TranslateService } from '@ngx-translate/core';

import { CommonService } from '../../services/common.service';
import { ArticleService } from '../../services/article.service';
import { ArticleCategoryService } from '../../services/article-category.service';
import { AlertService } from '../../services/alert.service';


@Component({
  selector: 'app-add-article',
  templateUrl: './add-article.component.html',
  styleUrls: ['./add-article.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AddArticleComponent implements OnInit {
  userType = '';
  editorConfig = {
    allowedContent: true,
    removePlugins: ''
  };

  allCategories = [];
  articleCategories = [];
  articleSubCategories= [];

  public select2Data: Array<Select2OptionData>;
  public select2Options: Options = { width: '100%', multiple: true, tags: true };

  @ViewChild('ngmyform', {static: false}) ngmyform: NgForm;
  @ViewChild('ngfileInput', { static: false }) ngfileInput: ElementRef;
  addForm:FormGroup;
  addFormLoader = false;
  imageSrc = '';
  imageFile: File;

  constructor(
	private translate: TranslateService,
    private title: Title,
    private articleService: ArticleService,
    private articleCategoryService: ArticleCategoryService,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private alertService: AlertService,
    private router: Router,
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Add Healthfeed');
    this.userType = this.commonService.getUserData('group_name');
    this.addForm = this.formBuilder.group({
      title:['',[
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(150),
      ]],
      status:['Published',[
        Validators.required
      ]],
      category_id:['',[
        Validators.required
      ]],
      sub_category_id:['',[
        Validators.required
      ]],
      image:['',[
        Validators.required
      ]],
      content:['',[
        Validators.required
      ]],
      tags:[''],
      is_approved:['Pending', [
        Validators.required
      ]],
      meta_tag:['',[
        Validators.maxLength(100),
       ]],
      meta_description:['',[
        Validators.maxLength(250),
      ]]
    });
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.get_tags();
    this.get_article_categories();
  }

  // For select box options
  get_article_categories(){
    this.articleCategoryService.get('', {pagination: "No"}).subscribe(
      (response:any)=>{
        if(response.status){
          this.allCategories = response.data;
          this.articleCategories = this.allCategories.filter(x=>x.parent_id == 0);
        }
      }
    )
  }

  onSubmitAddForm(){
    if(this.addForm.valid){
      let postData = new FormData();
      postData.append('token', this.commonService.getUserData('token'));
      postData.append('title', this.addForm.value.title);
      postData.append('status', this.addForm.value.status);
      postData.append('category_id', this.addForm.value.category_id);
      postData.append('sub_category_id', this.addForm.value.sub_category_id);
      if(this.imageFile) {
        postData.append('image', this.imageFile);
      }
      postData.append('content', this.addForm.value.content);
      postData.append('tags', this.addForm.value.tags);
      postData.append('is_approved', this.addForm.value.is_approved);
      postData.append('meta_tag', this.addForm.value.meta_tag);
      postData.append('meta_description', this.addForm.value.meta_description);

      this.addFormLoader = true;
      this.articleService.post('', postData).subscribe(
        (response:any) => {
          if(response.status){
            this.alertService.show_alert(response.message);
            if(this.userType != 'Super Admin') {
              this.router.navigate(['/healthfeeds']);
            } else {
              this.router.navigate(['/article']);
            }
          }
          this.addFormLoader = false;
        },
        (error) => { this.addFormLoader = false; }
      )
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
            //this.alertService.showValidationErrors('Maximum dimentions allowed ' + max_height + '*' + max_width + 'px');
            //return false;
          }
          this.imageFile = fileInput.target.files[0];
          this.imageSrc = e.target.result; //base64 encoded
          this.addForm.patchValue({image: e.target.result});
          this.ngfileInput.nativeElement.value = '';
        };
      };
      reader.readAsDataURL(fileInput.target.files[0]);
    }
  }

  get_tags(){
    this.articleService.tags().subscribe(
      (response: any) => {
        if (response.status) {
          this.select2Data = response.data;
        }
      }
    )
  }

  selectSubCat(subCategoryId='') {
    this.articleSubCategories = [];
    if (subCategoryId != '') {
      this.articleSubCategories = this.allCategories.filter(x=>x.parent_id == subCategoryId);
    } else {
      this.articleSubCategories = [];
      this.addForm.patchValue({'sub_category_id':''});
    }
  }

}
