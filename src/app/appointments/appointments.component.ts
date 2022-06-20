import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

import { ApiService } from './../services/api.service';
import { CommonService } from '../services/common.service';
import { AppointmentService } from './../services/appointment.service';
import { FeedbackService } from './../services/feedback.service';
import { ModalService } from '../services/modal.service';
import { AlertService } from '../services/alert.service';
import { Select2OptionData } from 'ng-Select2';
import { Options } from 'select2';
declare var jQuery: any;

import * as firebase from 'firebase';

import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as _moment from 'moment';
const moment = _moment;
export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

import { iAppointment } from '../services/interface/i-appointment';

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class AppointmentsComponent implements OnInit {
  userType = '';
  userId = '';

  activeTab = 'upcoming';

  showContentLoader = false;
  appointmentDetailLoader = false;
  appointmentDetail = {
    "token": "",
    "clinic_id": "",
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
  };

  appointmentReschdule = {
    "patient_id": "",
    "appointment_id": "",
    "doctor_id": "",
    "user_id": "",
    "clinic_id": "",
    "appointment_from_time": "",
    "appointment_to_time": "",
    "appointment_time": "",
    "appointment_date": "",
    "appointment_date_formatted": "",
    "reschedule_reason": "",
  };

  itemsPerPage = 5;
  viewType = 'list';
  search = '';
  from_date = '';
  to_date = '';
  popoverToggle = false;

  status = '';
  appointment_id = '';
  index = '';

  minDate = new Date(3600000 * Math.floor(Date.now() / 3600000));

  @ViewChild('ngrecheduleform', { static: false }) ngrecheduleform: NgForm;
  rescheduleForm: FormGroup;
  rescheduleFormLoader = false;
  maxRescheduleDate = new Date(new Date().getTime() + (15 * 24 * 60 * 60 * 1000));

  @ViewChild('ngmarkcompleteform', { static: false }) ngmarkcompleteform: NgForm;
  markCompleteForm: FormGroup;
  markCompleteFormLoader = false;

  searchForm: FormGroup;
  searchFormLoader = false;

  addFormAction = false;
  patient_id = '';
  EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  EXCEL_EXTENSION = '.xlsx';

  constructor(
    private translate: TranslateService,
    private title: Title,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private appointmentService: AppointmentService,
    private feedbackService: FeedbackService,
    private commonService: CommonService,
    private modalService: ModalService,
    private alertService: AlertService
  ) {
    const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Appointments');

    this.activatedRoute.queryParamMap.subscribe(params => {
      this.activeTab = params.get('tab') ? params.get('tab') : 'upcoming';
    });

    this.apiService.currentUserData.subscribe(
      (userData: any) => {
        this.userType = (userData.group_name) ? userData.group_name : this.commonService.getUserData('group_name');
        this.userId = (userData.user_id) ? userData.user_id : this.commonService.getUserData('user_id');
      }
    );

    this.apiService.currentUserData.subscribe(
      (userData: any) => {
        this.userType = (userData.group_name) ? userData.group_name : this.commonService.getUserData('group_name');
      }
    );

    this.addFeedbackForm = this.formBuilder.group({
      feedback_rating: ['', [Validators.required]],
      feedback_comment: ['', [
        Validators.required,
        Validators.minLength(20),
        Validators.maxLength(200)
      ]],
      happy_with: [''],
      recommendation: ['', Validators.required]

    });

    //Reschedule Form
    this.rescheduleForm = this.formBuilder.group({
      appointment_date: ['', [
        Validators.required
      ]],
      appointment_time: ['', [
        Validators.required
      ]],
      reason: ['', []]
    });

    //Mark complete Form
    this.markCompleteForm = this.formBuilder.group({
      report: ['', [
        Validators.required,
        Validators.maxLength(1000)
      ]]
    });

    //Search Form
    this.searchForm = this.formBuilder.group({
      search: [''],
      to_date: [''],
      from_date: [''],
    });
  }

  confirm_appointment_label = "Confirm Appointment";
  complete_appointment_label = "Complete Apppointment";
  are_you_sure = "Are you sure?";
  ok = "OK";
  cancel = "Cancel";
  request_patient_to_reschedule_appointment = "Request patient to reschedule appointment";
  cancel_appointment_label = "Cancel Appointment";
  decline_appointment_label = "Decline Appointment";
  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.total_upcoming_appointments();
    this.total_pending_appointments();
    this.total_past_appointments();
    this.getTotalInstantAppointments();
    this.getFBInstantAppointments();
    this.translate.stream(['']).subscribe(translations => {
      this.confirm_appointment_label = this.translate.instant('confirm_appointment');
      this.complete_appointment_label = this.translate.instant('complete_appointment');
      this.are_you_sure = this.translate.instant('are_you_sure');
      this.ok = this.translate.instant('ok');
      this.cancel = this.translate.instant('cancel');
      this.request_patient_to_reschedule_appointment = this.translate.instant('request_patient_to_reschedule_appointment');
      this.cancel_appointment_label = this.translate.instant('cancel_appointment');
      this.decline_appointment_label = this.translate.instant('decline_appointment');
    });

  }




  currentPageUp = 1;
  totalUpcomingItems: number;
  upcoming_appointments = [];

  total_upcoming_appointments() {
    let params = {
      appointment_type: 'upcoming',
      search: this.search,
      from_date: this.from_date,
      to_date: this.to_date,
      patient_id: this.patient_id
    };
    this.appointmentService.total_appointments(params).subscribe(
      (response: any) => {
        this.totalUpcomingItems = response.data;
        if (this.totalUpcomingItems > 0) {
          this.get_upcoming_appointments();
        }
      }
    );
  }

  get_upcoming_appointments() {
    let params = {
      appointment_type: 'upcoming',
      search: this.search,
      from_date: this.from_date,
      to_date: this.to_date,
      patient_id: this.patient_id,
      limit: this.itemsPerPage,
      page: this.currentPageUp
    };
    this.showContentLoader = true;
    this.appointmentService.appointments(params).subscribe(
      (response: any) => {

        if (response.status) {
          this.upcoming_appointments = response.data;
        } else {
          this.upcoming_appointments = [];
        }
        this.showContentLoader = false;
      },
      (error) => { this.showContentLoader = false; }
    );
  }

  upcoming_pageChanged(up: number) {
    this.currentPageUp = up;
    this.get_upcoming_appointments();
  }

  currentPageIn = 1;
  totalInstantItems: number;
  instant_appointments = [];
  getTotalInstantAppointments() {
    let params = {
      appointment_type: 'instant',
      search: this.search,
      from_date: this.from_date,
      to_date: this.to_date,
      patient_id: this.patient_id
    };
    this.appointmentService.total_appointments(params).subscribe(
      (response: any) => {
        this.totalInstantItems = response.data;
        if (this.totalInstantItems > 0) {
          this.getInstantAppointments();
        }
      }
    );
  }

  getInstantAppointments() {
    let param = {
      appointment_type: 'instant',
      search: this.search,
      from_date: this.from_date,
      to_date: this.to_date,
      patient_id: this.patient_id,
      limit: this.itemsPerPage,
      page: this.currentPageIn
    };
    this.showContentLoader = true;
    this.appointmentService.appointments(param).subscribe(
      (response: any) => {
        if (response.status) {
          this.instant_appointments = response.data;
        }
        this.showContentLoader = false;
      },
      (error) => { this.showContentLoader = false; }
    );
  }

  instant_pageChanged(up: number) {
    this.currentPageIn = up;
    this.getInstantAppointments();
  }

  fbInstantAppointments = [];
  getFBInstantAppointments() {
    let orderBy = 'user_id';
    if (this.userType == 'Doctor') {
      orderBy = 'doctor_id';
    }
    firebase.database().ref('instantAppointments/').orderByChild(orderBy).equalTo(this.userId).on('value', resp => {
      this.fbInstantAppointments = [];
      this.fbInstantAppointments = this.commonService.fbSnapshotToArray(resp);
      //console.log('this.fbInstantAppointments', this.fbInstantAppointments);
      this.getTotalInstantAppointments();
    });
  }

  currentPagePe = 1;
  totalPendingItems: number;
  pending_appointments = [];
  total_pending_appointments() {
    let params = {
      appointment_type: 'pending',
      search: this.search,
      from_date: this.from_date,
      to_date: this.to_date,
      patient_id: this.patient_id
    };
    this.appointmentService.total_appointments(params).subscribe(
      (response: any) => {
        this.totalPendingItems = response.data;
        if (this.totalPendingItems > 0) {
          this.get_pending_appointments();
        }
      }
    );
  }

  get_pending_appointments() {
    let params = {
      appointment_type: 'pending',
      search: this.search,
      from_date: this.from_date,
      to_date: this.to_date,
      patient_id: this.patient_id,
      limit: this.itemsPerPage,
      page: this.currentPagePe
    };
    this.showContentLoader = true;
    this.appointmentService.appointments(params).subscribe(
      (response: any) => {
        if (response.status) {
          this.pending_appointments = response.data;
        }
        this.showContentLoader = false;
      },
      (error) => { this.showContentLoader = false; },
    );
  }

  pending_pageChanged(pe: number) {
    this.currentPagePe = pe;
    this.get_pending_appointments();
  }

  currentPagePa = 1;
  totalPastItems: number;
  past_appointments = [];
  total_past_appointments() {
    let params = {
      appointment_type: 'past',
      search: this.search,
      from_date: this.from_date,
      to_date: this.to_date,
      patient_id: this.patient_id
    };
    this.appointmentService.total_appointments(params).subscribe(
      (response: any) => {
        this.totalPastItems = response.data;
        if (this.totalPastItems > 0) {
          this.get_past_appointments();
        }
      }
    );
  }

  get_past_appointments() {
    let params = {
      appointment_type: 'past',
      search: this.search,
      from_date: this.from_date,
      to_date: this.to_date,
      patient_id: this.patient_id,
      limit: this.itemsPerPage,
      page: this.currentPagePa,
      ob_key: 'appointment_datetime',
      ob_value: 'DESC'
    };
    this.showContentLoader = true;
    this.appointmentService.appointments(params).subscribe(
      (response: any) => {

        if (response.status) {
          this.past_appointments = response.data;
        } else {
          this.past_appointments = [];
        }
        this.showContentLoader = false;
      },
      (error) => { this.showContentLoader = false; }
    );
  }

  past_pageChanged(pa: number) {
    this.currentPagePa = pa;
    this.get_past_appointments();
  }

  getAppointment(appointment_id = '') {
    this.addFormAction = true;
    this.appointmentService.appointments({ appointment_id: appointment_id }).subscribe(
      (response: any) => {
        if (response.status) {
          this.addFormAction = false;
          this.appointmentDetail = response.data;
        }
      },
      (error) => { this.addFormAction = false; }
    )
  }

  openReschuledAppointmentModal(appointment_id: any) {
    if (this.userType == 'Super Admin') {
      Swal.fire({
        title: this.request_patient_to_reschedule_appointment,
        text: this.are_you_sure,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: this.ok,
        cancelButtonText: this.cancel
      }).then((result) => {
        if (result.value) {
          this.showContentLoader = true;
          let params = {
            'token': this.commonService.getUserData('token'),
            'appointment_id': appointment_id
          };
          this.appointmentService.requestReschedule(params).subscribe(
            (response: any) => {
              if (response.status) {
                this.total_upcoming_appointments();
                this.total_pending_appointments();
              }
              this.showContentLoader = false;
            },
            (error) => {
              this.showContentLoader = false;
            }
          );
        }
      });
    } else {
      this.appointmentService.appointments({ 'appointment_id': appointment_id }).subscribe(
        (response: any) => {
          if (response.status) {
            this.appointmentReschdule = response.data;
            this.appointmentDetail.appointment_id = appointment_id;
            this.ngrecheduleform.resetForm();
            this.modalService.open_modal('#rescheduleModal');
          }
        }
      );
    }
  }

  timeslotData = {
    "date": "",
    "date_formatted": "",
    "slots": {
      "Afternoon": [],
      "Evening": [],
      "Morning": [],
      "Night": []
    },
    "total_slots": 0,
    "total_slots_formatted": "0 slots available"
  };
  onChangeRescheduleDate() {
    this.rescheduleFormLoader = true;
    let params = {
      "user_id": this.appointmentReschdule.doctor_id,
      "for_date": this.rescheduleForm.value.appointment_date.format("YYYY-MM-DD"),
      "clinic_id": this.appointmentReschdule.clinic_id,
    }
    this.appointmentService.appointment_slot(params).subscribe(
      (response: any) => {
        if (response.status) {
          this.timeslotData = response.data;
        } else {
          this.alertService.show_alert(response.message, '', 'error');
        }
        this.rescheduleFormLoader = false;
      },
      (error) => { this.rescheduleFormLoader = false; }
    )
  }

  onSubmitRecheduleForm() {
    if (this.rescheduleForm.valid) {
      this.rescheduleFormLoader = true;
      let putData = {
        "token": this.commonService.getUserData('token'),
        "clinic_id": this.appointmentDetail.clinic_id,
        "appointment_id": this.appointmentDetail.appointment_id,
        "appointment_date": this.commonService.dateFormat(this.rescheduleForm.value.appointment_date),
        "appointment_from_time": this.rescheduleForm.value.appointment_time,
        "appointment_to_time": this.rescheduleForm.value.appointment_time,
        "reason": this.rescheduleForm.value.reason
      };
      this.appointmentService.reschedule_appointment(putData).subscribe(
        (response: any) => {
          if (response.status) {
            this.modalService.close_modal("#rescheduleModal");
            this.alertService.show_alert(response.message);
            this.get_upcoming_appointments();
            this.get_pending_appointments();
          }
          this.rescheduleFormLoader = false;
        },
        (error) => { this.rescheduleFormLoader = false; },
        () => { this.rescheduleFormLoader = false; }
      );
    }
  }

  openAppointmentDetailModal = false;
  onViewAppointmentDetail(appointment_id: string, i: number, appointment_type: string) {
    /*this.openAppointmentDetailModal = false;
    if(appointment_type == 'pending') {
      this.appointmentDetail = this.pending_appointments[i];
    } else if(appointment_type == 'upcoming') {
      this.appointmentDetail = this.upcoming_appointments[i];
    } else if(appointment_type == 'instant') {
      this.appointmentDetail = this.instant_appointments[i];
    } else if(appointment_type == 'past') {
      this.appointmentDetail = this.past_appointments[i];
    }
    this.openAppointmentDetailModal = true;
    //console.log('this.appointmentDetail', this.appointmentDetail);
    */

    this.addFormAction = true;
    this.openAppointmentDetailModal = false;
    this.appointmentService.appointments({ appointment_id: appointment_id }).subscribe(
      (response: any) => {
        if (response.status) {
          this.appointmentDetail = response.data;
          this.openAppointmentDetailModal = true;
        }
        this.addFormAction = false;
      },
      (error) => { this.addFormAction = false; }
    )
  }

  onSubmitSearchForm() {
    this.search = this.searchForm.value.search;
    if (this.searchForm.value.from_date != '') {
      this.from_date = this.commonService.dateFormat(this.searchForm.value.from_date);
    }
    if (this.searchForm.value.to_date != '') {
      this.to_date = this.commonService.dateFormat(this.searchForm.value.to_date);
    }
    this.total_upcoming_appointments();
    this.getTotalInstantAppointments();
    this.total_pending_appointments();
    this.total_past_appointments();
    this.togglePopover();
  }

  clearFilter() {
    this.searchForm.patchValue({ 'search': '', 'from_date': '', 'to_date': '' });
    this.search = '';
    this.from_date = '';
    this.to_date = '';
    this.total_upcoming_appointments();
    this.getTotalInstantAppointments();
    this.total_pending_appointments();
    this.total_past_appointments();
    this.togglePopover();
  }

  cancelFilter() {
    this.searchForm.patchValue({ 'search': '', 'from_date': '', 'to_date': '' });
    this.search = '';
    this.from_date = '';
    this.to_date = '';
    this.togglePopover();
  }

  togglePopover() {
    if (this.popoverToggle) {
      jQuery('.popover__content').css({ 'visibility': 'hidden' });
      this.popoverToggle = false;
    } else {
      jQuery('.popover__content').css({ 'visibility': 'visible', 'z-index': '10', "opacity": '1', "transform": "translate(0, -20px)", 'transition': ' all 0.5s cubic-bezier(0.75, -0.02, 0.2, 0.97)' });
      this.popoverToggle = true;
    }
  }

  changeViewType(viewType: string) {
    this.viewType = viewType;
  }

  confirmAppointment(appointment_id: string) {
    Swal.fire({
      title: this.confirm_appointment_label,
      text: this.are_you_sure,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: this.ok,
      cancelButtonText: this.cancel
    }).then((result) => {
      if (result.value) {
        this.addFormAction = true;
        let putData = {
          "token": this.commonService.getUserData('token'),
          "appointment_id": appointment_id,
        }
        this.appointmentService.confirm_appointment(putData).subscribe(
          (response: any) => {
            if (response.status) {
              this.total_pending_appointments();
              this.total_upcoming_appointments();
              this.alertService.show_alert(response.message);
            }
            this.addFormAction = false;
          },
          (error) => { this.addFormAction = false; }
        )
      }
    });
  }

  completeAppointment(appointment_id: string) {

    Swal.fire({
      title: this.complete_appointment_label,
      text: this.are_you_sure,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: this.ok,
      cancelButtonText: this.cancel
    }).then((result) => {
      if (result.value) {
        this.addFormAction = true;
        let putData = {
          "token": this.commonService.getUserData('token'),
          "appointment_id": appointment_id,
        }
        this.appointmentService.complete_appointment(putData).subscribe(
          (response: any) => {
            if (response.status) {
              // this.total_past_appointments();
              this.get_upcoming_appointments();
              this.get_past_appointments();
              this.alertService.show_alert(response.message);
            }
            this.addFormAction = false;
          }, (error) => { this.addFormAction = false; }
        )
      }
    });
  }

  cancelAppointment(appointment_id: string) {
    Swal.fire({
      title: this.cancel_appointment_label,
      text: this.are_you_sure,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.ok,
      cancelButtonText: this.cancel
    }).then((result) => {
      if (result.value) {
        let putData = {
          "token": this.commonService.getUserData('token'),
          "appointment_id": appointment_id,
        }
        this.addFormAction = true;
        this.appointmentService.cancel_appointment(putData).subscribe(
          (response: any) => {
            if (response.status) {
              this.alertService.show_alert(response.message)
              this.get_upcoming_appointments();
              this.get_pending_appointments();
            }
            this.addFormAction = false;
          },
          (error) => { this.addFormAction = false; }
        );
      }
    });
  }

  declineAppointment(appointment_id: string) {
    Swal.fire({
      title: this.decline_appointment_label,
      text: this.are_you_sure,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.ok,
      cancelButtonText: this.cancel
    }).then((result) => {
      if (result.value) {
        let putData = {
          "token": this.commonService.getUserData('token'),
          "appointment_id": appointment_id,
        }
        this.addFormAction = true;
        this.appointmentService.decline_appointment(putData).subscribe(
          (response: any) => {
            if (response.status) {
              this.alertService.show_alert(response.message)
              this.total_pending_appointments();
            }
            this.addFormAction = false;
          },
          (error) => { this.addFormAction = false; }
        );
      }
    });
  }

  @ViewChild('ngfeedbackform', { static: false }) ngfeedbackform: NgForm;
  addFeedbackForm: FormGroup;
  addFeedbackFormLoader = false;
  feedbackSelect2Options: Options = { width: '100%', multiple: true, tags: false };
  feedbackSelect2Data: Select2OptionData[] = [
    { id: "Doctor friendliness", text: "Doctor friendliness" },
    { id: "Explanation of the health issue", text: "Explanation of the health issue" },
    { id: "Treatment satisfaction", text: "Treatment satisfaction" },
    { id: "Value for money", text: "Value for money" },
    { id: "Wait time", text: "Wait time" }
  ];
  activeRating: number = 0;
  is_yes = false;
  is_no = false;
  feedbackAlreadyGiven = false;

  openFeedbackModal(appointment_id: string, i: number) {
    this.feedbackAlreadyGiven = false;
    if ("feedback_id" in this.past_appointments[i].feedback) {
      this.feedbackAlreadyGiven = true;
    }
    this.appointment_id = appointment_id;
    this.addFeedbackForm.reset();
    this.ngfeedbackform.resetForm();
    this.activeRating = 0;
    this.is_yes = false;
    this.is_no = false;
    this.modalService.open_modal('#feedbackModal');
  }

  onSubmitFeedbackForm() {
    if (this.addFeedbackForm.valid) {
      let postData = new FormData;
      postData.append('token', this.commonService.getUserData('token'));
      postData.append('appointment_id', this.appointment_id);
      postData.append('feedback_rating', this.activeRating + '');
      postData.append('recommendation', this.addFeedbackForm.value.recommendation);
      postData.append('happy_with', this.addFeedbackForm.value.happy_with);
      postData.append('feedback_comment', this.addFeedbackForm.value.feedback_comment);
      this.addFeedbackFormLoader = true;
      this.feedbackService.feedbacks_post(postData).subscribe(
        (response: any) => {
          if (response.status) {
            this.modalService.close_modal("#feedbackModal");
            this.alertService.show_alert(response.message);
            let index = this.past_appointments.findIndex(x => x.appointment_id == this.appointment_id);
            this.past_appointments[index]['feedback'] = { 'feedback_id': response.data };
          }
          this.addFeedbackFormLoader = false;
        },
        (error) => { this.addFeedbackFormLoader = false; }
      );
    }
  }

  changeRating(r: number) {
    this.activeRating = r;
    if (this.activeRating > 0) {
      this.addFeedbackForm.patchValue({
        feedback_rating: this.activeRating
      });
    } else {
      this.addFeedbackForm.patchValue({
        feedback_rating: 0
      });
    }
  }

  recommendDoc(type = '') {
    if (type == 'Yes') {
      this.addFeedbackForm.patchValue({ recommendation: 'Yes' });
      this.is_yes = true;
      this.is_no = false;
    } else {
      this.addFeedbackForm.patchValue({ recommendation: 'No' });
      this.is_yes = false;
      this.is_no = true;
    }
  }

  alreadyMarkCompleted = false;

  openMarkCompleteModal(appointment_id: string, i: number, appointment_type: string) {
    this.alreadyMarkCompleted = false;
    if (appointment_type == 'upcoming' && this.upcoming_appointments[i].prescriptions.Report.length) {
      this.alreadyMarkCompleted = true;
    } else if (appointment_type == 'instant' && this.instant_appointments[i].prescriptions.Report.length) {
      this.alreadyMarkCompleted = true;
    } else if (appointment_type == 'past' && this.past_appointments[i].prescriptions.Report.length) {
      this.alreadyMarkCompleted = true;
    }
    this.appointment_id = appointment_id;
    this.markCompleteForm.reset();
    this.ngmarkcompleteform.resetForm();
    this.modalService.open_modal('#markCompleteModal');
  }

  onSubmitMarkCompleteForm() {
    if (this.markCompleteForm.valid) {
      let formData = {
        token: this.commonService.getUserData('token'),
        appointment_id: this.appointment_id,
        report: this.markCompleteForm.value.report
      };
      this.markCompleteFormLoader = true;
      this.appointmentService.complete_appointment(formData).subscribe(
        (response: any) => {
          if (response.status) {
            this.modalService.close_modal("#markCompleteModal");
            this.alertService.show_alert(response.message);
          }
          this.markCompleteFormLoader = false;
        },
        (error) => { this.markCompleteFormLoader = false; }
      );
    }
  }

  exportAppoinmentsData() {

    let params = {
      appointment_type: 'upcoming',
      search: this.search,
      from_date: this.from_date,
      to_date: this.to_date,
      patient_id: this.patient_id,
      limit: this.totalUpcomingItems,
      page: this.currentPageUp
    };
    this.showContentLoader = true;
    this.appointmentService.appointments(params).subscribe((response: any) => {
      if (response.status) {
        this.upcoming_appointments = response.data;
        let data = [];
        response.data.forEach(element => {
          data.push({
            'appointment Id': element.appointment_id,
            'appointment Date': element.appointment_date,
            'Note': element.appointment_id,
            'Patient Name': element.patient_name,
          })
        });
        this.exportAsExcelFile(data, 'upcoming')
      }
      this.showContentLoader = false;
    }, (error) => {
      this.showContentLoader = false;
    });


  }

  private exportAsExcelFile(json: any[], excelFileName: string): void {

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    console.log('worksheet', worksheet);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    //const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: this.EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + this.EXCEL_EXTENSION);
  }

}
