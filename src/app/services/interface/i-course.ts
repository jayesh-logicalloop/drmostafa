import { iCourseItem } from "./i-course-item";

export interface iCourse {
  course_id: string,
  name: string,
  alias: string,
  author: string,
  duration: string,
  language: string,
  image: string,
  description: string,
  price: string,
  offer_price: string,
  status: string,
  created_date: string,
  image_url: string,
  price_formatted: string,
  offer_price_formatted: string,
  items: iCourseItem[]
}
