import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

import { CommonService } from '../services/common.service';
import { ApiService } from '../services/api.service';
import { DashboardService } from '../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit {
  appointments = {
    "Total": "0",
    "Pending": "0",
    "Confirmed": "0",
    "Declined": "0",
    "Cancelled": "0",
    "Rescheduled": "0",
    "Completed": "0"
  };

  //lineChart
  currentYear = new Date().getFullYear();
  years = this.commonService.years(10);
  lineChartData = [{
    label: '# of Users',
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    borderWidth: 1,
    fill: false
  }];

  lineChartLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  lineChartOptions = {
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    },
    legend: {
      display: false
    },
    elements: {
      point: {
        radius: 0
      }
    }
  };

  lineChartColors = [
    {
      borderColor: 'rgba(255,99,132,1)'
    }
  ];

  userType = '';
  userId = '';

  constructor(
    private title: Title,
    private translate: TranslateService,
    private commonService: CommonService,
    private apiService: ApiService,
    private dashboardService: DashboardService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Dashboard');
    this.apiService.currentUserData.subscribe(
      (userData: any) => {
        this.userType = (userData.group_name) ? userData.group_name : this.commonService.getUserData('group_name');
        this.userId = (userData.user_id) ? userData.user_id : this.commonService.getUserData('user_id');
      }
    );
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.dashboardService.appointmentStatistics().subscribe(
      (response:any)=>{
        this.appointments = response;
      }
    );
    if(this.userType == 'Super Admin') {
      //this.getRegisteredUsers(this.currentYear);
    }
  }

  getData($event) {
    this.getRegisteredUsers($event.target.value);
  }

  getRegisteredUsers(year:number) {
    this.dashboardService.userStatistics({'year':year}).subscribe(
      (response:any)=>{
        this.lineChartLabels = response.label;
        this.lineChartData[0].data = response.data;
      }
    )
  }

}
