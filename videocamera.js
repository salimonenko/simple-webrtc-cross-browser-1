/* <!--   ВИДЕОКАМЕРА   --> */

/**
 * @author as3coder
 * @author Salimonenko_D.A.
 */

var localMediaStream = null;
var flag_camera = false;

function cam(what_to_do){
    var take_button =  document.getElementById('take_button'); // +++
    var save_button =  document.getElementById('save_button'); // +++

// Определяем наличие медийных данных пользователя. Переопределяем метод получения данных для разных браузеров
    navigator.getUserMedia = ( navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia);


    if((!navigator.getUserMedia) && (!navigator.mediaDevices)){ // Если нет возможности получить медийные данные, показываем соответствующее сообщение и прекратим работу
        if((!navigator.getUserMedia)){
            try {
                console.log('My message: navigator.getUserMedia='+navigator.getUserMedia);
//                alert('navigator.getUserMedia='+navigator.getUserMedia);
            }catch (er){
                alert('Ошибка VIDEO: ' + er.name + ":" + er.message + "\n" + er.stack);
            }
        }
        if(!navigator.mediaDevices){
            try {
                console.log('My message: navigator.mediaDevices='+navigator.mediaDevices);
//                alert('navigator.mediaDevices='+navigator.mediaDevices);
            }catch (er){
                alert('Ошибка VIDEO: ' + er.name + ":" + er.message + "\n" + er.stack);
            }
        }
        alert('К сожалению, невозможно подключить видеокамеру: Ваш браузер не поддерживает ни метод navigator.getUserMedia, ни метод navigator.mediaDevices\n\n Скорее всего, потому, что браузер блокирует этот метод при работе сайта по протоколу НТТР, требуя протокол HTTPS. Чтобы подключиться к видеочату, Вы можете установить браузер более ранней версии. Например, Firefox 24...60, Chrome до 47...48 версии, Edge до... не знаю, какой версии, но современный Edge 81 точно снимок сделать не даст. То же самое с safari.\n Или можно попробовать открыть эту страницу по протоколу HTTPS. ');
//        take_button.disabled = true;
        return;
    }

    var video = document.getElementById("my-video");
    video.crossOrigin = "anonymous"; // Убрать? +++

    var navigat; // Флаг для выбора того или иного режима подключения видео в зависимости от поддержки свойств mediaDevices или getUserMedia

    if ((navigator.mediaDevices) && Promise_check()) { // Для более новых браузеров и если браузером поддерживается объект Promise
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
                    alert('К сожалению, Ваш браузер на подерживает свойство navigator.getUserMedia. Подключение камеры невозможно.');
                    return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
                }
                // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
                return new Promise(function (resolve, reject) {
                    getUserMedia.call(navigator, constraints, resolve, reject);
                });
            }
        }
        navigat = 'mediaDevices'; // Итак, если поддерживается navigator.mediaDevices и объект Promise
    } else if(navigator.getUserMedia) { // Для более старых браузеров или если не поддерживается объект Promise

        navigat = 'getUserMedia';


    }else {// Если не поддерживаются ни navigator.getUserMedia, ни navigator.mediaDevices вместе с объектом Promise
        alert('К сожалению, невозможно подключить видеокамеру: Ваш браузер не поддерживает ни метод navigator.getUserMedia, ни метод navigator.mediaDevices\n\n Скорее всего, потому, что браузер блокирует этот метод при работе сайта по протоколу НТТР, требуя протокол HTTPS. Чтобы начать работу с видеочатом, Вы можете установить браузер более ранней версии. Например, Firefox 24...67, Chrome до 47...48 версии, Edge до... не знаю, какой версии, но, например, Edge 81 точно снимок сделать не даст. То же самое с safari.\n Или Вы можете попытаться открыть эту страницу по протоколу HTTPS. ');
        take_button.disabled = true;
        return;
    }

    if(!flag_camera){// Если камера еще не была подключена
        show_video_from_CAM(take_button, save_button, video, navigat, what_to_do); // Включаем показ видео от камеры
    }
}

function show_video_from_CAM(take_button, save_button, video, navigat, what_to_do){// Функция включает показ видео от камеры
    var error_camera = true;
    var error_connection = true;

    if(navigat === 'getUserMedia'){

        navigator.getUserMedia({ video : true, audio: true },
// Обрабатываем событие успешного получения данных. Задаем полученый поток видео элементу
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

                    flag_camera = true; // Флаг (признак подключения камеры)
                    localMediaStream = stream; // Сохраняем, чтобы потом была возможность отключить камеру
                    //---
                    take_button.addEventListener('click', OnTakeButtonClick);
                    save_button.addEventListener('click', OnSaveButtonClick);
                    video.play(); // Любопытно, но для FF24 видео показывается и без этой строчки. А в FF36 эта строчка требуется

                try{
                    startConnection(stream, what_to_do);
                }catch (er){
                    console.log('Этот браузер не может создать соединение через WebRTC: \n' + er);
                    alert('Ошибка: невозможно создать соединение.');
                }
            },
            function (){// Обрабатываем событие отказа при получении данных
                alert('Похоже, видеокамера занята другим приложением или не подключена к компьютеру. Для использования видеокамеры на этой странице вначале следует прекратить ее использование в другом приложении.');
//      take_button.disabled = true;
            });
        return;
    }

    if(navigat === 'mediaDevices'){ // Если браузером поддерживаются navigator.mediaDevices и объект Promise

        navigator.mediaDevices.getUserMedia({video: true, audio: true })
            .then(function(stream) {
//                var video = document.querySelector('video');

                flag_camera = true; // Флаг (признак подключения камеры)

                localMediaStream = stream; // Сохраняем, чтобы потом была возможность отключить камеру
                //---
                take_button.addEventListener('click', OnTakeButtonClick);
                save_button.addEventListener('click', OnSaveButtonClick);

//                document.getElementById('CanvasContainer').getElementsByTagName('div')[0].style.display = 'block'; // Показываем тег div с тегом video
                // Older browsers may not have srcObject
                if ("srcObject" in video) {
                    video.srcObject = stream;
                } else {
                    // Avoid using this in new browsers, as it is going away.
                    video.src = window.URL.createObjectURL(stream);
                }

                if('onloadedmetadata' in this){ // Если событие onloadedmetadata поддерживается браузером, то используем его
                    video.onloadedmetadata = function(e) {
                        video.play();
                    };
                }else { // Если не поддерживается, то пытаемся обойтись без него
                    video.play();
                }
            error_camera = false; // Если не случилось ошибок при работе с камерой

                startConnection(stream, what_to_do); // Для еще более новых браузеров
                console.log('Данные для ответа на запрос на установление соединения успешно получены. ');
            error_connection = false;

            })
            .catch(function(err) {
                console.log(err.name + ": " +  err.message + ' '+ '. Невозможно подключить видеокамеру и/или микрофон');

                if(err.name === 'SourceUnavailableError'){ // Если камера и/или микрофон - заняты
                    alert("Возможно, вебкамера не подключена к Вашему компьютеру или занята другим приложением. Проверьте, пожалуйста, вебкамеру и после этого повторите попытку ее использования на этой странице.")
                }else { // Если другая ошибка

                    var alert_mes = '';
                    if(error_camera){
                        alert_mes += "При работе с вебкамерой и/или микрофоном произошла ошибка браузера. Соединение невозможно.\n";
                    }
                    if(error_connection){
                        alert_mes += "Возникла ошибка при попытке WebRTC-соединения. Попробуйте обновить страницу и повторить попытку соединения.";
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

// Определяем наличие медийных данных пользователя. Переопределяем метод получения данных для разных браузеров
    navigator.getUserMedia = ( navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia ||
    navigator.mediaDevices.getUserMedia);

    navigator.getUserMedia({ video : true, audio: true },
        /**
         * Обрабатываем событие успешного получения данных
         * Задаем полученый поток видео элементу
         */
        function (stream){
//            window.URL.createObjectURL = window.URL.createObjectURL || window.URL.webkitCreateObjectURL || window.URL.mozCreateObjectURL || window.URL.msCreateObjectURL;
            stop_str(stream);
        },
        /**
         * Обрабатываем событие отказа при получении данных
         * Покажем соответствующее сообщение
         */
        function (stream){
            stop_str(stream);
        });

    function stop_str(stream) {
        var video = document.getElementById("my-video");
        video.pause(); // Останавливаем показ видео
        video.src="";

//        document.getElementById('CanvasContainer').getElementsByTagName('div')[0].style.display = 'none'; // Скрываем тег div с тегом video

//            localMediaStream = null;


        try{ // Вначале пытаемся отключить камеру старым способом
            try {
                localMediaStream.stop();
                flag_camera = false;
            }
            catch (er){console.log('My message: Не сработал localMediaStream.stop()');}
            try {
                MediaStreamTrack.stop();
                flag_camera = false;
            }
            catch(er) {console.log('My message: Не сработал MediaStreamTrack.stop()');}

            try {
                stream.stop();
                flag_camera = false;
            } // старый способ остановки камеры
            catch (er){console.log('My message: Не сработал stream.stop()');}

            try {
                stop_stream(stream);
                stop_stream(localMediaStream);
                flag_camera = false;
            }
            catch(er){console.log('My message: Не сработала функция stop_stream()');}

            if(!flag_camera){
                alert('Видеокамера отключена от этой веб-страницы.');
                flag_camera = false;
            }else {
                alert('Не получилось отключить видеокамеру от этой веб-страницы. Как вариант, для ее отключения попробуйте обновить эту страницу.');
            }
        }
        catch(er){
            alert('Ошибка! Не получилось отключить видеокамеру от этой вебстраницы. Для ее отключения попробуйте обновить эту страницу.');
        }


        var take_button = document.getElementById('take_button');
        var save_button = document.getElementById('save_button');
        take_button.removeEventListener("click", OnTakeButtonClick);
        save_button.removeEventListener("click", OnSaveButtonClick);
    }

}




/**
 * Обрабатываем событие нажатия на кнопку снимка
 * Отрисовываем на графическом элементе canvas содержимое элемента video
 */
function OnTakeButtonClick (){
    console.log('OnTakeButtonClick  не подключен')
    return;

    var video = document.getElementById('video');
    var width = video.videoWidth;
    var height = video.videoHeight;
    //---
//        video.style.width = width + 'px';
//        video.style.height = height + 'px';


    video.style.width = canvas.width + 'px'; // Делаем видео-тег по размеру canvas
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

// Сжимаем область видео
    video.style.width = canvas.width/5 + 'px';
    video.style.height = canvas.height/5 + 'px';
    video.style.boxShadow = '0px 0px 15px 25px rgba(142, 159, 74, 0.67)';

    alert('Снимок успешно сделан! \nТеперь Вы можете сохранить его на своем компьютере \n\nили \n\nотключить камеру и затем загрузить снимок на сайт.');
}

/**
 * Обрабатываем событие нажатия на кнопку сохранения изображения
 * Получаем бинарные данные изображения и сохраняем их на диск
 */
function OnSaveButtonClick(){
    console.log('OnSaveButtonClick  не подключен')
    return;
    saveAs(base64toblob(canvas.toDataURL('image/png').split(',')[1]), 'image_from_camera.png');
}
/**
 * Преобразуем данные изображения из строки Base64 в Blob для сохранения на диск
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


// Функция проверяет, поддерживается ли браузером объект Promise
function Promise_check() {
    if((typeof Promise !== "undefined") && Promise.toString().indexOf("[native code]") !== -1){
        return true;
    }else {
        return false;
    }
}