import { Component, AfterViewInit, ViewChild, OnInit } from '@angular/core';

import { NavController } from 'ionic-angular';

import { WebRTCService } from '../../services/webrtc.service';
import { LoginService } from '../../services/login.service';

import { Room, MockRoom } from '../../model/room';

import { WebRTCChatRoomPage } from '../WebRTCChatRoomPage/WebRTCChatRoomPage';

@Component({
  selector: 'page-webrtc',
  templateUrl: 'WebRTCPage.html',
  // providers: [WebRTCService, LoginService]
})

export class WebRTCPage implements OnInit{
  @ViewChild('local') local;
  public localStream;
  public rooms: Array<Room>;
  public front: boolean;
  constructor(public navCtrl: NavController, public rtcService: WebRTCService, public loginService: LoginService) {}

  ngOnInit() {
    // this.rtcService.getLocalMediaStream();
    this.rtcService.getLocalMediaStream().then((localStream) => {
      this.localStream = localStream;
    }).catch(error => {console.log('error sent to webrtc page: ', error)})
    this.rooms = MockRoom;
  }

  clickRoom(room) {
    let targetRoom = MockRoom.find(rm => rm.name === room.name);
    console.log('find room: ', targetRoom);
    console.log('누가 로그인되어 있나? ', this.loginService.logInUser);
    targetRoom.users.push(this.loginService.logInUser);
    this.navCtrl.push(WebRTCChatRoomPage, {room: room});
  }

  changeLocalStream() {
    this.localStream.getTracks().forEach(track => track.stop());
    this.localStream = null;
    this.front = !this.front;
    console.log('front changed: ', this.front);
    let constraints = { video: { facingMode: (this.front? "user" : "environment") }, audio: false };
    this.rtcService.changeLocalStream(constraints).then(stream => {
      console.log('changed stream received: ', stream);
      this.localStream = stream;
    }).catch(error => console.log('change error: ', error))
  }

  // ngAfterViewInit() {
  //   let video = this.local.nativeElement;
  //   console.log('in webrtc page ngAfterViewInit');
  //   (<any>navigator).webkitGetUserMedia({video: true, audio: true}, (stream) => {
  //     console.log('video: ', video);
  //     video.srcObject = stream;
  //     console.log('video srcObject: ', video.srcObject);
  //   }, error => {console.log('error: ', error)})
  // }

  // ngAfterViewInit() {
  //   (<any>navigator).webkitGetUserMedia({video: true, audio: true}, stream => {
  //     this.localStream = stream;
  //     console.log('localStream: ', this.localStream);
  //   }, error => {console.log('error: ', error)})
  // }

}
