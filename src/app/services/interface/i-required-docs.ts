import { iDocument } from '../interface/i-document';

export interface iRequiredDocs {
  key: string,
  name: string,
  description: string,
  required: string,
  uploaded: string,
  verified: string,
  verification_status: string,
  data: iDocument
}
