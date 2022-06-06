export interface iArticle {
  article_id: string;
  title: string;
  content: string;
  alias: string;
  image: string;
  image_name: string;
  tags: [],
  meta_tag: string;
  meta_description: string;
  status: string;
  is_approved: string;
  liked: string;
  total_likes: string;
  category_id: string;
  category_name: string;
  sub_category_id: string;
  sub_category_name: string;
  created_by_name: string;
  created_by: string;
  specialization_name: string;
  sub_specialization_name: string;
  url: string;
}
