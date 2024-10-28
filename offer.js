
const offerSdp = document.getElementById("offer-sdp");
const myVideo = document.getElementById("my-video");
const remoteVideo = document.getElementById("remote-video");
const answerSdp = document.getElementById("answer-sdp");


/* В настройках about:config (FF) в строчке media.peerconnection.default_iceservers нужно задать ПРАВИЛЬНЫЙ сервер, например [{"url": "stun:23.21.150.121"}]
   Или задать просто [] (квадратные скобки). После чего - закрыть и снова запустить браузер.
   Иначе выдается ошибка "ICE failed" и событие onicecandidate срабатывать не будет. В FF36 по умолчанию задан в настройках неверный url.
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
/* В FF24, FF36:
В объекте RTCPeerConnection объявлены, похоже, все известные методы, однако, многие из них не работают, выдают ошибку "not implemented" (не реализованы)
*/


var startConnection = function(stream, what_to_do)  {

//    alert(JSON.stringify(peer.localDescription))

// Если localDescription и offer/answer еще не был созданы (а иначе будет ошибка, т.к. offer/answer нельзя создавать заново)
    if(JSON.stringify(peer.localDescription) == 'null' || !JSON.stringify(peer.localDescription) ) {

        try { // Вначале пытаемся получить видео (более) новым способом
            stream.getTracks().forEach(function (track) {
                peer.addTrack(track, stream)
            });

            peer.addEventListener("track", function (e) {
                remoteVideo.srcObject = e.streams[0];
            }, false);

        } catch (er) {
            peer.onaddstream = function (e) {
                console.log('Сработало событие onaddstream. Т.е. аудио/видео-поток запущен способом, используемым для старых браузеров');
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

        container.innerHTML = ''; // Очищаем после начала старта вызова

        peer.onicecandidate = function (ice) { // B FF24 срабатывает 1 раз, а в FF36 - 32 раза.
//        alert('onicecandidate: '+ ice.candidate);
// Из offerSdp вставленный текст (через innerHTML) нужно вручную скопировать и вставить в соответствующее поле на странице у другой стороны видео-чата
            container.innerHTML = JSON.stringify(peer.localDescription);
// А теперь можно посылать сигнальное сообщение JSON.stringify(peer.localDescription) на сервер STUN...

        };

        peer.oniceconnectionstatechange = function () {
/*
 new: WebRTC ожидает кандидатов от второй стороны подключения, которых нужно добавлять с помощью метода addIceCandidate;
 checking: WebRTC получил кандидатов от второй стороны подключения, сравнивает их с локальными и перебирает варианты;
 connected: выбрана подходящая пара кандидатов и подключение установлено. Примечательно, что после этого кандидаты могут продолжить приходить, в соответствии с протоколом «Trickle ICE»;
 completed: все кандидаты получены и подключение установлено.
 disconnected: подключение разорвано. На нестабильных каналах WebRTC способно само восстановить подключение, следим за флагом connected;
 closed: подключение разорвано и WebRTC больше с ним не работает.
 https://www.pvsm.ru/javascript/287868
*/



        }



        // for Firefox и Chrome:
        var optionsObject = {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        };


        if (what_to_do === 'answer') {

            try { // Для более новых браузеров, поддерживающих промис для peer.setRemoteDescription()
                peer.setRemoteDescription(JSON.parse(offerSdp.value))
                    .then(function () {
                        peer.createAnswer()
                    })
                    .then(function (answer) { // >= FF37
                        peer.setLocalDescription(answer)
                    });
            } catch (mes) {
                console.log('Этот браузер не поддерживает промисы для peer.setRemoteDescription(). Поэтому пытаемся обойтись без них (правда, это теперь deprecated)...');


// https://udn.realityripple.com/docs/Web/API/RTCPeerConnection/setRemoteDescription  (там описаны возможные исключения, т.е. ошибки)
                var remoteSessionDescription = new RTCSessionDescription(JSON.parse(offerSdp.value)); // deprecated
                peer.setRemoteDescription(remoteSessionDescription,
                    function () {
                        console.log('Попытка прошла успешно. peer.setRemoteDescription() успешно выполнен.')
                    },
                    function () {
                        alert('Error! peer.setRemoteDescription() не выполнен, ответ на запрос на соединение НЕ сделан.');
                    });

                peer.createAnswer(
                    function (answer) {
                        peer.setLocalDescription(answer);
                        console.log('answer sdp', answer.sdp);
                        console.log('type', answer.type);
                    },
                    function () {
                        alert('Error: Ошибка при создании answer (при попытке выполнения peer.createAnswer(...) )');
                    },
                    optionsObject)

            }
        }


        if (what_to_do === 'call') {
            try { // Для более новых браузеров, поддерживающих промис для peer.createOffer()
                peer.createOffer().then(function (offer) { // >= FF37
                    peer.setLocalDescription(offer)
                });
            } catch (mes) {

                console.log('Этот браузер не поддерживает промисы для peer.createOffer(). Поэтому пытаемся обойтись без них (правда, это теперь deprecated)...');
/* в FF24, FF36: Если использовать современный вариант (без callbacks), то выдается ошибка:
TypeError: Not enough arguments to mozRTCPeerConnection.createOffer.
Если вместо функций-callbacks задать null или {}, то будет другая ошибка: TypeError: Argument 1 of mozRTCPeerConnection.createOffer is not callable.
Дело в том, в ранних FF custom-промисов не было, поэтому createOffer() выполняло роль (встроенного) промиса. А если не использовать промис вообще, то
придется тогда запускать peer.setLocalDescription(offer) через таймаут, т.к. offer может не успеть создаться. Поэтому здесь используется deprecated-способ.
*/
                peer.createOffer(
                    function (offer) { // deprecated!
                        peer.setLocalDescription(offer);
                        // М.б. выведено не все содержимое offer.sdp, т.к. кандидаты пока могут быть НЕ найдены (в FF36)
                        console.log('offer sdp: ', offer.sdp);
//                console.log('type: ',      JSON.stringify(peer.localDescription));
                        console.log('Попытка прошла успешно. peer.createOffer() успешно выполнен.');
                    },
                    function () { // deprecated!
                        alert('Error: Ошибка при создании offer (при попытке выполнения peer.createOffer(...) )');
                    },
                    optionsObject
                );
            }

        }
// Проверяем, найдены ли кандидаты. Если не сработало ни разу событие onicecandidate, т.е. если в JSON.stringify(peer.localDescription) нет строчки "candidate", значит, кандидатов нет.
    setTimeout(function () {
        check_candidates();
    }, 3000);

    }else { // Если камера уже подключалась, то, видимо, соединение уже было создано
        // Проверяем, если ли в offer хотя бы 1 кандидат
        if(!check_candidates()){
            alert('Для повтора создания соединения вначале обновите эту страницу.');
            return false;
        }
    }

};

function check_candidates() {
    var offer = JSON.stringify(peer.localDescription);

    if(!/candidate/.test(offer)){
        alert('Похоже, не обнаружено ни одного кандидата на соединение. Такое бывает, когда возникает ошибка WebRTC, вызванная некорректной работой браузера. Попробуйте перезапустить браузер и повторить запрос на соединение.');
        return false;
    }else {
        console.log('В offer имеется по крайней мере 1 кандидат на соединение. Т.е. соединение может состояться.');
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
    peer.onicecandidate = function( event ) { // B FF24 срабатывает 1 раз, а в FF36 - 32 раза.
//        alert('onicecandidate: '+ event.candidate);
// Из offerSdp вставленный текст (через innerHTML) нужно вручную скопировать и вставить в соответствующее поле на странице у другой стороны видео-чата
        offerSdp.innerHTML = JSON.stringify(peer.localDescription);
    };

// for Firefox и Chrome:
    var optionsObject = {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    };

/!* в FF24, FF36: Если использовать современный вариант (без callbacks), то выдается ошибка:
 TypeError: Not enough arguments to mozRTCPeerConnection.createOffer.
 Если вместо функций-callbacks задать null или {}, то будет другая ошибка: TypeError: Argument 1 of mozRTCPeerConnection.createOffer is not callable.
 Дело в том, в ранних FF custom-промисов не было, поэтому createOffer() выполняло роль (встроенного) промиса. А если не использовать промис вообще, то
 придется тогда запускать peer.setLocalDescription(offer) через таймаут, т.к. offer может не успеть создаться. Поэтому здесь используется deprecated-способ.
*!/
        peer.createOffer(
            function (offer) { // deprecated!
                peer.setLocalDescription(offer);
//                console.log('offer sdp: ', offer.sdp);
//                console.log('type: ',      JSON.stringify(peer.localDescription));
            },
            function () { // deprecated!
                alert('Error: Ошибка при создании offer (при попытке выполнения peer.createOffer(...) )');
            },
            optionsObject
        );

};

*/








var acceptAnswer = function() {

    try{ // Для более новых браузеров, поддерживающих peer.setRemoteDescription(description)

        return peer.setRemoteDescription(JSON.parse(answerSdp.value));
    }catch (mes){

// https://udn.realityripple.com/docs/Web/API/RTCPeerConnection/setRemoteDescription  (там описаны возможные исключения, т.е. ошибки)
    var remoteSessionDescription = new RTCSessionDescription(JSON.parse(answerSdp.value)); // deprecated
    peer.setRemoteDescription(remoteSessionDescription,
        function () {
            console.log('Попытка прошла успешно. peer.setRemoteDescription() успешно выполнен.')
        },
        function () {
            console.log('Ошибка при выполнении peer.setRemoteDescription() в функции acceptAnswer():');
            console.log(mes)
            alert('Error! peer.setRemoteDescription() не выполнен, ответ на запрос на соединение НЕ сделан.');
        });


    }
};




















