import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, NgForm, FormBuilder, Validators } from '@angular/forms';
import { CmsService } from '../../services/cms.service';
import { CommonService } from '../../services/common.service';
import { ModalService } from '../../services/modal.service';
import { AlertService } from '../../services/alert.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-manage-content',
  templateUrl: './manage-content.component.html',
  styleUrls: ['./manage-content.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ManageContentComponent implements OnInit {
  dataLoader = false;
  cmsContent = [];
  editorConfig: any;

  id='';
  index:number;
  content_type='';
  @ViewChild('ngcmscontentform', {static: false}) ngcmscontentform: NgForm;
  @ViewChild('ngfileinput', { static: false }) ngfileinput: ElementRef;
  imgSrc = '';
  imgFile: File;
  cmsContentForm: FormGroup;
  cmsContentFormLoader = false;

  constructor(
	  private translate: TranslateService,
    private title: Title,
    private cmsService: CmsService,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private modalService: ModalService,
    private alertService: AlertService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Manage Content');
    this.editorConfig = {
      allowedContent: true,
      removePlugins: ''
    }
    this.cmsContentForm = this.formBuilder.group({
      "content": ['', Validators.required]
    })
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.getCmsContent();
  }

  getCmsContent() {
    this.dataLoader = true;
    this.cmsService.getCmsContent().subscribe(
      (response: any) => {
        if (response.status) {
          this.cmsContent = response.data;
          //console.log('this.cmsContent', this.cmsContent);
        }
        this.dataLoader = false;
      },
      (error) => { this.dataLoader = false; },
    )
  }


  onEditContent(id:string, i:number) {
    if (id) {
      this.id = id;
      this.index = i;
      let content = this.cmsContent[i];
      this.content_type = content.content_type;
      this.cmsContentForm.patchValue({
        "content": content.content
      });
      if (this.content_type =='image') {
        this.imgSrc = content.content;
      }
      this.modalService.open_modal('#contentModal');
    }
  }

  onSubmitCMSContentForm() {
    if (this.cmsContentForm.valid) {
      let postData = new FormData();
      postData.append('token', this.commonService.getUserData('token'));

      this.cmsContentFormLoader = true;
      if (this.content_type == 'image') {
        postData.append('content_image', this.imgFile);
        this.cmsService.updateContentImage(this.id, postData).subscribe(
          (response: any) => {
            if (response.status) {
              this.cmsContent[this.index].content = this.imgSrc;
              this.modalService.close_modal('#contentModal');
              this.alertService.show_alert(response.message);
            }
            this.cmsContentFormLoader = false;
          },
          (error) => { this.cmsContentFormLoader = false; }
        );
      } else {
        postData.append('content', this.cmsContentForm.value.content);
        this.cmsService.updateContent(this.id, postData).subscribe(
          (response: any) => {
            if (response.status) {
              this.cmsContent[this.index].content = this.cmsContentForm.value.content;
              this.modalService.close_modal('#contentModal');
              this.alertService.show_alert(response.message);
            }
            this.cmsContentFormLoader = false;
          },
          (error) => { this.cmsContentFormLoader = false; }
        );
      }
    }
  }

  onFileInput(file: any) {
    if (file.target.files && file.target.files[0]) {
      const max_height = 500;
      const max_width = 500;

      const max_size = 200000;
      if (file.target.files[0].size > max_size) {
        this.alertService.showValidationErrors('Maximum size allowed is 2 MB');
        return false;
      }

      const allowed_types = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowed_types.includes(file.target.files[0].type)) {
        //this.alertService.showValidationErrors('Only JPG and PNG files allowed');
        //return false;
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
          this.cmsContentForm.patchValue({
            "content": 'Image selected'
          });
          this.imgSrc = e.target.result;
          this.imgFile = file.target.files[0];
          this.ngfileinput.nativeElement.value = '';
        };
      };
      reader.readAsDataURL(file.target.files[0]);
    }
  }
}
