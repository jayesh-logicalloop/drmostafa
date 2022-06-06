import { iTimeslots } from '../interface/i-timeslots';
import { iClinicAttachment } from '../interface/i-clinic-attachment';

export interface iClinic {
  user_id: string,
  clinic_id: string,
  clinic_name: string,
  clinic_alias: string,
  logo_image: string,
  clinic_email: string,
  clinic_phone_number: string,
  introduction: string,
  work_schedule: string,
  status: string,
  clinic_address: string,
  clinic_postal_code: string,
  clinic_latitude: number,
  clinic_longitude: number,
  clinic_city: string,
  clinic_region: string,
  region_name: string,
  clinic_country: string,
  country_name: string,
  clinic_amenities: [],
  online: string,
  is_default: string,
  joined_status: string,
  self_clinic: string,
  verified: string,
  logo_image_url: string,
  clinic_attachments: Array<iClinicAttachment>,
  time_slots: Array<iTimeslots>
}
