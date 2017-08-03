import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Room, MockRoom } from '../../model/room';

import { WebRTCService } from '../../services/webrtc.service';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'page-webrtc-chat-room',
  templateUrl: 'WebRTCChatRoomPage.html',
  // providers: [WebRTCService, LoginService]
})

export class WebRTCChatRoomPage implements OnInit, OnDestroy{
  public selectedRoom: Room;
  public localStream;
  public messageValue = '';
  constructor(public navCtrl: NavController, public navParams: NavParams, public rtcService: WebRTCService, public loginService: LoginService){
    console.log('in constructor');
    this.selectedRoom = navParams.get('room');
    console.log('selectedRoom: ', this.selectedRoom.name);
  }

  ngOnInit() {
    console.log('in ngOnInit');
    this.rtcService.getLocalMediaStream().then(localStream => {
      this.localStream = localStream;
      console.log('localstream set in webrtc chat room page: ', this.localStream);
    }).catch(error => {console.log('error in webrtc chat page: ', error)});
    this.rtcService.connectToSignalingServer(this.selectedRoom.name);
  }

  sendMessage(value) {
    console.log('sending message: ', value);
    if(this.messageValue && this.messageValue.trim() !== '') {
      this.rtcService.sendDataChannelMessage(value);
    }
    this.messageValue = ''
  }

  ngOnDestroy() {
    console.log('in ngOnDestroy');
    this.rtcService.disconnectFromSignalingServer();
    console.log('user: ', this.loginService.logInUser);
    for(let i = 0 ; i < this.selectedRoom.users.length ; i++) {
      if(this.selectedRoom.users[i] === this.loginService.logInUser) {
        console.log('leave the room');
        this.selectedRoom.users.splice(i, 1);
        break;
      }
    }
  }
}
