import { iService } from '../interface/i-service';

export interface Prescriptions {
  Medicine: any[];
  Lab: any[];
  Imaging: any[];
  Recommend: any[];
  Report: any[];
}

export interface Feedback {
  feedback_comment: string;
}

export interface PatientMetaInfo {
  patient_dob: string;
  allergy?: any;
  blood_group?: any;
  medical_history?: any;
  height?: any;
  weight?: any;
}

export interface Clinic {
  user_id: string;
  clinic_id: string;
  clinic_name: string;
  clinic_alias: string;
  logo_image: string;
  clinic_email: string;
  clinic_phone_number: string;
  introduction: string;
  work_schedule: string;
  status: string;
  clinic_region: string;
  region_name: string;
  clinic_country: string;
  country_name: string;
  clinic_city: string;
  clinic_postal_code: string;
  clinic_address: string;
  clinic_latitude: number;
  clinic_longitude: number;
  clinic_amenities: any[];
  online: string;
  is_default: string;
  joined_status: string;
  self_clinic: string;
  verified: string;
  logo_image_url: string;
  clinic_attachments: any[];
  time_slots: any[];
}

export interface iAppointment {
  vid: string;
  vcrt: string;
  token: string;
  token_expiry_time: string;
  channelName: string;
  uid: string;
  appointment_id: string;
  instant: string;
  appointment_for: string;
  appointment_note: string;
  appointment_date: string;
  appointment_date_formatted: string;
  appointment_time: string;
  appointment_time_formatted: string;
  appointment_from_time: string;
  appointment_from_time_formatted: string;
  appointment_to_time: string;
  appointment_to_time_formatted: string;
  appointment_datetime: string;
  appointment_datetime_formatted: string;
  appointment_timestamp: number;
  consultation_fee: string;
  consultation_fee_formatted: string;
  confirmed: string;
  confirmed_by: string;
  confirmed_date: string;
  completed_by: string;
  completed_date: string;
  reschedule_by: string;
  reschedule_by_name: string;
  reschedule_reason: string;
  cancel_by: string;
  cancel_reason: string;
  appointment_status: string;
  created_date: string;
  updated_date: string;
  mark_completed: boolean;
  show_mark_completed: boolean;
  services: iService;
  attachments: any[];
  prescriptions: Prescriptions;
  feedback: Feedback;
  order_id: string;
  order_date: string;
  order_date_formatted: string;
  order_amount: string;
  order_amount_formatted: string;
  transaction_fee: string;
  transaction_fee_formatted: string;
  cancellation_fee: string;
  cancellation_fee_formatted: string;
  refunded_amount: number;
  refunded_amount_formatted: string;
  status_code: string;
  order_status: string;
  transaction_id: string;
  payment_method: string;
  payment_status: string;
  user_id: string;
  user_name: string;
  user_image_url: string;
  user_email: string;
  user_mobile: string;
  user_status: string;
  patient_id: string;
  patient_name: string;
  patient_email: string;
  patient_mobile: string;
  patient_gender: string;
  patient_age: string;
  patient_age_formatted: string;
  patient_image_url: string;
  patient_meta_info: PatientMetaInfo;
  last_visit: string;
  last_visit_date: string;
  doctor_id: string;
  doctor_name: string;
  doctor_image_url: string;
  doctor_email: string;
  doctor_status: string;
  doctor_specialization: string;
  doctor_sub_specialization: string;
  doctor_education: string;
  doctor_experience?: any;
  doctor_experience_formatted: string;
  clinic_id: string;
  clinic: Clinic;
  order_by_expiry: string;
}
