import { iSlots } from '../interface/i-slots';

export interface iTimeslots {
  date: string,
  date_formatted: string,
  total_slots: number,
  total_slots_formatted: string,
  slots: iSlots
}
