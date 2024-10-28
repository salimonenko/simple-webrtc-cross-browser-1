/* <!--   �����������   --> */

/**
 * @author as3coder
 * @author Salimonenko_D.A.
 */

var localMediaStream = null;
var flag_camera = false;

function cam(what_to_do){
    var take_button =  document.getElementById('take_button'); // +++
    var save_button =  document.getElementById('save_button'); // +++

// ���������� ������� �������� ������ ������������. �������������� ����� ��������� ������ ��� ������ ���������
    navigator.getUserMedia = ( navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia);


    if((!navigator.getUserMedia) && (!navigator.mediaDevices)){ // ���� ��� ����������� �������� �������� ������, ���������� ��������������� ��������� � ��������� ������
        if((!navigator.getUserMedia)){
            try {
                console.log('My message: navigator.getUserMedia='+navigator.getUserMedia);
//                alert('navigator.getUserMedia='+navigator.getUserMedia);
            }catch (er){
                alert('������ VIDEO: ' + er.name + ":" + er.message + "\n" + er.stack);
            }
        }
        if(!navigator.mediaDevices){
            try {
                console.log('My message: navigator.mediaDevices='+navigator.mediaDevices);
//                alert('navigator.mediaDevices='+navigator.mediaDevices);
            }catch (er){
                alert('������ VIDEO: ' + er.name + ":" + er.message + "\n" + er.stack);
            }
        }
        alert('� ���������, ���������� ���������� �����������: ��� ������� �� ������������ �� ����� navigator.getUserMedia, �� ����� navigator.mediaDevices\n\n ������ �����, ������, ��� ������� ��������� ���� ����� ��� ������ ����� �� ��������� ����, ������ �������� HTTPS. ����� ������������ � ���������, �� ������ ���������� ������� ����� ������ ������. ��������, Firefox 24...60, Chrome �� 47...48 ������, Edge ��... �� ����, ����� ������, �� ����������� Edge 81 ����� ������ ������� �� ����. �� �� ����� � safari.\n ��� ����� ����������� ������� ��� �������� �� ��������� HTTPS. ');
//        take_button.disabled = true;
        return;
    }

    var video = document.getElementById("my-video");
    video.crossOrigin = "anonymous"; // ������? +++

    var navigat; // ���� ��� ������ ���� ��� ����� ������ ����������� ����� � ����������� �� ��������� ������� mediaDevices ��� getUserMedia

    if ((navigator.mediaDevices) && Promise_check()) { // ��� ����� ����� ��������� � ���� ��������� �������������� ������ Promise
// Some browsers partially implement mediaDevices. We can't just assign an object
// with getUserMedia as it would overwrite existing properties.
// Here, we will just add the getUserMedia property if it's missing.
        // Older browsers might not implement mediaDevices at all, so we set an empty object first
        if (navigator.mediaDevices === undefined) {
            navigator.mediaDevices = {};
        }

        if (navigator.mediaDevices.getUserMedia === undefined) {
            navigator.mediaDevices.getUserMedia = function(constraints) {

                // First get ahold of the legacy getUserMedia, if present
                var getUserMedia = ( navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia ||
                navigator.msGetUserMedia);

// Some browsers just don't implement it - return a rejected promise with an error to keep a consistent interface
                if (!getUserMedia) {
                    alert('� ���������, ��� ������� �� ����������� �������� navigator.getUserMedia. ����������� ������ ����������.');
                    return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
                }
                // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
                return new Promise(function (resolve, reject) {
                    getUserMedia.call(navigator, constraints, resolve, reject);
                });
            }
        }
        navigat = 'mediaDevices'; // ����, ���� �������������� navigator.mediaDevices � ������ Promise
    } else if(navigator.getUserMedia) { // ��� ����� ������ ��������� ��� ���� �� �������������� ������ Promise

        navigat = 'getUserMedia';


    }else {// ���� �� �������������� �� navigator.getUserMedia, �� navigator.mediaDevices ������ � �������� Promise
        alert('� ���������, ���������� ���������� �����������: ��� ������� �� ������������ �� ����� navigator.getUserMedia, �� ����� navigator.mediaDevices\n\n ������ �����, ������, ��� ������� ��������� ���� ����� ��� ������ ����� �� ��������� ����, ������ �������� HTTPS. ����� ������ ������ � ����������, �� ������ ���������� ������� ����� ������ ������. ��������, Firefox 24...67, Chrome �� 47...48 ������, Edge ��... �� ����, ����� ������, ��, ��������, Edge 81 ����� ������ ������� �� ����. �� �� ����� � safari.\n ��� �� ������ ���������� ������� ��� �������� �� ��������� HTTPS. ');
        take_button.disabled = true;
        return;
    }

    if(!flag_camera){// ���� ������ ��� �� ���� ����������
        show_video_from_CAM(take_button, save_button, video, navigat, what_to_do); // �������� ����� ����� �� ������
    }
}

function show_video_from_CAM(take_button, save_button, video, navigat, what_to_do){// ������� �������� ����� ����� �� ������
    var error_camera = true;
    var error_connection = true;

    if(navigat === 'getUserMedia'){

        navigator.getUserMedia({ video : true, audio: true },
// ������������ ������� ��������� ��������� ������. ������ ��������� ����� ����� ��������
            function (stream){

                    window.URL.createObjectURL = window.URL.createObjectURL || window.URL.webkitCreateObjectURL || window.URL.mozCreateObjectURL || window.URL.msCreateObjectURL || window.webkitURL.createObjectURL;
                    video.src = window.URL.createObjectURL(stream);

                    if (navigator.mozGetUserMedia) {
                        video.mozSrcObject = stream;
                    } else {
                        window.URL.createObjectURL = window.URL.createObjectURL || window.URL.webkitCreateObjectURL || window.URL.mozCreateObjectURL || window.URL.msCreateObjectURL || window.webkitURL.createObjectURL;
//                    var vendorURL = window.URL || window.webkitURL;
                        video.src = window.URL.createObjectURL(stream);
                    }

                    flag_camera = true; // ���� (������� ����������� ������)
                    localMediaStream = stream; // ���������, ����� ����� ���� ����������� ��������� ������
                    //---
                    take_button.addEventListener('click', OnTakeButtonClick);
                    save_button.addEventListener('click', OnSaveButtonClick);
                    video.play(); // ���������, �� ��� FF24 ����� ������������ � ��� ���� �������. � � FF36 ��� ������� ���������

                try{
                    startConnection(stream, what_to_do);
                }catch (er){
                    console.log('���� ������� �� ����� ������� ���������� ����� WebRTC: \n' + er);
                    alert('������: ���������� ������� ����������.');
                }
            },
            function (){// ������������ ������� ������ ��� ��������� ������
                alert('������, ����������� ������ ������ ����������� ��� �� ���������� � ����������. ��� ������������� ����������� �� ���� �������� ������� ������� ���������� �� ������������� � ������ ����������.');
//      take_button.disabled = true;
            });
        return;
    }

    if(navigat === 'mediaDevices'){ // ���� ��������� �������������� navigator.mediaDevices � ������ Promise

        navigator.mediaDevices.getUserMedia({video: true, audio: true })
            .then(function(stream) {
//                var video = document.querySelector('video');

                flag_camera = true; // ���� (������� ����������� ������)

                localMediaStream = stream; // ���������, ����� ����� ���� ����������� ��������� ������
                //---
                take_button.addEventListener('click', OnTakeButtonClick);
                save_button.addEventListener('click', OnSaveButtonClick);

//                document.getElementById('CanvasContainer').getElementsByTagName('div')[0].style.display = 'block'; // ���������� ��� div � ����� video
                // Older browsers may not have srcObject
                if ("srcObject" in video) {
                    video.srcObject = stream;
                } else {
                    // Avoid using this in new browsers, as it is going away.
                    video.src = window.URL.createObjectURL(stream);
                }

                if('onloadedmetadata' in this){ // ���� ������� onloadedmetadata �������������� ���������, �� ���������� ���
                    video.onloadedmetadata = function(e) {
                        video.play();
                    };
                }else { // ���� �� ��������������, �� �������� �������� ��� ����
                    video.play();
                }
            error_camera = false; // ���� �� ��������� ������ ��� ������ � �������

                startConnection(stream, what_to_do); // ��� ��� ����� ����� ���������
                console.log('������ ��� ������ �� ������ �� ������������ ���������� ������� ��������. ');
            error_connection = false;

            })
            .catch(function(err) {
                console.log(err.name + ": " +  err.message + ' '+ '. ���������� ���������� ����������� �/��� ��������');

                if(err.name === 'SourceUnavailableError'){ // ���� ������ �/��� �������� - ������
                    alert("��������, ��������� �� ���������� � ������ ���������� ��� ������ ������ �����������. ���������, ����������, ��������� � ����� ����� ��������� ������� �� ������������� �� ���� ��������.")
                }else { // ���� ������ ������

                    var alert_mes = '';
                    if(error_camera){
                        alert_mes += "��� ������ � ���������� �/��� ���������� ��������� ������ ��������. ���������� ����������.\n";
                    }
                    if(error_connection){
                        alert_mes += "�������� ������ ��� ������� WebRTC-����������. ���������� �������� �������� � ��������� ������� ����������.";
                    }

                    if(alert_mes){
                        alert(alert_mes);
                    }

                }

            });
        return;
    }

}








function cam_stop (){

// ���������� ������� �������� ������ ������������. �������������� ����� ��������� ������ ��� ������ ���������
    navigator.getUserMedia = ( navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia ||
    navigator.mediaDevices.getUserMedia);

    navigator.getUserMedia({ video : true, audio: true },
        /**
         * ������������ ������� ��������� ��������� ������
         * ������ ��������� ����� ����� ��������
         */
        function (stream){
//            window.URL.createObjectURL = window.URL.createObjectURL || window.URL.webkitCreateObjectURL || window.URL.mozCreateObjectURL || window.URL.msCreateObjectURL;
            stop_str(stream);
        },
        /**
         * ������������ ������� ������ ��� ��������� ������
         * ������� ��������������� ���������
         */
        function (stream){
            stop_str(stream);
        });

    function stop_str(stream) {
        var video = document.getElementById("my-video");
        video.pause(); // ������������� ����� �����
        video.src="";

//        document.getElementById('CanvasContainer').getElementsByTagName('div')[0].style.display = 'none'; // �������� ��� div � ����� video

//            localMediaStream = null;


        try{ // ������� �������� ��������� ������ ������ ��������
            try {
                localMediaStream.stop();
                flag_camera = false;
            }
            catch (er){console.log('My message: �� �������� localMediaStream.stop()');}
            try {
                MediaStreamTrack.stop();
                flag_camera = false;
            }
            catch(er) {console.log('My message: �� �������� MediaStreamTrack.stop()');}

            try {
                stream.stop();
                flag_camera = false;
            } // ������ ������ ��������� ������
            catch (er){console.log('My message: �� �������� stream.stop()');}

            try {
                stop_stream(stream);
                stop_stream(localMediaStream);
                flag_camera = false;
            }
            catch(er){console.log('My message: �� ��������� ������� stop_stream()');}

            if(!flag_camera){
                alert('����������� ��������� �� ���� ���-��������.');
                flag_camera = false;
            }else {
                alert('�� ���������� ��������� ����������� �� ���� ���-��������. ��� �������, ��� �� ���������� ���������� �������� ��� ��������.');
            }
        }
        catch(er){
            alert('������! �� ���������� ��������� ����������� �� ���� �����������. ��� �� ���������� ���������� �������� ��� ��������.');
        }


        var take_button = document.getElementById('take_button');
        var save_button = document.getElementById('save_button');
        take_button.removeEventListener("click", OnTakeButtonClick);
        save_button.removeEventListener("click", OnSaveButtonClick);
    }

}




/**
 * ������������ ������� ������� �� ������ ������
 * ������������ �� ����������� �������� canvas ���������� �������� video
 */
function OnTakeButtonClick (){
    console.log('OnTakeButtonClick  �� ���������')
    return;

    var video = document.getElementById('video');
    var width = video.videoWidth;
    var height = video.videoHeight;
    //---
//        video.style.width = width + 'px';
//        video.style.height = height + 'px';


    video.style.width = canvas.width + 'px'; // ������ �����-��� �� ������� canvas
    video.style.height = canvas.height + 'px';

    var picture_width, picture_height;

    picture_width = canvas.width;
    picture_height = height*picture_width/width;

    if(picture_height > canvas.height){
        picture_width = picture_width*canvas.height/picture_height;
        picture_height = canvas.height;
    }


    var context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, picture_width, picture_height);

    //---
    save_button.disabled = false;

    this_colored(this);

// ������� ������� �����
    video.style.width = canvas.width/5 + 'px';
    video.style.height = canvas.height/5 + 'px';
    video.style.boxShadow = '0px 0px 15px 25px rgba(142, 159, 74, 0.67)';

    alert('������ ������� ������! \n������ �� ������ ��������� ��� �� ����� ���������� \n\n��� \n\n��������� ������ � ����� ��������� ������ �� ����.');
}

/**
 * ������������ ������� ������� �� ������ ���������� �����������
 * �������� �������� ������ ����������� � ��������� �� �� ����
 */
function OnSaveButtonClick(){
    console.log('OnSaveButtonClick  �� ���������')
    return;
    saveAs(base64toblob(canvas.toDataURL('image/png').split(',')[1]), 'image_from_camera.png');
}
/**
 * ����������� ������ ����������� �� ������ Base64 � Blob ��� ���������� �� ����
 */
function base64toblob (base64){
    var utf8 = atob(base64),
        array = [];
    //---
    for(var i = 0, j = utf8.length; i < j; i++)
        array.push(utf8.charCodeAt(i));
    //---
    return(new Blob([new Uint8Array(array)], {type: 'image/png'}));
}


function stop_stream(stream) {
    // re-add the stop function
    if(!stream.stop && stream.getTracks) {
        stream.stop = function(){
            this.getTracks().forEach(function (track) {
                track.stop();
            });
        };
    }
}


// ������� ���������, �������������� �� ��������� ������ Promise
function Promise_check() {
    if((typeof Promise !== "undefined") && Promise.toString().indexOf("[native code]") !== -1){
        return true;
    }else {
        return false;
    }
}