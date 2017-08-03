let myHostname = window.location.hostname;
console.log('Hostname: ' + myHostname);

let mediaConstraints = {
  audio: true,
  video: true
};
let connection;


let peerConnections = [];

let hasAddTrack = false;
let received_video = document.querySelector('#received_video');
let local_video = document.querySelector('#local_video');
let sendButton = document.querySelector('#sendMessage');
sendButton.addEventListener('click', sendDataChannelMessage, false);
sendButton.disabled = true;
let message = document.querySelector('#message');
message.disabled = true;
let receiveBox = document.querySelector('#receiveBox');
let answering = null;
let channelCreated;
let allElements = document.getElementsByTagName('*');
// for(let i = 0 ; i < allElements.length ; i++) {
//   allElements[i].hidden = true;
// }
let username = prompt('Type your username');
if(!username || username.trim() === '') {
  alert('Type username correctly. Reload the page');
} else {
  connection = io();
  connection.emit('new_user', username);
}

connection.on('duplicated', function() {
  alert('Username is duplicated. Reload the page');
})

connection.on('joined', function(user, username, clients) {
  if(user === connection.id){
    console.log('New user joined: ', user , username);
    for(let i = 0 ; i < allElements.length ; i++) {
      allElements.hidden = false;
    }
    let usernameNode = document.querySelector('#username');
    let label = document.createTextNode(username);
    usernameNode.append(label);
    start(clients);
  }
});

connection.on('signaling', function(msg) {
  console.log('Message received from ' + msg.name + ': ' + msg.type);
  switch(msg.type) {
    case "video-offer":
      handleVideoOfferMsg(msg);
      break;

    case "video-answer":
      handleVideoAnswerMsg(msg);
      break;

    case "new-ice-candidate":
      handleNewICECandidateMsg(msg);
      break;

    default:
      console.log('undefined type of message received: ', msg.type);
  }
});

function createPeerConnection(user) {
  console.log('In createPeerConnection, Setting up a connection between ' + username + ' and ' + user);
  let myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: "turn:" + myHostname,
        username: "webrtc",
        credential: "turnserver"
      }
    ]
  });

  hasAddTrack = (myPeerConnection.addTrack !== undefined);

  if(hasAddTrack) {
    myPeerConnection.ontrack = (event) => handleTrackEvent(event, user);
  } else {
    myPeerConnection.onaddstream = (event) => handleAddStreamEvent(event, user);
  }

  myPeerConnection.onicecandidate = (event) => handleICECandidateEvent(event, user);
  myPeerConnection.onremovestream = () => handleRemoveStreamEvent(user);
  myPeerConnection.oniceconnectionstatechange = () => handleICEConnectionStateChangeEvent(user);
  myPeerConnection.onsignalingstatechange = () => handleSignalingStateChangeEvent(user);
  myPeerConnection.onnegotiationneeded = () => handleNegotiationNeededEvent(user);
  channelCreated = true;
  let dataChannel = myPeerConnection.createDataChannel("dataChannel");
  console.log('dataChannel originated from ' + username + ' created', dataChannel);
  dataChannel.onopen = () => handleSendChannelStatusChange(user);
  dataChannel.onclose = () => handleSendChannelStatusChange(user);
  myPeerConnection.ondatachannel = (event) => receiveChannelCallback(event, user);
  let receiveChannel = null;
  peerConnections.push({
    target: user,
    myPeerConnection: myPeerConnection,
    dataChannel: dataChannel,
    receiveChannel: receiveChannel,
    checked: false,
  });
}

function findConnectionWithUsername(username) {
  return peerConnections.find(connection => connection.target === username);
}

function handleNegotiationNeededEvent(user) {
  let myPeerConnection = findConnectionWithUsername(user).myPeerConnection;
  if(!answering && !channelCreated) {
    console.log('Negotiation needed...');
    myPeerConnection.createOffer().then(function (offer) {
      console.log('Creating Offer...');
      return myPeerConnection.setLocalDescription(offer);
    })
      .then(function () {
        console.log('Sending offer to remote peer');
        sendToServer({
          name: username,
          target:user,
          type: "video-offer",
          sdp: myPeerConnection.localDescription
        });
      })
      .catch(reportError);
  }
}

function handleTrackEvent(event, user) {
  console.log('Track event');
  let div = document.createElement('div');
  let label = document.createElement('p');
  let text = document.createTextNode(user);
  label.appendChild(text);
  let video = document.createElement('video');
  video.srcObject = event.streams[0];
  video.autoplay = true;
  video.setAttribute('id', user);
  video.style.width = '350px';
  video.style.height = '350px';
  video.style.paddingBottom = '0';
  label.style.position = 'relative';
  label.style.top = '-40px';
  label.style.fontSize = '30px';
  label.style.fontWeight = 'bold';
  div.appendChild(video);
  div.appendChild(label);
  received_video.appendChild(div);
}

function handleAddStreamEvent(event, user) {
  console.log('Stream Added');
  let div = document.createElement('div');
  let label = document.createElement('p');
  let text = document.createTextNode(user);
  label.appendChild(text);
  let video = document.createElement('video');
  video.srcObject = event.stream;
  video.autoplay = true;
  video.setAttribute('id', user);
  video.style.width = '350px';
  video.style.height = '350px';
  video.style.paddingBottom = '0';
  label.style.position = 'relative';
  label.style.top = '-40px';
  label.style.fontSize = '30px';
  label.style.fontWeight = 'bold';
  div.appendChild(video);
  div.appendChild(label);
  received_video.appendChild(div);
}

function handleRemoveStreamEvent(user) {
  console.log('Stream removed');
  closeVideoCall(user);
}

function handleICECandidateEvent(event, user) {
  if(event.candidate) {
    console.log('Outgoing ICE candidate from ' + username + ' to others');

    sendToServer({
      name: username,
      target: user,
      type: "new-ice-candidate",
      candidate: event.candidate
    });
  }
}

function handleICEConnectionStateChangeEvent(user) {
  let targetConnection = findConnectionWithUsername(user);
  console.log(targetConnection.target + ' ICE Connection state changed to ', targetConnection.myPeerConnection.iceConnectionState);

  switch(targetConnection.myPeerConnection.iceConnectionState) {
    case "closed":
    case "failed":
    case "disconnected":
      closeVideoCall(user);
      break;
  }
}

function sendDataChannelMessage() {
  let msg = message.value;
  peerConnections.forEach(targetConnection => {
    targetConnection.dataChannel.send(msg);
  });
  console.log('The message is sent from ' + username + ' to all others');
  message.value = '';
  message.focus();
}

function handleSendChannelStatusChange(user) {
  console.log('in handleSendChannelStatusChange');
  let targetConnection = findConnectionWithUsername(user);
  if(targetConnection && targetConnection.dataChannel) {
    let state = targetConnection.dataChannel.readyState;
    console.log('dataChannel of ' + user + ' state: ' + state);
    if(state === 'open') {
      console.log(user + ' data channel is opened');
      targetConnection.checked = true;
    }
    else {
      console.log(user + ' data channel is closed');
      targetConnection.checked = false;
    }
    let ok = true;
    for(let i = 0 ; i < peerConnections.length ; i++) {
      console.log('peerConnections: ', peerConnections[i]);
      if(!peerConnections[i]) {
        console.log(i + ' th peerConnection is deleted but remain as null');
      } else if(!peerConnections[i].checked) {
        console.log('Connection with ' + peerConnections[i].target + ' is not checked');
        ok = false;
        break;
      }
    }
    if(ok) {
      sendButton.disabled = false;
      message.disabled = false;
    } else {
      sendButton.disabled = true;
      message.disabled = true;
    }
  } else {
    console.log('Connection closed');
    let notNullNumber = 0;
    for(let i = 0 ; i < peerConnections.length ; i++) {
      if(peerConnections[i]) {
        notNullNumber++;
      }
    }
    if(notNullNumber === 0) {
      sendButton.disabled = true;
      message.disabled = true;
    }

  }
}

function receiveChannelCallback(event, user) {
  console.log('data channel received from ' + user);
  let targetConnection = findConnectionWithUsername(user);
  targetConnection.receiveChannel = event.channel;
  targetConnection.receiveChannel.onmessage = (event) => handleReceiveMessage(event, user);
  targetConnection.receiveChannel.onopen = () => handleReceiveChannelStatusChange(user);
  targetConnection.receiveChannel.onclose = () => handleReceiveChannelStatusChange(user);
}

function handleReceiveMessage(event, user) {
  let el = document.createElement('p');
  let txtNode = document.createTextNode('From ' + user + ', ' + event.data);

  el.appendChild(txtNode);
  receiveBox.appendChild(el);
}

function handleReceiveChannelStatusChange(user) {
  let targetConnection = findConnectionWithUsername(user);
  if(targetConnection && targetConnection.receiveChannel) {
    console.log("Receive channel's status from " + user + " has changed to " + targetConnection.receiveChannel.readyState);
  } else {
    console.log('Connection in dataChannel closed');
  }
}

function handleSignalingStateChangeEvent(user) {
  let targetConnection = findConnectionWithUsername(user);
  console.log(targetConnection.target + ' WebRTC signaling state changed to: ', targetConnection.myPeerConnection.signalingState);
  switch(targetConnection.myPeerConnection.signalingState) {
    case "closed":
      closeVideoCall(user);
      break;
  }
}

function closeVideoCall(user) {
  console.log('Closing the call');
  let targetConnection = findConnectionWithUsername(user);
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

    // if(local_video.srcObject) {
    //   local_video.srcObject.getTracks().forEach(track => track.stop());
    // }

    // for(let i = 0 ; i < received_video.children.length ; i++) {
    //   if (received_video.children[i].srcObject) {
    //     received_video.children[i].srcObject.getTracks().forEach(track => track.stop());
    //   }
    // }

    // local_video.src = null;
    // for(let i = 0 ; i < received_video.children.length ; i++) {
    //   received_video.children[i].src = null;
    // }

    targetConnection.dataChannel.close();
    targetConnection.receiveChannel.close();
    myPeerConnection.close();
    myPeerConnection = null;
    targetConnection.dataChannel = null;
    targetConnection.receiveChannel = null;
    console.log('PeerConnections: ', peerConnections);
    for(let i = 0 ; i < peerConnections.length ; i++) {
      if(peerConnections[i].target === user) {
        console.log('before removal: ', peerConnections);
        peerConnections.splice(i, 1);
        console.log('after removal: ', peerConnections);
        break;
      }
    }
    for(let i = 0 ; i < received_video.children.length ; i++) {
      console.log('length: ', received_video.children.length);
      console.log('id: ', received_video.children[i].children[0].id);
      if(received_video.children[i].children[0].id === user) {
        if(received_video.children[i].srcObject) {
          received_video.children[i].srcObject.getTracks().forEach(track => track.stop());
        }
        received_video.children[i].src = null;
        console.log('Delete node with id ', received_video.children[i].id);
        received_video.removeChild(received_video.children[i]);
        break;
      }
    }


  }
}

function start(users) {
  console.log('Starting to prepare a chat');
  console.log('in start: ', users);
  for(let i = 0 ; i < users.length ; i++) {
    console.log('user id: ', users[i].id);
    console.log('username: ', username);
    if(users[i].id !== username) {
      createPeerConnection(users[i].id);
    }
  }
  navigator.mediaDevices.getUserMedia(mediaConstraints)
    .then(function(localStream) {
      channelCreated = false;
      console.log('Local video stream obtained');
      local_video.src = window.URL.createObjectURL(localStream);
      local_video.srcObject = localStream;
      if(hasAddTrack) {
        console.log('Adding tracks to the RTCPeerConnection');
        localStream.getTracks().forEach(track => {
          peerConnections.forEach(connection => connection.myPeerConnection.addTrack(track, localStream))
        });
      } else {
        console.log('Adding stream to the RTCPeerConnection');
        peerConnections.forEach(connection => connection.myPeerConnection.addStream(localStream));
      }
    })
    .catch(handleStartError);
}

function handleStartError(error) {
  console.log('in handleStartError: ', error);
}
function handleVideoOfferMsg(msg) {
  let localStream = null;
  createPeerConnection(msg.name);
  let desc = new RTCSessionDescription(msg.sdp);
  answering = true;
  let myPeerConnection = findConnectionWithUsername(msg.name).myPeerConnection;
  myPeerConnection.setRemoteDescription(desc).then(function() {
    console.log('Setting up the local media stream...');
    return navigator.mediaDevices.getUserMedia(mediaConstraints);
  })
    .then(function(stream) {
      console.log('Local video stream obtained');
      localStream = stream;
      local_video.src = window.URL.createObjectURL(localStream);
      local_video.srcObject = localStream;

      if(hasAddTrack) {
        console.log('Adding tracks to the RTCPeerConnection');
        localStream.getTracks().forEach(track => myPeerConnection.addTrack(track, localStream));
      } else {
        console.log('Adding stream to the RTCPeerConnection');
        myPeerConnection.addStream(localStream);
      }
    })
    .then(function() {
      console.log('Creating answer');
      return myPeerConnection.createAnswer();
    })
    .then(function(answer) {
      console.log('Setting local description after creating answer');
      return myPeerConnection.setLocalDescription(answer);
    })
    .then(function() {
      let message = {
        name: username,
        target: msg.name,
        type: "video-answer",
        sdp: myPeerConnection.localDescription
      };
      console.log("Sending answer packer back to other peer");
      sendToServer(message);
    })
    .catch((error) => handleGetUserMediaError(error, msg.name));
}

function handleVideoAnswerMsg(msg) {
  console.log('Call recipient ' + msg.name + ' has accepted our call');
  let desc = new RTCSessionDescription(msg.sdp);
  let targetConnection = findConnectionWithUsername(msg.name);
  targetConnection.myPeerConnection.setRemoteDescription(desc).catch((error) => reportError(error, msg.name));
  console.log('User ' + username + ' and User ' + msg.name + ' are exchanging answer and offer');
}

function handleNewICECandidateMsg(msg) {
  let candidate = new RTCIceCandidate(msg.candidate);
  console.log("Adding received ICE candidate from " + msg.name);
  let targetConnection = findConnectionWithUsername(msg.name);
  console.log('find target connection: ', targetConnection);
  targetConnection.myPeerConnection.addIceCandidate(candidate).catch((error) => reportError(error, msg.name));
}

function handleGetUserMediaError(e, user) {
  console.log('error: ', e);
  switch(e.name) {
    case "NotFoundError":
      alert("Unable to open your call because no camera and/or microphone were found");
      break;
    case "SecurityError":
    case "PermissionDeniedError":
      console.log('Security Error or PermissionDenied Error occurred');
      break;
    default:
      alert("Error opening your camera and/or microphone: " + e.message);
  }
  closeVideoCall(user);
}

function reportError(errMessage, user) {
  console.log("Error " + errMessage.name + ": " + errMessage.message + errMessage)
  closeVideoCall(user);
}

function sendToServer(msg) {
  console.log('sendToServer: ', msg.type);
  connection.emit('signaling', msg);
}

