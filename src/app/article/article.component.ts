import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { debounceTime, map } from "rxjs/operators";
import { fromEvent } from 'rxjs';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

import { ArticleService } from '../services/article.service';
import { CommonService } from '../services/common.service';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class ArticleComponent implements OnInit {
  userType = '';
  @ViewChild('searchTerm', {static: false}) searchTerm: ElementRef;
  search = '';

  dataLoader = false;
  articles = [];

  currentPage = 1;
  itemsPerPage = 12;
  totalItems:number;

  window_pathname = '';
  category = 'healthfeed';
  header = '';

  constructor(
	private translate: TranslateService,
    private title: Title,
    private articleService:ArticleService,
    private alertService:AlertService,
    private commonService:CommonService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.userType = this.commonService.getUserData('group_name');
    this.window_pathname = window.location.pathname;
    //console.log('this.window_pathname', this.window_pathname);
    if(this.window_pathname == '/healthfeeds' || this.window_pathname == '/admin/healthfeeds') {
      this.title.setTitle('Healthfeeds');
      this.header = 'Healthfeeds';
    } else {
      this.title.setTitle('Articles');
      this.header = 'Articles';
    }
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.total_articles();
  }

  total_articles() {
    let params = {search:this.search, category:this.category};
    if(this.window_pathname == '/articles' || this.window_pathname == '/admin/articles') {
      params['category'] = 'general';
    }
    this.articleService.total(params).subscribe(
      (response:any)=>{
        this.totalItems = response.data;
        if (this.totalItems) {
          this.get_articles();
        }
      }
    );
  }

  get_articles() {
    let params = {limit: this.itemsPerPage, page:this.currentPage, search:this.search, category:this.category, ob_key: "created_date", ob_value:"DESC"};
    if(this.window_pathname == '/articles' || this.window_pathname == '/admin/articles') {
      params['category'] = 'general';
    }
    this.dataLoader = true;
    this.articleService.get('', params).subscribe(
      (response:any) => {
        if(response.status){
          this.articles = response.data;
        }
        this.dataLoader = false;
      },
      (error) => { this.dataLoader = false; }
    )
  }

  onDeleteArticle(id:string, index:number){
    Swal.fire({
      title: 'Delete',
      text: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        this.dataLoader = true;
        this.articleService.delete(id).subscribe(
          (response:any)=>{
            if(response.status){
              this.alertService.show_alert(response.message);
              this.articles.splice(index, 1);
            }
            this.dataLoader = false;
          },
          (error) => { this.dataLoader = false; }
        )
      }
    });
  }

  pageChanged(p:number) {
    this.currentPage = p;
    this.get_articles();
  }

  ngAfterViewInit(): void {
    fromEvent(this.searchTerm.nativeElement, 'keyup').pipe(
      map((event: any) => {return event.target.value;}),debounceTime(1000)
    ).subscribe((text: string) => {
      this.search = text;
      this.total_articles();
      this.get_articles();
    });
  }

  changeStatus(approve_status:string, article_id:string, i:number){
    this.dataLoader = true
    this.articleService.approve(article_id, {is_approved: approve_status}).subscribe(
      (response:any)=>{
        if(response.status){
          this.alertService.show_alert(response.message);
          this.articles[i].is_approved = response.data;
        }
        this.dataLoader = false;
      },
      (error) => { this.dataLoader = false }
    )
  }

}
