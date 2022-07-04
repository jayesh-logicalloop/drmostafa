import { Component, ElementRef, HostListener, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormBuilder, FormControl, FormArray, Validators, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

import { Select2OptionData } from 'ng-Select2';
import { Options } from 'select2';

import { AgoraClient, ClientEvent, NgxAgoraService, Stream, StreamEvent } from 'ngx-agora';
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

import { ApiService } from '../../services/api.service';
import { CommonService } from '../../services/common.service';
import { AppointmentService } from '../../services/appointment.service';
import { MessagesService } from '../../services/messages.service';
import { NotificationService } from '../../services/notification.service';
import { AppointmentPrescriptionService } from '../../services/appointment-prescription.service';
import { HealthRecordService } from '../../services/health-record.service';
import { DrugService } from '../../services/drug.service';
import { AlertService } from '../../services/alert.service';
import { ModalService } from '../../services/modal.service';
import { iHealthRecord } from 'src/app/services/interface/i-health-record';
declare var jQuery: any;

import * as RecordRTC from 'recordrtc';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-consult',
  templateUrl: './consult.component.html',
  styleUrls: ['./consult.component.css'],
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
export class ConsultComponent implements OnInit {
  //Lets declare Record OBJ
  record;
  //Will use this flag for toggeling recording
  recording = false;
  //URL of Blob
  url;
  blob;
  error;

  appointment_id = '';
  appointmentDetail: any;
  attachments = [];
  userID = '';
  userType = '';
  index: number;
  prescription_id = '';
  fb_key = '';
  editButton = false;

  @ViewChild('ngprescriptionform', { static: false }) ngprescriptionform: NgForm;
  prescriptionForm: FormGroup;
  prescriptionFormLoader = false;
  drugsSelect2Options: Options = { width: '100%', multiple: false, tags: false };
  drugsSelect2Data: Select2OptionData[];
  dataLoader = false;

  @ViewChild('scrollMe', { static: false }) private myScrollContainer: ElementRef;
  chatForm: FormGroup;
  chatFormLoader = false;

  messages: any[] = [];

  prescriptions = {
    'Medicine': [],
    'Lab': [],
    'Imaging': [],
    'Recommend': [],
    'Report': []
  };
  appointmentPrescriptionsRef = firebase.database().ref('appointmentPrescriptions/');

  localCallId = 'agora_local';
  remoteCalls: string[] = [];

  client: AgoraClient;
  localStream: Stream;
  uid: number;
  agoraToken = '';
  channelName = '';
  fullscreen = false;

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.fullscreen = false;
  }

  shareHealthRecordAction = '';
  healthRecordsDataLoader = false;
  healthRecords: iHealthRecord[];
  maxDateDob = this.commonService.maxDobDate;
  @ViewChild('ngaddhealthrecordform', { static: false }) ngaddhealthrecordform: NgForm;
  @ViewChild('ngaddhealthrecordfileinput', { static: false }) ngaddhealthrecordfileinput: ElementRef;
  addHealthRecordForm: FormGroup;
  addHealthRecordFormLoader = false;
  addHealthRecordFileInput: File;
  record_type = '';

  editorConfig = {
    allowedContent: true,
    removePlugins: ''
  };

  constructor(
    private translate: TranslateService,
    private ngxAgoraService: NgxAgoraService,
    private title: Title,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private commonService: CommonService,
    private appointmentService: AppointmentService,
    private messagesService: MessagesService,
    private appointmentPrescriptionService: AppointmentPrescriptionService,
    private healthRecordService: HealthRecordService,
    private drugService: DrugService,
    private modalService: ModalService,
    private alertService: AlertService,
    private notificationService: NotificationService,
    private domSanitizer: DomSanitizer
  ) {
    const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Consultation');
    this.apiService.currentUserData.subscribe(
      (userData: any) => {
        this.userType = (userData.group_name) ? userData.group_name : this.commonService.getUserData('group_name');
        /* const allowedUserTypes = ['Patient', 'Doctor'];
        if (!allowedUserTypes.includes(this.userType)) {
          this.commonService.userDefaultRoute();
        } */
      }
    );

    this.uid = Math.floor(Math.random() * 100);

    this.activatedRoute.params.subscribe(routeParams => {
      this.appointment_id = routeParams.appointment_id;
      this.appointment_detail();
      if (this.userType == 'Doctor') {
        this.getDrugList();
      }
    });

    this.prescriptionForm = this.formBuilder.group({
      // prescription_type: ['Medicine', [Validators.required]],
      item_name: ['', [Validators.required]],
      // dosage: ['', [Validators.required]],
      // frequency: ['', [Validators.required]],
      // intake: ['After Food', [Validators.required]],
      // duration: ['', [Validators.required]],
      // duration_type: ['Day', [Validators.required]],
      // prescribe_note: [''],
    });

    this.chatForm = this.formBuilder.group({
      'message': ['']
    });

    this.addHealthRecordForm = this.formBuilder.group({
      records: new FormArray([]),
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(200)
      ]],
      doctor: [''],
      description: [''],
      file: ['', [
        Validators.required
      ]],
      record_date: ['', [
        Validators.required
      ]],
      record_type: ['', [
        Validators.required
      ]]
    });
  }

  get recordsFormArray() {
    return this.addHealthRecordForm.controls.records as FormArray;
  }

  sanitize(url: string) {
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }

  resetRecording() {
    this.url = null;
    this.blob = null;
    this.error = null;
  }

  /**
  * Start recording.
  */
  initiateRecording() {
    this.resetRecording();
    let mediaConstraints = {
      video: false,
      audio: true
    };
    navigator.mediaDevices.getUserMedia(mediaConstraints).then(this.successCallback.bind(this), this.errorCallback.bind(this));
  }
  /**
  * Will be called automatically.
  */
  successCallback(stream) {
    var options = {
      mimeType: "audio/wav",
      numberOfAudioChannels: 2,
      sampleRate: 48000,
    };
    //Start Actuall Recording
    this.recording = true;
    var StereoAudioRecorder = RecordRTC.StereoAudioRecorder;
    this.record = new StereoAudioRecorder(stream, options);
    this.record.record();
  }
  /**
  * Stop recording.
  */
  stopRecording() {
    this.recording = false;
    this.record.stop(this.processRecording.bind(this));
  }
  /**
  * processRecording Do what ever you want with blob
  * @param  {any} blob Blog
  */
  processRecording(blob) {
    this.blob = blob;
    this.url = URL.createObjectURL(blob);
    //console.log("blob", blob);
    //console.log("url", this.url);
  }
  /**
  * Process Error.
  */
  errorCallback(error) {
    this.error = 'Can not play audio in your browser';
  }

  sendAudioMessage() {
    //console.log("blob", this.blob);
    //console.log("url", this.url);
    this.chatFormLoader = true;
    let postData = new FormData();
    postData.append('token', this.commonService.getUserData('token'));
    postData.append('message_type', 'Voice');
    postData.append('voice_message', this.blob, 'audio.wav');
    postData.append('user_id', this.appointmentDetail.user_id);

    this.messagesService.create(postData).subscribe(
      (response: any) => {
        this.chatFormLoader = false;
        this.messages.push(response.data);
        this.resetRecording();
        this.scrollToBottom();
      },
      (error) => {
        this.chatFormLoader = false;
      }
    );
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    // this.prescriptionForm.get('prescription_type').valueChanges.subscribe(value => {
    //   if (['Lab', 'Imaging', 'Recommend'].includes(value)) {
    //     this.prescriptionForm.get('item_name').clearValidators();
    //     this.prescriptionForm.get('dosage').clearValidators();
    //     this.prescriptionForm.get('frequency').clearValidators();
    //     this.prescriptionForm.get('intake').clearValidators();
    //     this.prescriptionForm.get('duration').clearValidators();
    //     this.prescriptionForm.get('duration_type').clearValidators();
    //     this.prescriptionForm.get('prescribe_note').setValidators([Validators.required, Validators.maxLength(1000)]);
    //     this.prescriptionForm.patchValue({
    //       'item_name': '', 'dosage': '', 'frequency': '', 'intake': '', 'duration': '', 'duration_type': ''
    //     });
    //   } else if (value == 'Medicine') {
    //     this.prescriptionForm.get('item_name').setValidators([Validators.required]);
    //     this.prescriptionForm.get('dosage').setValidators([Validators.required]);
    //     this.prescriptionForm.get('frequency').setValidators([Validators.required]);
    //     this.prescriptionForm.get('intake').setValidators([Validators.required]);
    //     this.prescriptionForm.get('duration').setValidators([Validators.required]);
    //     this.prescriptionForm.get('duration_type').setValidators([Validators.required]);
    //     this.prescriptionForm.get('prescribe_note').clearValidators();
    //     this.prescriptionForm.patchValue({
    //       'intake': 'After Food', 'duration_type': 'Day'
    //     });
    //   }
    //   this.prescriptionForm.get('item_name').updateValueAndValidity();
    //   this.prescriptionForm.get('dosage').updateValueAndValidity();
    //   this.prescriptionForm.get('frequency').updateValueAndValidity();
    //   this.prescriptionForm.get('intake').updateValueAndValidity();
    //   this.prescriptionForm.get('duration').updateValueAndValidity();
    //   this.prescriptionForm.get('duration_type').updateValueAndValidity();
    //   this.prescriptionForm.get('prescribe_note').updateValueAndValidity();
    // });
  }

  appointment_detail() {
    this.getAppointmentPrescriptions();
    this.appointmentService.appointments({ 'appointment_id': this.appointment_id }).subscribe(
      (response: any) => {
        if (response.status) {
          this.appointmentDetail = response.data;
          //console.log('this.appointmentDetail', this.appointmentDetail);
          this.attachments = this.appointmentDetail.attachments;
          this.channelName = this.appointmentDetail.channelName;
          this.agoraToken = this.appointmentDetail.token;
          if (this.userType == 'Doctor') {
            this.userID = this.appointmentDetail.doctor_id;
          } else {
            this.userID = this.appointmentDetail.user_id;
          }
          this.getAppointmentChats();
          // this.getAppointmentPrescriptions();
          //this.createGroup();
          //this.getHealthRecords();
        } else {
          this.router.navigate(['/appointments']);
        }
      }
    )
  }

  getHealthRecords() {
    this.addHealthRecordForm = this.formBuilder.group({
      records: new FormArray([]),
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(200)
      ]],
      doctor: [''],
      description: [''],
      file: ['', [
        Validators.required
      ]],
      record_date: ['', [
        Validators.required
      ]],
      record_type: ['', [
        Validators.required
      ]]
    });
    this.healthRecordService.get({ patient_id: this.appointmentDetail.patient_id }).subscribe(
      (response: any) => {
        if (response.status) {
          this.healthRecords = response.data;
          this.healthRecords.forEach(() => this.recordsFormArray.push(new FormControl(false)));
        }
      }
    );
  }

  createGroup() {
    const doctorGroup = {
      'user_name': this.appointmentDetail.user_name,
      'user_image': this.appointmentDetail.patient_image_url
    };
    firebase.database().ref('group/' + this.appointmentDetail.doctor_id + '/' + this.appointmentDetail.user_id + '/').set(doctorGroup);

    const userGroup = {
      'user_name': this.appointmentDetail.doctor_name,
      'user_image': this.appointmentDetail.doctor_image_url
    };
    firebase.database().ref('group/' + this.appointmentDetail.user_id + '/' + this.appointmentDetail.doctor_id + '/').set(userGroup);
  }


  getAppointmentChats() {
    this.messagesService.get({ 'user_id': this.appointmentDetail.user_id }).subscribe((response: any) => {
      //console.log(this.messages);
      this.messages = response.data;
      this.scrollToBottom();
    });
    /* firebase.database().ref('messages/' + this.appointmentDetail.doctor_id + '/' + this.appointmentDetail.user_id + '/').on('value', resp => {
      this.messages = [];
      this.messages = this.commonService.fbSnapshotToArray(resp);
      //console.log('this.messages', this.messages);
      setTimeout(() => this.scrollToBottom(), 200);
    }); */
  }

  getAppointmentPrescriptions() {
    console.log("ssss")
    this.appointmentPrescriptionsRef.orderByChild('appointment_id').equalTo(this.appointment_id).on('value', resp => {
      let prescriptions = this.commonService.fbSnapshotToArray(resp);
      this.prescriptions = {
        Medicine: [],
        Lab: [],
        Imaging: [],
        Recommend: [],
        Report: []
      };
      //console.log('prescriptions', prescriptions);
      prescriptions.map(x => {
        if (x.prescription_type == 'Medicine') this.prescriptions.Medicine.push(x);
        if (x.prescription_type == 'Lab') this.prescriptions.Lab.push(x);
        if (x.prescription_type == 'Imaging') this.prescriptions.Imaging.push(x);
        if (x.prescription_type == 'Recommend') this.prescriptions.Recommend.push(x);
        if (x.prescription_type == 'Report') this.prescriptions.Report.push(x);
      });

      this.prescriptions.Medicine.reverse();
      // this.prescriptions.Medicine.sort((ele) => ele.)
      //console.log('this.prescriptions', this.prescriptions);
    });
  }

  exportData(arg: any) {

    let data: any = [{
      'Appointment Id': this.appointmentDetail ? this.appointmentDetail.appointment_id : '',
      'Appointment Date': this.appointmentDetail ? this.appointmentDetail.appointment_date : '',
      'Note': this.appointmentDetail ? this.appointmentDetail.appointment_note : '',
      'Patient Name': this.appointmentDetail.patient_name ? this.appointmentDetail.patient_name : this.appointmentDetail.user_name,
      '': '',
    }];

    arg.forEach(element => {
      data.push({
        'Appointment id': element.appointment_id,
        'Item Name': element.item_name.replace(/(<([^>]+)>)/ig, ''),
      })
    });

    this.commonService.exportAsExcelFile(data, 'appointments');
  }

  getDrugList() {
    this.drugService.select2().subscribe(
      (response: any) => {
        if (response.status) {
          this.drugsSelect2Data = response.data;
        }
      });
  }

  onSelectPrescriptionItem(value) {
    //console.log('onSelectPrescriptionItem', value);
    this.prescriptionForm.patchValue({
      item_name: value,
    });
  }

  onSubmitPrescriptionForm() {
    //console.log('this.prescriptionForm.value', this.prescriptionForm.value);
    if (this.prescriptionForm.valid) {
      let postData = new FormData();
      postData.append("token", this.commonService.getUserData("token"));
      postData.append("appointment_id", this.appointment_id);
      postData.append("prescription_type", "Medicine");
      postData.append("item_name", this.prescriptionForm.value.item_name);
      postData.append("dosage", "0");
      postData.append("frequency", "na");
      postData.append("intake", "After Food");
      postData.append("duration", "0");
      postData.append("duration_type", "Day")
      postData.append("prescribe_note", null);
      this.prescriptionFormLoader = true;
      this.appointmentPrescriptionService.create(postData).subscribe(
        (response: any) => {
          if (response.status) {
            this.prescriptionFormLoader = false;
            this.alertService.show_alert(response.message);
            // this.getAppointmentPrescriptions();
            const fbPreparedPrescription = {
              "appointment_id": this.appointment_id,
              "prescription_id": response.data.prescription_id,
              "prescription_type": response.data.prescription_type,
              "item_name": this.prescriptionForm.value.item_name,
              "dosage": response.data.dosage,
              "frequency": response.data.frequency,
              "intake": response.data.intake,
              "duration": response.data.duration,
              "duration_type": response.data.duration_type,
              "prescribe_note": response.data.prescribe_note,
            }
            const newMessage = this.appointmentPrescriptionsRef.push();
            newMessage.set(fbPreparedPrescription).then((resp: any) => { });
            this.prescriptionForm.reset();
          }
        },
        (error) => { this.prescriptionFormLoader = false; },
        () => { this.prescriptionFormLoader = false; }
      );
    }
  }

  resetPrescriptionForm(prescription_type: string) {
    this.ngprescriptionform.resetForm();
    this.prescriptionForm.patchValue({
      prescription_type: prescription_type,
      item_name: '',
      intake: 'After Food',
      duration_type: 'Day',
    });
    this.editButton = false;
    this.prescription_id = '';
    this.index = null;
  }

  onEditPrescription(item: any, i: number) {
    this.prescription_id = item.prescription_id;
    this.index = i;
    this.fb_key = item.key;
    this.prescriptionForm.patchValue({
      prescription_type: item.prescription_type,
      item_name: item.item_name,
      intake: item.intake,
      duration_type: item.duration_type,
      prescribe_note: item.prescribe_note,
      duration: item.duration,
      frequency: item.frequency,
      dosage: item.dosage
    });
    this.editButton = true;
  }

  onSubmitPrescriptionUpdateForm() {
    if (this.prescriptionForm.valid) {
      let postData = {
        token: this.commonService.getUserData("token"),
        prescription_type: "Medicine",
        item_name: this.prescriptionForm.value.item_name,
        dosage: "0",
        frequency: "na",
        intake: "After Food",
        duration: "0",
        duration_type: "Day",
        prescribe_note: null
      };
      this.prescriptionFormLoader = true;
      this.appointmentPrescriptionService.update(this.prescription_id, postData).subscribe(
        (response: any) => {
          if (response.status) {
            delete postData["token"];
            firebase.database().ref('/appointmentPrescriptions/' + this.fb_key).update(postData);
          };
          this.prescriptionForm.reset();
          this.editButton = false;
          this.prescriptionFormLoader = false;
        },
        (error) => { this.prescriptionFormLoader = false; },
        () => { this.prescriptionFormLoader = false; }
      )
    }
  }

  onDeletePrescription(item: any) {
    Swal.fire({
      title: 'Delete',
      text: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        this.dataLoader = true;
        this.appointmentPrescriptionService.delete(item.prescription_id).subscribe(
          (response: any) => {
            if (response.status) {
              firebase.database().ref('/appointmentPrescriptions/' + item.key).remove();
            }
            this.dataLoader = false;
          },
          (error) => { this.dataLoader = false; },
          () => { this.dataLoader = false; }
        )
      }
    });
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  onSendMessage() {
    let message = this.chatForm.value.message;
    if (message.length == 0) {
      return false;
    }
    this.chatFormLoader = true;
    let postData = new FormData();
    postData.append('token', this.commonService.getUserData('token'));
    postData.append('message_type', 'Text');
    postData.append('message', message);
    postData.append('user_id', this.appointmentDetail.user_id);

    this.messagesService.create(postData).subscribe(
      (response: any) => {
        this.chatForm.patchValue({ 'message': '' });
        this.chatFormLoader = false;
        this.messages.push(response.data);
        this.scrollToBottom();
      },
      (error) => {
        this.chatFormLoader = false;
      }
    );

    /* let user_id = this.appointmentDetail.user_id;
    let user_name = this.appointmentDetail.user_name;
    let user_image = this.appointmentDetail.patient_image_url;
    if (this.userType != 'Patient') {
      user_id = this.appointmentDetail.doctor_id;
      user_name = this.appointmentDetail.doctor_name;
      user_image = this.appointmentDetail.doctor_image_url;
    }
    const chat_msg = {
      '_id' : Math.round(Math.random() * 1000000),
      'createdAt' : new Date().toISOString(),
      'doctor_id': this.appointmentDetail.doctor_id,
      'patient_id': this.appointmentDetail.user_id,
      'text': message,
      'user' : {
        '_id': user_id,
        'avatar': user_image,
        'name': user_name
      }
    };
    const msg = firebase.database().ref('messages/' + this.appointmentDetail.doctor_id + '/' + this.appointmentDetail.user_id + '/').push();
    msg.set(chat_msg).then((resp: any) => {
      this.scrollToBottom();
      this.chatForm.patchValue({ 'message': '' });
      this.chatFormLoader = false;
    }); */
  }

  fullscreenOnOff(onOff: boolean) {
    this.fullscreen = onOff;
    if (this.fullscreen) {
      jQuery('.navbar').addClass("hide");
    } else {
      jQuery('.navbar').removeClass("hide");
    }
  }

  startVideoCall() {
    Swal.fire({
      text: 'Send notification to client?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.notificationService.sendCallNotification({ appointment_id: this.appointment_id }).subscribe();
      }
      //console.log('this.client', this.client);
      if (this.client != undefined) {
        return false;
      }
      this.client = this.ngxAgoraService.createClient({ mode: 'rtc', codec: 'h264' });
      //console.log('this.client', this.client);
      this.assignClientHandlers();

      this.localStream = this.ngxAgoraService.createStream({ streamID: this.uid, audio: true, video: true, screen: false });
      this.assignLocalStreamHandlers();
      this.initLocalStream(() => this.join(uid => this.publish(), error => console.error(error)));
    });
  }

  private assignLocalStreamHandlers(): void {
    this.localStream.on(StreamEvent.MediaAccessAllowed, () => {
      //console.log('accessAllowed');
    });

    // The user has denied access to the camera and mic.
    this.localStream.on(StreamEvent.MediaAccessDenied, () => {
      //console.log('accessDenied');
    });
  }

  private initLocalStream(onSuccess?: () => any): void {
    this.localStream.init(
      () => {
        // The user has granted access to the camera and mic.
        this.localStream.play(this.localCallId);
        if (onSuccess) {
          onSuccess();
        }
      },
      err => console.error('getUserMedia failed', err)
    );
  }

  private assignClientHandlers(): void {
    this.client.on(ClientEvent.LocalStreamPublished, evt => {
      //console.log('Publish local stream successfully');
    });

    this.client.on(ClientEvent.Error, error => {
      //console.log('Got error msg:', error.reason);
      if (error.reason === 'DYNAMIC_KEY_TIMEOUT') {
        this.client.renewChannelKey(
          '',
          () => {
            //console.log('Renewed the channel key successfully.')
          },
          renewError => console.error('Renew channel key failed: ', renewError)
        );
      }
    });

    this.client.on(ClientEvent.RemoteStreamAdded, evt => {
      const stream = evt.stream as Stream;
      this.client.subscribe(stream, { audio: true, video: true }, err => {
        //console.log('Subscribe stream failed', err);
      });
    });

    this.client.on(ClientEvent.RemoteStreamSubscribed, evt => {
      const stream = evt.stream as Stream;
      const id = this.getRemoteId(stream);
      if (!this.remoteCalls.length) {
        this.remoteCalls.push(id);
        //console.log('this.remoteCalls', this.remoteCalls);
        setTimeout(() => stream.play(id), 1000);
      }
    });

    this.client.on(ClientEvent.RemoteStreamRemoved, evt => {
      const stream = evt.stream as Stream;
      if (stream) {
        stream.stop();
        this.remoteCalls = [];
        //console.log(`Remote stream is removed ${stream.getId()}`);
      }
    });

    this.client.on(ClientEvent.PeerLeave, evt => {
      const stream = evt.stream as Stream;
      if (stream) {
        stream.stop();
        this.remoteCalls = this.remoteCalls.filter(call => call !== `${this.getRemoteId(stream)}`);
        //console.log(`${evt.uid} left from this channel`);
      }
    });
  }

  private getRemoteId(stream: Stream): string {
    return `agora_remote-${stream.getId()}`;
  }

  /**
   * Attempts to connect to an online chat room where users can host and receive A/V streams.
   */
  join(onSuccess?: (uid: number | string) => void, onFailure?: (error: Error) => void): void {
    //console.log('join');
    this.client.join(this.agoraToken, this.channelName, this.uid, onSuccess, onFailure);
  }

  /**
   * Attempts to upload the created local A/V stream to a joined chat room.
   */
  publish(): void {
    //console.log('publish');
    this.client.publish(this.localStream, err => {
      //console.log('Publish local stream error: ' + err);
    }
    );
  }

  unpublish(): void {
    //console.log('unpublish');
    this.client.unpublish(this.localStream, err => {
      //console.log('Unpublish local stream error: ' + err);
    }
    );
  }

  leaveVideoCall() {
    this.ngxAgoraService.client.leave(() => {
      //console.log(this.localStream.isPlaying());
      if (this.localStream.isPlaying()) {
        this.localStream.stop();
      };
      this.localStream.close();
      this.localStream = null;
      this.remoteCalls = [];
      this.client = null;
      //console.log("Leavel channel successfully");
    }, (err) => {
      //console.log("Leave channel failed");
    });
  }

  openShareHealthRecordModal() {
    this.shareHealthRecordAction = '';
    this.addHealthRecordForm.reset();
    this.modalService.open_modal('#shareHealthRecordModal');
  }

  onChooseShareHealthRecordAction(action: string) {
    this.shareHealthRecordAction = action;
    if (action == 'new') {
      this.record_type = '';
      this.addHealthRecordFileInput = null;
      this.addHealthRecordFormLoader = false
      this.removeHealthRecordFile();
      this.addHealthRecordForm.reset();
      this.ngaddhealthrecordform.resetForm();
    }
  }

  onSubmitShareHealthRecordForm() {
    const selectedHealthRecords = this.addHealthRecordForm.value.records
      .map((checked, i) => checked ? this.healthRecords[i] : null)
      .filter(v => v !== null);

    if (!selectedHealthRecords.length) {
      this.alertService.showValidationErrors('Select alteast one record to share');
      return false;
    }

    for (let i = 0; i < selectedHealthRecords.length; i++) {
      this.chatFormLoader = true;
      let user_id = this.appointmentDetail.user_id;
      let user_name = this.appointmentDetail.user_name;
      let user_image = this.appointmentDetail.patient_image_url;
      if (this.userType != 'Patient') {
        user_id = this.appointmentDetail.doctor_id;
        user_name = this.appointmentDetail.doctor_name;
        user_image = this.appointmentDetail.doctor_image_url;
      }
      const chat_msg = {
        '_id': Math.round(Math.random() * 1000000),
        'createdAt': new Date().toISOString(),
        'doctor_id': this.appointmentDetail.doctor_id,
        'patient_id': this.appointmentDetail.user_id,
        'text': selectedHealthRecords[i].name,
        'image_url': selectedHealthRecords[i].file_url,
        'user': {
          '_id': user_id,
          'avatar': user_image,
          'name': user_name
        }
      };
      const msg = firebase.database().ref('messages/' + this.appointmentDetail.doctor_id + '/' + this.appointmentDetail.user_id + '/').push();
      msg.set(chat_msg).then((resp: any) => {
        this.scrollToBottom();
        this.chatFormLoader = false;
      });
    }

    this.modalService.close_modal('#shareHealthRecordModal');
    this.alertService.show_alert('Records shared successfully');
  }

  onSubmitAddHealthRecordForm() {
    if (this.addHealthRecordForm.valid) {
      this.addHealthRecordFormLoader = true;
      let postData = new FormData();

      postData.append("token", this.commonService.getUserData("token"));
      postData.append("name", this.addHealthRecordForm.value.name);
      postData.append("record_for", this.appointmentDetail.appointment_for);
      postData.append("patient_id", this.appointmentDetail.patient_id);
      postData.append("doctor", this.addHealthRecordForm.value.doctor);
      postData.append("file", this.addHealthRecordFileInput);
      postData.append("record_date", this.addHealthRecordForm.value.record_date.format('YYYY-MM-DD'));
      postData.append("record_type", this.addHealthRecordForm.value.record_type);
      postData.append("description", this.addHealthRecordForm.value.description);

      this.healthRecordService.post(postData).subscribe(
        (response: any) => {
          if (response.status) {
            this.getHealthRecords();
            this.shareHealthRecordAction = '';
          }
          this.addHealthRecordFormLoader = false;
        },
        (error) => { this.addHealthRecordFormLoader = false; },
      );
    }
  }

  onChangeHealthRecordFile(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      let file = fileInput.target.files[0];

      const allowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      if (!allowedFileTypes.includes(file.type)) {
        this.alertService.showValidationErrors('Only JPG, PNG and PDF files are allowed');
        return false;
      }

      const allowedMaxSize = 5 * 1024 * 1024;
      if (file.size > allowedMaxSize) {
        this.alertService.showValidationErrors("Maximum 5MB file allowed");
        return false;
      }

      this.addHealthRecordForm.patchValue({ file: "yes" })
      this.addHealthRecordFileInput = file;
      this.ngaddhealthrecordfileinput.nativeElement.value = '';
    }
  }

  removeHealthRecordFile() {
    this.addHealthRecordFileInput = null;
    this.addHealthRecordForm.patchValue({ file: "" });
    this.ngaddhealthrecordfileinput.nativeElement.value = '';
  }

  onChangeHealthRecordType(record_type: string) {
    this.addHealthRecordForm.patchValue({ record_type: record_type });
    this.record_type = record_type;
  }

}
