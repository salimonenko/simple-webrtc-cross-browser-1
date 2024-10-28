
const offerSdp = document.getElementById("offer-sdp");
const myVideo = document.getElementById("my-video");
const remoteVideo = document.getElementById("remote-video");
const answerSdp = document.getElementById("answer-sdp");


/* � ���������� about:config (FF) � ������� media.peerconnection.default_iceservers ����� ������ ���������� ������, �������� [{"url": "stun:23.21.150.121"}]
   ��� ������ ������ [] (���������� ������). ����� ���� - ������� � ����� ��������� �������.
   ����� �������� ������ "ICE failed" � ������� onicecandidate ����������� �� �����. � FF36 �� ��������� ����� � ���������� �������� url.
*/
const iceServers_ = {
    iceServers: [
        {url:'stun:stun01.sipphone.com'},
        {url:'stun:stun.ekiga.net'},
        {url:'stun:stun.fwdnet.net'},
        {url:'stun:stun.ideasip.com'},
        {url:'stun:stun.iptel.org'},
        {url:'stun:stun.rixtelecom.se'},
        {url:'stun:stun.schlund.de'},
        {url:'stun:stun.l.google.com:19302'},
        {url:'stun:stun1.l.google.com:19302'},
        {url:'stun:stun2.l.google.com:19302'},
        {url:'stun:stun3.l.google.com:19302'},
        {url:'stun:stun4.l.google.com:19302'},
        {url:'stun:stunserver.org'},
        {url:'stun:stun.softjoys.com'},
        {url:'stun:stun.voiparound.com'},
        {url:'stun:stun.voipbuster.com'},
        {url:'stun:stun.voipstunt.com'},
        {url:'stun:stun.voxgratia.org'},
        {url:'stun:stun.xten.com'},
        { url: 'turn:numb.viagenie.ca', credential: 'muazkh', username: 'webrtc@live.com' },
        { url: 'turn:192.158.29.39:3478?transport=udp', credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=', username: '28224511:1379330808' },
        { url: 'turn:192.158.29.39:3478?transport=tcp', credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=', username: '28224511:1379330808' }
    ],
    configuration: {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
    },
    optional: [],
    mandatory: {
        OfferToReceiveAudio: true
    },

    offerToReceiveAudio: true,
    offerToReceiveVideo: true
};



const peer = (new window.RTCPeerConnection()) || (new RTCPeerConnection());
/* � FF24, FF36:
� ������� RTCPeerConnection ���������, ������, ��� ��������� ������, ������, ������ �� ��� �� ��������, ������ ������ "not implemented" (�� �����������)
*/


var startConnection = function(stream, what_to_do)  {

//    alert(JSON.stringify(peer.localDescription))

// ���� localDescription � offer/answer ��� �� ��� ������� (� ����� ����� ������, �.�. offer/answer ������ ��������� ������)
    if(JSON.stringify(peer.localDescription) == 'null' || !JSON.stringify(peer.localDescription) ) {

        try { // ������� �������� �������� ����� (�����) ����� ��������
            stream.getTracks().forEach(function (track) {
                peer.addTrack(track, stream)
            });

            peer.addEventListener("track", function (e) {
                remoteVideo.srcObject = e.streams[0];
            }, false);

        } catch (er) {
            peer.onaddstream = function (e) {
                console.log('��������� ������� onaddstream. �.�. �����/�����-����� ������� ��������, ������������ ��� ������ ���������');
                remoteVideo.srcObject = e.stream
            };
            peer.addStream(stream);
        }


        var container;
        if(what_to_do === 'call'){
            container = offerSdp;
        }
        if(what_to_do === 'answer'){
            container = answerSdp;
        }

        container.innerHTML = ''; // ������� ����� ������ ������ ������

        peer.onicecandidate = function (ice) { // B FF24 ����������� 1 ���, � � FF36 - 32 ����.
//        alert('onicecandidate: '+ ice.candidate);
// �� offerSdp ����������� ����� (����� innerHTML) ����� ������� ����������� � �������� � ��������������� ���� �� �������� � ������ ������� �����-����
            container.innerHTML = JSON.stringify(peer.localDescription);
// � ������ ����� �������� ���������� ��������� JSON.stringify(peer.localDescription) �� ������ STUN...

        };

        peer.oniceconnectionstatechange = function () {
/*
 new: WebRTC ������� ���������� �� ������ ������� �����������, ������� ����� ��������� � ������� ������ addIceCandidate;
 checking: WebRTC ������� ���������� �� ������ ������� �����������, ���������� �� � ���������� � ���������� ��������;
 connected: ������� ���������� ���� ���������� � ����������� �����������. �������������, ��� ����� ����� ��������� ����� ���������� ���������, � ������������ � ���������� �Trickle ICE�;
 completed: ��� ��������� �������� � ����������� �����������.
 disconnected: ����������� ���������. �� ������������ ������� WebRTC �������� ���� ������������ �����������, ������ �� ������ connected;
 closed: ����������� ��������� � WebRTC ������ � ��� �� ��������.
 https://www.pvsm.ru/javascript/287868
*/



        }



        // for Firefox � Chrome:
        var optionsObject = {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        };


        if (what_to_do === 'answer') {

            try { // ��� ����� ����� ���������, �������������� ������ ��� peer.setRemoteDescription()
                peer.setRemoteDescription(JSON.parse(offerSdp.value))
                    .then(function () {
                        peer.createAnswer()
                    })
                    .then(function (answer) { // >= FF37
                        peer.setLocalDescription(answer)
                    });
            } catch (mes) {
                console.log('���� ������� �� ������������ ������� ��� peer.setRemoteDescription(). ������� �������� �������� ��� ��� (������, ��� ������ deprecated)...');


// https://udn.realityripple.com/docs/Web/API/RTCPeerConnection/setRemoteDescription  (��� ������� ��������� ����������, �.�. ������)
                var remoteSessionDescription = new RTCSessionDescription(JSON.parse(offerSdp.value)); // deprecated
                peer.setRemoteDescription(remoteSessionDescription,
                    function () {
                        console.log('������� ������ �������. peer.setRemoteDescription() ������� ��������.')
                    },
                    function () {
                        alert('Error! peer.setRemoteDescription() �� ��������, ����� �� ������ �� ���������� �� ������.');
                    });

                peer.createAnswer(
                    function (answer) {
                        peer.setLocalDescription(answer);
                        console.log('answer sdp', answer.sdp);
                        console.log('type', answer.type);
                    },
                    function () {
                        alert('Error: ������ ��� �������� answer (��� ������� ���������� peer.createAnswer(...) )');
                    },
                    optionsObject)

            }
        }


        if (what_to_do === 'call') {
            try { // ��� ����� ����� ���������, �������������� ������ ��� peer.createOffer()
                peer.createOffer().then(function (offer) { // >= FF37
                    peer.setLocalDescription(offer)
                });
            } catch (mes) {

                console.log('���� ������� �� ������������ ������� ��� peer.createOffer(). ������� �������� �������� ��� ��� (������, ��� ������ deprecated)...');
/* � FF24, FF36: ���� ������������ ����������� ������� (��� callbacks), �� �������� ������:
TypeError: Not enough arguments to mozRTCPeerConnection.createOffer.
���� ������ �������-callbacks ������ null ��� {}, �� ����� ������ ������: TypeError: Argument 1 of mozRTCPeerConnection.createOffer is not callable.
���� � ���, � ������ FF custom-�������� �� ����, ������� createOffer() ��������� ���� (�����������) �������. � ���� �� ������������ ������ ������, ��
�������� ����� ��������� peer.setLocalDescription(offer) ����� �������, �.�. offer ����� �� ������ ���������. ������� ����� ������������ deprecated-������.
*/
                peer.createOffer(
                    function (offer) { // deprecated!
                        peer.setLocalDescription(offer);
                        // �.�. �������� �� ��� ���������� offer.sdp, �.�. ��������� ���� ����� ���� �� ������� (� FF36)
                        console.log('offer sdp: ', offer.sdp);
//                console.log('type: ',      JSON.stringify(peer.localDescription));
                        console.log('������� ������ �������. peer.createOffer() ������� ��������.');
                    },
                    function () { // deprecated!
                        alert('Error: ������ ��� �������� offer (��� ������� ���������� peer.createOffer(...) )');
                    },
                    optionsObject
                );
            }

        }
// ���������, ������� �� ���������. ���� �� ��������� �� ���� ������� onicecandidate, �.�. ���� � JSON.stringify(peer.localDescription) ��� ������� "candidate", ������, ���������� ���.
    setTimeout(function () {
        check_candidates();
    }, 3000);

    }else { // ���� ������ ��� ������������, ��, ������, ���������� ��� ���� �������
        // ���������, ���� �� � offer ���� �� 1 ��������
        if(!check_candidates()){
            alert('��� ������� �������� ���������� ������� �������� ��� ��������.');
            return false;
        }
    }

};

function check_candidates() {
    var offer = JSON.stringify(peer.localDescription);

    if(!/candidate/.test(offer)){
        alert('������, �� ���������� �� ������ ��������� �� ����������. ����� ������, ����� ��������� ������ WebRTC, ��������� ������������ ������� ��������. ���������� ������������� ������� � ��������� ������ �� ����������.');
        return false;
    }else {
        console.log('� offer ������� �� ������� ���� 1 �������� �� ����������. �.�. ���������� ����� ����������.');
        return true;
    }
}


// ********************************************************************************************
/*

var startConnection_old = function(stream)  {
//  stream.getTracks().forEach( function(track) {peer.addTrack(track, stream)});
//  peer.addEventListener("track", function(e)  { remoteVideo.srcObject = e.streams[0]; }, false);

    peer.onaddstream = function(e) {alert('onaddstream !'); remoteVideo.srcObject = e.stream};
    peer.addStream(stream);
    peer.onicecandidate = function( event ) { // B FF24 ����������� 1 ���, � � FF36 - 32 ����.
//        alert('onicecandidate: '+ event.candidate);
// �� offerSdp ����������� ����� (����� innerHTML) ����� ������� ����������� � �������� � ��������������� ���� �� �������� � ������ ������� �����-����
        offerSdp.innerHTML = JSON.stringify(peer.localDescription);
    };

// for Firefox � Chrome:
    var optionsObject = {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    };

/!* � FF24, FF36: ���� ������������ ����������� ������� (��� callbacks), �� �������� ������:
 TypeError: Not enough arguments to mozRTCPeerConnection.createOffer.
 ���� ������ �������-callbacks ������ null ��� {}, �� ����� ������ ������: TypeError: Argument 1 of mozRTCPeerConnection.createOffer is not callable.
 ���� � ���, � ������ FF custom-�������� �� ����, ������� createOffer() ��������� ���� (�����������) �������. � ���� �� ������������ ������ ������, ��
 �������� ����� ��������� peer.setLocalDescription(offer) ����� �������, �.�. offer ����� �� ������ ���������. ������� ����� ������������ deprecated-������.
*!/
        peer.createOffer(
            function (offer) { // deprecated!
                peer.setLocalDescription(offer);
//                console.log('offer sdp: ', offer.sdp);
//                console.log('type: ',      JSON.stringify(peer.localDescription));
            },
            function () { // deprecated!
                alert('Error: ������ ��� �������� offer (��� ������� ���������� peer.createOffer(...) )');
            },
            optionsObject
        );

};

*/








var acceptAnswer = function() {

    try{ // ��� ����� ����� ���������, �������������� peer.setRemoteDescription(description)

        return peer.setRemoteDescription(JSON.parse(answerSdp.value));
    }catch (mes){

// https://udn.realityripple.com/docs/Web/API/RTCPeerConnection/setRemoteDescription  (��� ������� ��������� ����������, �.�. ������)
    var remoteSessionDescription = new RTCSessionDescription(JSON.parse(answerSdp.value)); // deprecated
    peer.setRemoteDescription(remoteSessionDescription,
        function () {
            console.log('������� ������ �������. peer.setRemoteDescription() ������� ��������.')
        },
        function () {
            console.log('������ ��� ���������� peer.setRemoteDescription() � ������� acceptAnswer():');
            console.log(mes)
            alert('Error! peer.setRemoteDescription() �� ��������, ����� �� ������ �� ���������� �� ������.');
        });


    }
};




















