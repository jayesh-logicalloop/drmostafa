import { iService } from '../interface/i-service';
import { iClinic } from '../interface/i-clinic';
import { iSpecialization } from '../interface/i-specialization';
import { iFeedback } from '../interface/i-feedback';

export interface iDoctorDetail {
  account_status: string,
  awards: [],
  banks: [],
  clinics: iClinic[],
  completion_level: string,
  completion_message: string,
  completion_status: string,
  completion_step: string,
  dob: string,
  dob_formatted: string,
  documents: [],
  educations: [],
  email: string,
  email_verification_status: string,
  experiences: [],
  feedbacks: {
    total: number,
    feedbacks: iFeedback[]
  },
  first_name: string,
  full_name: string,
  gender: string,
  healthfeeds: [],
  introduction: string,
  last_name: string,
  mobile_number: string,
  mobile_verification_status: string,
  profile_image_url: string,
  rating: {
    total_ratings: number,
    average_rating: number,
    formatted_rating: number
  },
  services: iService[],
  settings: any,
  specializations: iSpecialization[],
  status: string,
  user_id: string,
  work_schedule: {
    daily: [],
    specific: []
  }
}
