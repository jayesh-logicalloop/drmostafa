import { Component, OnInit, ViewChild, AfterViewInit, Input, ViewEncapsulation } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { TranslateService } from '@ngx-translate/core';

import { ApiService } from '../../services/api.service';
import { CommonService } from '../../services/common.service';
import { AppointmentService } from '../../services/appointment.service';

@Component({
  selector: 'app-appointment-calendar',
  templateUrl: './appointment-calendar.component.html',
  styleUrls: ['./appointment-calendar.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppointmentCalendarComponent implements OnInit, AfterViewInit {
  userType = '';
  userId = '';
  langCode = 'en';

  @ViewChild('calendar', { static: true }) calendarComponent: FullCalendarComponent;
  @Input() user_id = '';
  @Input() calendarDefaultView = 'timeGridWeek';
  calendarPlugins = [timeGridPlugin, dayGridPlugin];
  showAppointmentCalendarLoader = true;
  headerToolbar = {
    left:   'today prev,next',
    center: 'title',
    right:  'dayGridMonth, timeGridWeek'
  };
  appointmentDetail = {
    "token": "",
    "patient_id": "",
    "appointment_id": "",
    "patient_name": "",
    "patient_image_url": "",
    "last_visit": "",
    "status": "",
    "appointment_status": "",
    "mark_completed": "",
    "patient_age_formatted": "",
    "patient_gender": "",
    "appointment_date": "",
    "appointment_time": "",
    "appointment_time_formatted": "",
    "appointment_date_formatted": "",
    "appointment_from_time": "",
    "appointment_from_time_formatted": "",
    "appointment_to_time": "",
    "appointment_to_time_formatted": "",
    "appointment_note": "",
    "doctor_name": "",
    "doctor_education": "",
    "doctor_specialization": "",
    "doctor_experience_formatted": "",
    "doctor_image_url": "",
    "feedback_id": "",
    "feedback_rating": "",
    "feedback_comment": "",
    "feedback_profile": "",
    "follow_up_id": "",
    "afp_patient_id": "",
    "afp_doctor_id": "",
    "afp_app_date": "",
    "afp_appointment_from_time": "",
    "afp_appointment_to_time": "",
    "afp_note": "",
    "prescriptions": {
      'Medicine': [],
      'Lab': [],
      'Imaging': [],
      'Recommend': [],
      'Report': []
    },
    "attachments": [],
    "services": {
      "id": "",
      "instructions": "",
      "service_fee": "",
      "service_fee_formatted": "",
      "service_name": ""
    },
  }

  constructor(
	private translate: TranslateService,
    private apiService: ApiService,
    private appointmentService: AppointmentService,
    private commonService: CommonService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.apiService.currentUserData.subscribe(
      (userData: any) => {
        this.userType = (userData.group_name) ? userData.group_name : this.commonService.getUserData('group_name');
        this.userId = (userData.user_id) ? userData.user_id : this.commonService.getUserData('user_id');
      }
    );
    this.langCode = localStorage.getItem('lang') ? localStorage.getItem('lang') : 'ar';
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
  }

  ngAfterViewInit() {
    let calendarApi = this.calendarComponent.getApi();
    //console.log(calendarApi);
    //calendarApi.next();
  }

  userAppointmentEvents = (dates:any, callback:any) => {
    this.showAppointmentCalendarLoader = true;
    let start = this.commonService.dateFormat(dates.start);
    let end = this.commonService.dateFormat(dates.end);
    this.appointmentService.calendar_data({'start_date':start, 'end_date':end}).subscribe(
      (response:any) => {
        callback(response.data);
        this.showAppointmentCalendarLoader = false;
      },
      (error) => { this.showAppointmentCalendarLoader = false; }
    );
  };

  openModalFlag = false;
  onViewAppointmentDetail($event) {
    this.showAppointmentCalendarLoader = true;
    this.openModalFlag = false;
    this.appointmentService.appointments({appointment_id: $event.event.id}).subscribe(
      (response: any) => {
        if (response.status) {
          this.appointmentDetail = response.data;
          this.openModalFlag = true;
        }
        this.showAppointmentCalendarLoader = false;
      },
      (error) => {this.showAppointmentCalendarLoader = false;}
    )
  }

}
