import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { BehaviorSubject } from 'rxjs'

@Injectable()
export class MessagingService {
  currentMessage = new BehaviorSubject(null);
  constructor(
    private angularFireMessaging:AngularFireMessaging
  ){
    this.angularFireMessaging.messages.subscribe(
      (_messaging:any) => {
        _messaging.onMessage = _messaging.onMessage.bind(_messaging);
        _messaging.onTokenRefresh = _messaging.onTokenRefresh.bind(_messaging);
      }
    )
  }
  requestPermission() {
    this.angularFireMessaging.requestToken.subscribe(
      (token) => {
        return true
      },
      (err) => {
        console.error('Notification permission is not granted by user.');
      }
    );
  }

  receiveMessage() {
    this.angularFireMessaging.messages.subscribe(
      (payload) => {
        this.currentMessage.next(payload);
      });
  }
}
