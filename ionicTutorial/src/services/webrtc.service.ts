import { Injectable } from '@angular/core';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import {LoginService} from "./login.service";

@Injectable()
export class WebRTCService{
  private signalingServerUrl = 'http://10.0.1.6:4000';
  private socket;
  public localStream: any;
  public hasAddTrack = false;
  public answering = null;
  public negotiationNum = 0;
  public peerConnections = [];
  public messages = [];
  public sendButtonDisabled = true;
  public messageDisabled = true;
  private mediaConstraints: any = {video: true, audio:false};

  constructor(public diagnostic: Diagnostic, public loginService: LoginService){}

  initialize() {
    this.socket = null;
    this.answering = null;
    this.negotiationNum = 0;
    this.peerConnections = [];
    this.messages = [];
    this.sendButtonDisabled = true;
    this.messageDisabled = true;
    this.mediaConstraints = {video: true, audio: false};
  }

  disconnectFromSignalingServer() {
    console.log('disconnect socket: ', this.peerConnections);
    this.socket.disconnect();
    for(let i = 0 ; i < this.peerConnections.length ; i++) {
      if(this.peerConnections[i]) {
        if(this.peerConnections[i].remoteStream) {
          this.peerConnections[i].remoteStream.getTracks().forEach(track => track.stop());
        }
        console.log('connection with ' + this.peerConnections[i].target + ' is closing');
        this.closeVideoCall(this.peerConnections[i].target);
      }
    }
    this.initialize();
  }

  changeLocalStream(mediaConstraints) {
    this.mediaConstraints = mediaConstraints;
    console.log('change in constraint: ', this.mediaConstraints);
    for(let i = 0 ; i < this.peerConnections.length ; i++) {
      if(this.peerConnections[i]) {
        if(this.hasAddTrack) {
          console.log('fuckfuckfuck');
        } else {
          console.log('remove stream');
          this.peerConnections[i].myPeerConnection.removeStream(this.localStream);
        }
      } else {
        console.log('dasad');
      }
    }
    this.localStream = null;
    return new Promise((resolve,reject) => {
      this.getLocalMediaStream().then(stream => {
        console.log('stream changed: ', stream);
        for(let i = 0 ; i < this.peerConnections.length ; i++) {
          if(this.peerConnections[i]) {
            console.log('add new stream');
            this.peerConnections[i].myPeerConnection.addStream(stream);
          } else {
            console.log('nononono');
          }
        }
        resolve(stream);
      }).catch(error => {reject(error)})
    })
  }

  connectToSignalingServer(room) {
    console.log('in connect to signal server: ', this.loginService.logInUser);
    if(this.loginService.logInUser) {
      this.socket = io(this.signalingServerUrl);
      this.socket.emit('new_user', this.loginService.logInUser, room);
      console.log('socket: ', this.socket);
      console.log('join 확인');
      this.socket.on('joined', (user, username, clients) => {
        if(this.socket.id === user) {
          console.log('New user joined: ', user, username);
          this.startWebRTC(clients);
        }
      });

      this.socket.on('signaling', msg => {
        console.log('Message received from ' + msg.name + ': ' + msg.type);
        switch(msg.type) {
          case "video-offer":
            this.handleVideoOfferMsg(msg);
            break;
          case "video-answer":
            this.handleVideoAnswerMsg(msg);
            break;
          case "new-ice-candidate":
            this.handleNewICECandidateMsg(msg);
            break;
          default:
            console.log('undefined type of message received: ', msg.type);
        }
      });

      this.socket.on('disconnect', user => {
        console.log(user + ' leave the room');
        this.closeVideoCall(user);
      });

    } else {
      console.log('로그인이 되어 있지 않습니다');
    }
  }

  createPeerConnection(user) {
    console.log('In createPeerConnection, Setting up a connection betweeen ' + this.loginService.logInUser + ' and ' + user);
    let adaptedRTCPeerConnection = webkitRTCPeerConnection ? webkitRTCPeerConnection : RTCPeerConnection;
    let myPeerConnection = new adaptedRTCPeerConnection(
      {
      iceServers: [
        {
          urls: "turn:10.0.1.6",
          username: "webrtc",
          credential: "turnserver"
        }
      ]
      });

    this.hasAddTrack = ((<any>myPeerConnection).addTrack !== undefined);
    if(this.hasAddTrack) {
      (<any>myPeerConnection).ontrack = (event) => this.handleTrackEvent(event, user);
    } else {
      myPeerConnection.onaddstream = (event) => this.handleAddStreamEvent(event, user);
    }

    myPeerConnection.onicecandidate = (event) => this.handleICECandidateEvent(event, user);
    myPeerConnection.onremovestream = () => this.handleRemoveStreamEvent(user);
    myPeerConnection.oniceconnectionstatechange = () => this.handleICEConnectionStateChangeEvent(user);
    myPeerConnection.onsignalingstatechange = () => this.handleSignalingStateChangeEvent(user);
    myPeerConnection.onnegotiationneeded = () => this.handleNegotiationNeededEvent(user);
    let dataChannel = (<any>myPeerConnection).createDataChannel("dataChannel");
    console.log('dataChannel originated from ' + this.loginService.logInUser + ' created', dataChannel);
    dataChannel.onopen = () => this.handleSendChannelStatusChange(user);
    dataChannel.onclose = () => this.handleSendChannelStatusChange(user);
    (<any>myPeerConnection).ondatachannel = (event) => this.receiveChannelCallback(event, user);
    let receiveChannel = null;
    this.peerConnections.push({
      target: user,
      myPeerConnection,
      dataChannel,
      receiveChannel,
      checked: false,
      remoteStream: null,
    });
  }

  findConnectionWithUsername(username) {
    return this.peerConnections.find(connection => connection.target === username);
  }

  handleNegotiationNeededEvent(user) {
    console.log('in negotiation needed event');
    console.log('answering: ', this.answering);
    this.negotiationNum++;
    console.log('negotiationNum: ', this.negotiationNum);
    let myPeerConnection = this.findConnectionWithUsername(user).myPeerConnection;
    if(!this.answering && this.negotiationNum !== 2) {
      console.log('negotiation needed');
      myPeerConnection.createOffer().then(offer => {
        console.log('Creating Offer');
        return myPeerConnection.setLocalDescription(offer);
      }).then(() => {
          console.log('Sending offer to remote peer');
          this.sendToServer({
          name: this.loginService.logInUser,
          target: user,
          type: "video-offer",
          sdp: myPeerConnection.localDescription
          })
        }).catch(error => {console.log('error in handleNegotiationNeededEvent: ', error)})
    }
  }

  handleTrackEvent(event, user) {
    console.log('Track event');
    let myPeerConnection = this.findConnectionWithUsername(user);
    myPeerConnection.remoteStream = event.streams[0];
  }

  handleAddStreamEvent(event, user) {
    console.log('Stream Event');
    let myPeerConnection = this.findConnectionWithUsername(user);
    myPeerConnection.remoteStream = event.stream;
  }

  handleRemoveStreamEvent(user) {
    console.log('Stream removed');
    this.closeVideoCall(user);
  }

  handleICECandidateEvent(event, user) {
    if(event.candidate) {
      console.log('Outgoing ICE candidate from ' + this.loginService.logInUser + ' to others');

      this.sendToServer({
        name: this.loginService.logInUser,
        target: user,
        type: "new-ice-candidate",
        candidate: event.candidate
      });
    }
  }

  handleICEConnectionStateChangeEvent(user) {
    console.log('in ice connection state change');
    let targetConnection = this.findConnectionWithUsername(user);
    console.log('in ice connection change: ', targetConnection);
    console.log(targetConnection.target + ' ICE Connection state changed to ', targetConnection.myPeerConnection.iceConnectionState);

    switch(targetConnection.myPeerConnection.iceConnectionState) {
      case "closed":
      case "failed":
      case "disconnected":
        this.closeVideoCall(user);
        break;
    }
  }

  handleSignalingStateChangeEvent(user) {
    console.log('in signaling state change');
    let targetConnection = this.findConnectionWithUsername(user);
    console.log('퍼킹: ', targetConnection);
    console.log(targetConnection.target + ' WebRTC signaling state changed to: ', targetConnection.myPeerConnection.signalingState);
    switch(targetConnection.myPeerConnection.signalingState) {
      case "closed":
        this.closeVideoCall(user);
        break;
    }
  }

  closeVideoCall(user) {
    console.log('Closing the call');
    let targetConnection = this.findConnectionWithUsername(user);
    if(targetConnection) {
      let myPeerConnection = targetConnection.myPeerConnection;
      if(myPeerConnection) {
        console.log('Closing the peer connection');
        myPeerConnection.onaddstream = null;
        myPeerConnection.ontrack = null;
        myPeerConnection.onremovestream = null;
        myPeerConnection.onicecandidate = null;
        myPeerConnection.oniceconnectionstatechange = null;
        myPeerConnection.onsignalingstatechange = null;
        myPeerConnection.onnegotiationneeded = null;
        myPeerConnection.close();
      }

      targetConnection.dataChannel.close();
      targetConnection.receiveChannel.close();
      myPeerConnection = null;
      targetConnection.dataChannel = null;
      targetConnection.receiveChannel = null;
      for(let i = 0 ; i < this.peerConnections.length ; i++) {
        if(this.peerConnections[i].target === user) {
          console.log('before removal: ', this.peerConnections);
          this.peerConnections.splice(i, 1);
          console.log('after removal: ', this.peerConnections);
          break;
        }
      }
    } else {
      console.log('peerconnection with ' + user + ' already deleted');
    }
  }

  handleVideoOfferMsg(msg) {
    this.createPeerConnection(msg.name);
    let desc = new RTCSessionDescription(msg.sdp);
    this.answering = true;
    let myPeerConnection = this.findConnectionWithUsername(msg.name).myPeerConnection;
    myPeerConnection.setRemoteDescription(desc).then(() => {
      console.log('Setting up the local media stream...');
      return this.getLocalMediaStream();
    })
      .then(localStream => {
        console.log('Local video stream obtained');
        console.log('제대로 받았니?: ', localStream);
        if(this.hasAddTrack) {
          console.log('Adding tracks to the RTCPeerConnection');
          localStream.getTracks().forEach(track => myPeerConnection.addTrack(track, localStream));
        } else {
          console.log('Adding stream to the RTCPeerConnection');
          myPeerConnection.addStream(localStream);
        }
      })
      .then(() => {
        console.log('Creating answer...');
        return myPeerConnection.createAnswer();
      })
      .then(answer => {
        console.log('Setting local description after creating answer');
        return myPeerConnection.setLocalDescription(answer);
      })
      .then(() => {
        let message = {
          name: this.loginService.logInUser,
          target: msg.name,
          type: "video-answer",
          sdp: myPeerConnection.localDescription
        };
        console.log('Sending answer packet back to other peer');
        this.sendToServer(message);
      })
      .catch(error => {console.log('error in handleVideoOfferMsg: ', error)})
  }

  handleVideoAnswerMsg(msg) {
    console.log('Call recipient ' + msg.name + ' has accepted our call');
    let desc = new RTCSessionDescription(msg.sdp);
    let targetConnection = this.findConnectionWithUsername(msg.name);
    targetConnection.myPeerConnection.setRemoteDescription(desc).catch(error => {console.log('error in handleVideoAnswerMsg: ', error)});
    console.log('User ' + this.loginService.logInUser + ' and User ' + msg.name + ' are exchanging answer and offer');
  }

  handleNewICECandidateMsg(msg) {
    let candidate = new RTCIceCandidate(msg.candidate);
    console.log('Adding received ICE candidate from ' + msg.name);
    let targetConnection = this.findConnectionWithUsername(msg.name);
    console.log('find target connection: ', targetConnection);
    targetConnection.myPeerConnection.addIceCandidate(candidate).catch(error => {console.log('error in handleNewICECandidate: ', error)});
  }

  startWebRTC(clients) {
    console.log('in startWebRTC: ', clients);
    for(let i = 0 ; i < clients.length ; i++) {
      console.log('user id: ', clients[i].id);
      if(clients[i].id !== this.loginService.logInUser) {
        this.createPeerConnection(clients[i].id);
      }
    }
    this.getLocalMediaStream().then(localStream => {
      console.log('Local Video stream obtained');
      if(this.hasAddTrack) {
        console.log('Adding tracks to the RTCPeerConnection');
        (<any>localStream).getTracks().forEach(track => {
          this.peerConnections.forEach(connection => connection.myPeerConnection.addTrack(track, localStream))
        });
      } else {
        console.log('Adding stream to the RTCPeerConnection');
        this.peerConnections.forEach(connection => connection.myPeerConnection.addStream(localStream))
      }
    }).catch(error => {console.log('in startWebRTC error: ', error)})
  }

  getLocalMediaStream() {
    if (this.localStream) {
      console.log('this.localStream already exist');
      return new Promise(resolve => resolve(this.localStream));
    }
    return new Promise((resolve, reject) => {
      this.diagnostic.requestCameraAuthorization().then(status => {
        console.log('camera status: ', status);
        return this.diagnostic.requestMicrophoneAuthorization()
      })
        .then(status => {
          console.log('audio status: ', status);
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.log('navigator.mediaDevices.getUserMedia not exist');
            (<any>navigator).webkitGetUserMedia(this.mediaConstraints,
              localStream => {
                console.log('Local media stream set in getLocalMediaStream');
                this.localStream = localStream;
                resolve(localStream);
              },
              error => {
                reject(error);
                console.log('error1: ', error)
              })
          } else {
            console.log('navigator.mediaDevices.getUserMedia exist');
            navigator.mediaDevices.getUserMedia(this.mediaConstraints).then(localStream => {
              console.log('Local media stream set in getLocalMediaStream');
              this.localStream = localStream;
              resolve(localStream);
            }).catch(error => {console.log('error2: ', error); reject(error)})
          }
        })
        .catch(error => {console.log('error4: ', error); reject(error)})
    })
  }

  sendDataChannelMessage(msg) {
    this.peerConnections.forEach(targetConnection => {
      targetConnection.dataChannel.send(msg);
    });
    console.log('The message is sent from ' + this.loginService.logInUser + ' to all others');
  }

  handleSendChannelStatusChange(user) {
    console.log('in handleSendChannelStatusChange');
    let targetConnection = this.findConnectionWithUsername(user);
    if(targetConnection && targetConnection.dataChannel) {
      let state = targetConnection.dataChannel.readyState;
      console.log('dataChannel of ' + user + ' state: ' + state);
      if(state === 'open') {
        console.log(user + ' data channel is open');
        targetConnection.checked = true;
      } else {
        console.log(user + ' data channel is closed');
        targetConnection.checked = false;
      }
      let ok = true;
      for(let i = 0 ; i < this.peerConnections.length ; i++) {
        console.log('peerConnections: ', this.peerConnections[i]);
        if(!this.peerConnections[i]) {
          console.log(i + ' th peerConnection is deleted but remain as null');
        } else if(!this.peerConnections[i].checked) {
          console.log('Connection with ' + this.peerConnections[i].target + ' is not checked');
          ok = false;
          break;
        }
      }
      if(ok) {
        console.log('빌어먹을 앵귤러');
        this.sendButtonDisabled = false;
        this.messageDisabled = false
      } else {
        this.sendButtonDisabled = true;
        this.messageDisabled = true;
      }
    } else {
      console.log('datachannel connection closed');
      let notNullNumber = 0;
      for(let i = 0 ; i < this.peerConnections.length ; i++) {
        if(this.peerConnections[i]) {
          notNullNumber++;
        }
      }
      if(notNullNumber === 0) {
        this.sendButtonDisabled = true;
        this.messageDisabled = true;
      }
    }
  }

  receiveChannelCallback(event, user) {
    console.log('data channel received from ' + user);
    let targetConnection = this.findConnectionWithUsername(user);
    targetConnection.receiveChannel = event.channel;
    targetConnection.receiveChannel.onmessage = (event) => this.handleReceiveMessage(event, user);
    targetConnection.receiveChannel.onopen = () => this.handleReceiveChannelStatusChange(user);
    targetConnection.receiveChannel.onclose = () => this.handleReceiveChannelStatusChange(user);
  }

  handleReceiveMessage(event, user) {
    this.messages.push({from: user, data: event.data});
  }

  handleReceiveChannelStatusChange(user) {
    let targetConnection = this.findConnectionWithUsername(user);
    if(targetConnection && targetConnection.receiveChannel) {
      console.log('Receive channel status from ' + user + ' has changed to ' + targetConnection.receiveChannel.readyState);
      console.log('fucking: ', this.peerConnections);
    } else {
      console.log('receive channel from ' + user + ' closed');
      console.log('fucking: ', this.peerConnections);
    }
  }


  sendToServer(msg) {
    console.log('sendToServer: ', msg.type);
    this.socket.emit('signaling', msg);
  }





}
