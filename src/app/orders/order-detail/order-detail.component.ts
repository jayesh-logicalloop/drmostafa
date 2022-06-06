import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrdersService } from '../../services/orders.service';
import { CommonService } from '../../services/common.service';
import { MessagesService } from 'src/app/services/messages.service';
import { AlertService } from '../../services/alert.service';
import { TranslateService } from '@ngx-translate/core';

import * as RecordRTC from 'recordrtc';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class OrderDetailComponent implements OnInit {
  orderDetail:any;
  order_id=''
  loader=false;
  dataReady=false;
  addForm:FormGroup;
  addFormAction = false;
  statusData=[];

  chatForm: FormGroup;
  chatFormLoader = false;

  constructor(
	  private translate: TranslateService,
    private title: Title,
    private activatedRoute: ActivatedRoute,
	  private router: Router,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private messagesService: MessagesService,
    private ordersService: OrdersService,
    private alertService: AlertService,
    private domSanitizer: DomSanitizer
  ) {
	  const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Order Detail');

    this.chatForm = this.formBuilder.group({
      'message': ['']
    });
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
    this.activatedRoute.params.subscribe(
      routeParams => {
        this.order_id = routeParams.order_id;
        if(this.order_id) {
          this.getOrderDetail(this.order_id);
        } else {
          this.router.navigate(['/orders']);
        }
      }
    );
    this.addForm = this.formBuilder.group({
      order_status : ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      notify_customer : ['',[]],
      comment:['',[
        Validators.required,
        Validators.maxLength(1000)
      ]]
    });

  }

  getOrderDetail(order_id:string){
	  this.loader = true;
    this.ordersService.orders_get({"order_id":order_id}).subscribe(
		  (response:any) => {
        if(response.status){
          this.orderDetail = response.data;
          this.dataReady = true;
          this.getOrderStatusList();
        }
        this.loader = false;
      },
      (error)=>{ this.loader = false; }
    );
  }

  download_invoice(order_id:string) {
	  this.loader = true;
    this.ordersService.download_invoice({"order_id":order_id}).subscribe(
      (response:any) => {
        if(response.status) {
          const linkSource = 'data:application/pdf;base64,' + response.data;
          const downloadLink = document.createElement("a");
          const fileName = "order-"+order_id+".pdf";
          downloadLink.href = linkSource;
          downloadLink.download = fileName;
          downloadLink.click();
        }
        this.loader = false;
      },
      (error)=>{ this.loader = false; }
    );
  }

  onSubmitAddForm(){
    if(this.addForm.valid){
      this.addFormAction = true;
	    let notify_customer = 'No';
      if(this.addForm.value.notify_customer){ notify_customer = "Yes"; }
      let putData = {
        "token" : this.commonService.getUserData('token'),
        "order_id" : this.orderDetail.order_id,
		    "order_for":this.orderDetail.order_for,
        "status_code" : this.addForm.value.order_status,
        "message": this.addForm.value.comment,
        "notify_customer": notify_customer
      }
      this.ordersService.updateOrder(putData).subscribe(
        (response:any)=>{
          if(response.status){
            this.alertService.show_alert(response.message);
            this.addForm.patchValue({
			        order_status: "",
              comment: "",
              notify_customer: false,
            });
            this.getOrderDetail(this.orderDetail.order_id);
            this.addFormAction =false;
          }
          this.addFormAction =false;
        },
        (error)=>{ this.addFormAction =false; },
      )
    }
  }

  getOrderStatusList(){
    this.addFormAction =true;
    this.ordersService.getOrderStatusList({'status_for':this.orderDetail.order_for}).subscribe(
      (response:any)=>{
        if(response.status){
          this.addFormAction =false;
          this.statusData = response.data;
        }
        this.addFormAction =false;
      },
      (error)=>{ this.addFormAction =false; }
    )
  }

  //Lets declare Record OBJ
  record;
  //Will use this flag for toggeling recording
  recording = false;
  //URL of Blob
  url;
  blob;
  error;
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
    postData.append('user_id', this.orderDetail.user_id);
    postData.append('order_id', this.orderDetail.order_id);

    this.messagesService.create(postData).subscribe(
      (response:any) => {
        this.chatFormLoader = false;
        this.orderDetail.messages.push(response.data);
        this.resetRecording();
      },
      (error) => {
        this.chatFormLoader = false;
      }
    );
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
    postData.append('user_id', this.orderDetail.user_id);
    postData.append('order_id', this.orderDetail.order_id);

    this.messagesService.create(postData).subscribe(
      (response:any) => {
        this.chatForm.patchValue({ 'message': '' });
        this.orderDetail.messages.push(response.data);
        this.chatFormLoader = false;
      },
      (error) => {
        this.chatFormLoader = false;
      }
    );
  }
}
