import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-appointment-price',
  templateUrl: './appointment-price.component.html',
  styleUrls: ['./appointment-price.component.css']
})
export class AppointmentPriceComponent implements OnInit {

  dataLoader = false;
  appointmentPriceList = [];

  currentPage = 1;
  itemsPerPage = 5;
  totalItems: number;

  constructor() { }

  ngOnInit() {
  }

  pageChanged(p: number) {
    this.currentPage = p;
    this.getTotalAppointmentPrices();
  }

  getTotalAppointmentPrices() {
    // this.announcementService.total().subscribe(
    //   (response: any) => {
    //     this.totalItems = response.data;
    //     this.getAnnouncements();
    //   }
    // );
  }

  getAnnouncements(id = '') {
    this.dataLoader = true;
    let params = {
      limit: this.itemsPerPage,
      page: this.currentPage
    };
  //   this.announcementService.get(id, params).subscribe(
  //     (response: any) => {
  //       if (response.status) {
  //         this.app = response.data;
  //       }
  //       this.dataLoader = false;
  //     },
  //     (error) => { this.dataLoader = false; }
  //   )
  }

}
