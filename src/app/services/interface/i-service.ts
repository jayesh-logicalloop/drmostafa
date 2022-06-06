export interface Iitem {
  title: string;
  limit: string;
  service_fee: string;
}

export interface iService {
  service_id: string;
  title: string;
  instructions: string;
  service_fee: string;
  status: string;
  clinic_name: string;
  clinic_id: string;
  service_type: string;
  service_fee_formatted: string;
  image: string;
  image_url: string;
  items: Iitem[]
}
