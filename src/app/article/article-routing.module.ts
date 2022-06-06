import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ArticleComponent } from './article.component';
import { AddArticleComponent } from './add-article/add-article.component';
import { UpdateArticleComponent } from './update-article/update-article.component';
import { ArticleCategoryComponent } from './article-category/article-category.component';

const routes: Routes = [
  { path: '', component: ArticleComponent },
  { path: 'categories', component: ArticleCategoryComponent },
  { path: 'create', component: AddArticleComponent },
  { path: 'update/:article_id', component: UpdateArticleComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ArticleRoutingModule { }


