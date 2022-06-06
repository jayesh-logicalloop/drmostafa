import { Injectable } from '@angular/core';
declare var jQuery:any;

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor() { }

  open_modal(modal:string){
    jQuery(modal).modal('show');
  }

  close_modal(modal:string){
    jQuery(modal).modal('hide');
  }
}
