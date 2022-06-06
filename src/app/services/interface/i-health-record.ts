export interface iHealthRecord {
  id: string,
  patient_id: string,
  patient_name: string,
  name: string,
  doctor: string,
  description: string,
  record_for: string,
  record_type: string,
  record_date: string,
  shared: string,
  file_name: string,
  file_type: string,
  file_url: string,
  download_url: string,
  record_date_formatted: string
}
