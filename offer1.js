

var myPeerConnection;
var caller_video=document.getElementById('caller_video');
var receiver_video=document.getElementById('receiver_video');
var mediaConstraints = {
    video:true,
    audio:false
};
function sendToServer(msg){
    var msgJSON = JSON.stringify(msg);
    $.ajax({
        type:'get',
        url:'offer.php',
        data:'object='+msgJSON,
        beforeSend:function(){
            console.log('Sending...');
        },
        success:function(data){
            console.log(data);
        }
    });
}
function reportError(error){
    console.log(error.name);
}
function handleNegotiationNeededEvent(){
    myPeerConnection.createOffer().then(function(offer) {
        return myPeerConnection.setLocalDescription(offer);
    })
        .then(function(){ // so here I'm supposed to send an offer
            sendToServer({
                name: myUsername,
                target: targetUsername,
                type: "video-offer",
                sdp: myPeerConnection.localDescription
            });
        })
        .catch(reportError);
}
function handleICECandidateEvent(event){
    if(event.candidate){//send the ICECandidates
        sendToServer({
            name: myUsername,
            target: targetUsername,
            type: "new-ice-candidate",
            candidate: event.candidate
        });
    }
}
function handleTrackEvent(event){
    console.log(event);
    document.getElementById("received_video").srcObject = event.streams[0];
}

function handleRemoveTrackEvent(event){
    var stream = document.getElementById("received_video").srcObject;
    var trackList = stream.getTracks();
    if (trackList.length == 0){
        closeVideoCall();
    }
}
function handleICEConnectionStateChangeEvent(event){
    console.log('ICE connection changed!');
    switch(myPeerConnection.iceConnectionState) {
        case "closed":
        case "failed":
        case "disconnected":
            closeVideoCall();
            break;
    }
}
function handleICEGatheringStateChangeEvent(event){
    console.log('Is gathering');
    console.log(event);
}
function handleSignalingStateChangeEvent(event) {
    console.log('Signaling state changed');
    switch(myPeerConnection.signalingState) {
        case "closed":
            closeVideoCall();
            break;
    }
};
function createPeerConnection() {
    var STUN = {
        'url': 'stun:stun.l.google.com:19302',
    };
    var iceServers =
        {
            iceServers: [STUN]
        };

    myPeerConnection = new RTCPeerConnection(iceServers);
    myPeerConnection.onnegotiationneeded = handleNegotiationNeededEvent; // Частично поддерживается
    myPeerConnection.onicecandidate = handleICECandidateEvent;
    myPeerConnection.ontrack = handleTrackEvent;
    myPeerConnection.onremovetrack = handleRemoveTrackEvent;
    myPeerConnection.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
    myPeerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
    myPeerConnection.onsignalingstatechange = handleSignalingStateChangeEvent; // FF24-FF35 - частично поддерж.
}
function handleGetUserMediaError(e) {
    switch(e.name) {
        case "NotFoundError":
            alert("Unable to open your call because no camera and/or microphone" +
                "were found.");
            break;
        case "SecurityError":
        case "PermissionDeniedError":
            // Do nothing; this is the same as the user canceling the call.
            break;
        default:
            alert("Error opening your camera and/or microphone: " + e.message);
            break;
    }
    closeVideoCall();
}
function closeVideoCall(){
//do something to exit the video call
}
//invite the other peer...we want to send our SDP
function invite(evt){
    if (myPeerConnection){
        console.log('Call already started');
    }
    else{
        //myPeerConnection=new MediaStream();
        targetUsername ='Nevil';//Unique other peer username
        myUsername='Philip';
        createPeerConnection();//this function creates a peer connection//uses the STUN/TURNS servers...updates myPeerConnection variable so it's not null
        navigator.mediaDevices.getUserMedia(mediaConstraints)//grab our media constraints
            .then(function(localStream) {
                caller_video.srcObject =localStream;
                caller_video.play();
                localStream.getTracks().forEach(function(track) {myPeerConnection.addTrack(track, localStream)});
            })
            .catch(handleGetUserMediaError);
    }
}

//we click the call button
document.querySelector('#callBt').addEventListener('click',function(){
    invite();
});