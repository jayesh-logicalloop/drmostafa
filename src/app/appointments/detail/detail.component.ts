import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

import { ApiService } from '../../services/api.service';
import { CommonService } from '../../services/common.service';
import { AppointmentService } from '../../services/appointment.service';
import { AppointmentPrescriptionService } from '../../services/appointment-prescription.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DetailComponent implements OnInit {
  userType = '';
  userId = '';

  @Input() appointmentDetail = {
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
  };
  @Input() openModalFlag = false;
  appointmentDetailLoader = false;

  constructor(
	  private translate: TranslateService,
    private apiService: ApiService,
    private commonService: CommonService,
    private appointmentService: AppointmentService,
    private appointmentPrescriptionService: AppointmentPrescriptionService,
    private modalService: ModalService
  ){
	  const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.apiService.currentUserData.subscribe(
      (userData: any) => {
        this.userType = (userData.group_name) ? userData.group_name : this.commonService.getUserData('group_name');
        this.userId = (userData.user_id) ? userData.user_id : this.commonService.getUserData('user_id');
      }
    );
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    //console.log('this.appointmentDetail', this.appointmentDetail);
  }

  ngOnChanges(changes:any) {
    if(changes.hasOwnProperty('openModalFlag') && changes.openModalFlag.currentValue) {
      this.modalService.open_modal('#viewAppointment');
    }
  }

  consultNow() {
    this.modalService.close_modal('#viewAppointment');
  }

  download_prescription(appointment_id: string) {
    this.appointmentDetailLoader = true;
    this.appointmentPrescriptionService.download({appointment_id: appointment_id}).subscribe(
      (response: any) => {
        if (response.status) {
          const linkSource = 'data:application/pdf;base64,' + response.data;
          const downloadLink = document.createElement("a");
          const fileName = "Prescription Details" + ".pdf";
          downloadLink.href = linkSource;
          downloadLink.download = fileName;
          downloadLink.click();
        }
        this.appointmentDetailLoader = false;
      },
      (error) => { this.appointmentDetailLoader = false; }
    )
  }

  unshareReport(id:string, appointment_id:string, i:number) {
    Swal.fire({
      title: 'Unshare Health Record',
      text: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        this.appointmentDetailLoader = true;
        this.appointmentService.remove_attachment(id, appointment_id).subscribe(
          (response: any) => {
            if (response.status) {
              this.appointmentDetail.attachments.splice(i, 1);
            }
            this.appointmentDetailLoader = false;
          },
          (error) => {this.appointmentDetailLoader = false;}
        );
      }
    });
  }

}
