//ТЕСТОВОЕ ЗАДАНИЕ АНТОН ШКУРДОВ

let promise = new Promise((resolve, reject) => {

    let http = new XMLHttpRequest();
    http.open("GET", "http://localhost:1337", true);
    http.onload = function (){
        let requestFromServer = JSON.parse(http.responseText);
        resolve(requestFromServer);
    }
    http.send(null);
});

promise
    .then(
        function (result){
            let roomsFromServer = result ;
            console.log (roomsFromServer);


            // выводим список комнат
            let rooms = document.getElementById('rooms');
            let roomsList = rooms.querySelector('.roomsList');

            displayRoomsList(roomsFromServer, rooms, roomsList);
            function displayRoomsList (roomsFromServer, rooms, roomsList){
                for (let roomFromServer  of roomsFromServer) {
                    let li = document.createElement('li');
                    roomsList.appendChild(li).innerHTML = roomFromServer.name;

                }
            }

            //Создаем макет комнаты и заполняем
            let app = document.getElementById('app');
            let field = app.querySelector('.field');

            //начальная модель, скорее для наглядности т.к. сразу перезаписывается на данные, которые присылает сервер
            let room =
                {
                    "name": "Hwa",
                    "width": 5,
                    "height": 3,
                    "data": [80, 13, 1, 81, 57, 43, 65, 24, 78, 44, 3, 1, 0, 21, 35]
                };


            room.name = roomsFromServer[0].name;
            room.width = roomsFromServer[0].width;
            room.height = roomsFromServer[0].height;
            room.data = roomsFromServer[0].data;

            console.log (room);
            console.log (room.name);

            let rowsNum = room.width;
            let colsNum =  room.height;
            let oldArray = room.data;
            let roomNames = room.name;

            let newArray = oldArray.slice();//копия массива для послледующего"нарезания"
            let data = newArray;
            let newArr = data;// вспомогательный массив, в который буду складывать подмассивы с числами, для последующего вывода по рядам в таблицу
            let incomingMessage = null;

            //Отлавливаем список комнат для перевхода


            let getAllLi = document.getElementsByTagName('li');
            for (let i = 0; i < getAllLi.length; i++) {
                getAllLi[i].addEventListener("click", changeRoom);
            }


            //отрисовка поля и заполнение его данными

            updateAndSplice(data);
            function updateAndSplice(curentdata) {
                newArr =[];//очищаем массив перед новой операцией
                for (let i = 0; i < curentdata.length; i++) {
                    newCurrentData = curentdata.splice(0, rowsNum);
                    newArr.push(newCurrentData);//отрезанный кусок основного массива пушим во вспомогательный массив newArr - будет массив массивов.
                }
                fillField(field, rowsNum, colsNum, newArr); // вызываем функцию fillField для отрисовки с новыми данными
            }



            function fillField(field, rowsNum, colsNum, newArr){

                field.innerHTML = '';// очищаем таблицу перед цилом отрисовки
                for (let i = 0; i < colsNum; i++){
                    let tr = document.createElement('tr');

                    for (let j = 0; j < rowsNum; j++) {

                        let td = document.createElement('td');
                        tr.appendChild(td);

                        if (newArr[i] == undefined) {
                            break;
                        } else {
                            tr.appendChild(td).innerHTML = newArr[i][j];
                            field.appendChild(tr);
                        }
                    }
                }

                    if (incomingMessage != undefined || incomingMessage != null) {
                        console.log('Вствляем в квадраты вот что:');
                        console.log(incomingMessage);
                        let tdArray = document.getElementsByTagName('td');// текущий список td на экране
                        for (let i = 0; i < tdArray.length; i++) {
                            for (let j = 0; j < incomingMessage.length; j++) {
                                if (i == incomingMessage[j][0]){
                                    tdArray[i].classList.add('active');
                                }
                            }
                        }
                    }
            }


            // работаем через вебсокеты для получения данных онлайн
            let status = document.querySelector("#status");
            let socket = new WebSocket('ws://localhost:1337');
            let objSubscribe = {
                "type":"SUBSCRIBE",
                "room":roomNames
            };
            let json = JSON.stringify(objSubscribe);

            socket.onclose = function(event) {
                if (event.wasClean) {
                    status.innerHTML = 'cоединение закрыто';
                } else {
                    status.innerHTML = 'соединения как-то закрыто';
                }
                status.innerHTML += '<br>код: ' + event.code + ' причина: ' + event.reason;
            };


            socket.onopen = function() {
                status.innerHTML = "Соединение установлено";
                console.log("Соединение установлено с сервером ws://localhost:1337");
            };

            // Connection opened
            socket.addEventListener('open', function (event) {
                console.log('На сервер localhost:1337 отправлены данные: ' + json );
                socket.send(json);
            });

            socket.onmessage = function(event) {
                incomingMessage = JSON.parse(event.data);
                console.log('С сервера localhost:1337 получен ответ: ' + event.data);
                if (incomingMessage[0] != undefined || incomingMessage[0] != null) {
                    numbersFromServer(incomingMessage);
                }

            };

            socket.onerror = function(event) {
                status.innerHTML = "ошибка " + event.message;
            };



            //помещаем новые значения с сервера и перерисовываем поле
            function numbersFromServer(incomingMessage) {
                for (let incoming of incomingMessage) {
                    oldArray[(incoming[0])] = incoming[1];
                }
                let newArray2 = oldArray.slice();
                updateAndSplice(newArray2);// вызываем функцию updateAndSplice(data) чтобы снова нарезать обновленный массив на подмассивы
            }



            function changeRoom(){

                for (getLi of getAllLi){
                    getLi.style.color = 'black';
                }

                roomStyle = this.style;
                roomStyle.color = 'blue';
                roomName = this.innerHTML;
                //отписываемся от текущей комнаты
                let message = {
                    "type":"UNSUBSCRIBE",
                    "room":roomNames
                };
                let messageForUnsubscribe = JSON.stringify(message);
                roomNames = roomName;//передаем новое название комнаты
                socket.send(messageForUnsubscribe);
                //alert('На сервер localhost:1337 отправлены данные: ' + messageForUnsubscribe );

                //Подписываемся на новую комнату

                for (let i = 0; i < roomsFromServer.length; i++){

                    if (roomsFromServer[i].name === roomName) {
                        rowsNum = roomsFromServer[i].width;
                        colsNum = roomsFromServer[i].height;
                        oldArray = roomsFromServer[i].data;
                    }
                }

                let messageForReSubscribe = {
                    "type":"SUBSCRIBE",
                    "room":roomName
                };

                let messageForSubscribe = JSON.stringify(messageForReSubscribe);
                //alert('На сервер localhost:1337 отправлены данные: ' + messageForSubscribe );
                socket.send(messageForSubscribe);

                let newArray2 = oldArray.slice();
                updateAndSplice(newArray2);// вызываем функцию updateAndSplice(data) чтобы сновы нарезать массив на подмассивы
            }





        }

    );


