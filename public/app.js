(() => {
    const sendButton = document.getElementById('sendButton');
    const field = document.getElementById('field');
    const messageHistory = document.querySelector('.messageHistory');
    const name = document.getElementById('nameInput');
    const nickName = document.getElementById('nickNameInput');
    const userBtn = document.querySelector('.userBtn');
    const nameFiled = document.querySelector('.nameFiled');
    const userIsTyping = document.querySelector('.userIsTyping');
    const modalWindow = document.getElementById('myModal');
    const users = document.getElementById('users');



    const socket = io('http://localhost:8080');

    let user = {};

    //Log in

    userBtn.onclick = () => {
        user = {
            userName:name.value,
            userNickName:nickName.value,
            status:"just appeared",
        };

        socket.emit('new user', user);
        name.value = '';
        nickName.value = '';
        modalWindow.style.display = "none";
    };

    //View message history

    socket.on('messageHistory', (data) => {
            userIsTyping.innerText = '';
            messageHistory.innerText = '';
            data.map((el) => {
                let itemMessage = document.createElement("div");
                itemMessage.classList.add('well');
                itemMessage.innerText = el.sender.userNickName +" - "+ el.message;
                messageHistory.appendChild(itemMessage);
            });
    });

    //Send message with button

    sendButton.onclick = (e) => {
        e.preventDefault();
        let text = field.value;
        let receiver = checkForReceiver(text);
        console.log(receiver);
        if(receiver !== undefined){
            socket.emit('send to specific client', receiver)
        }
        socket.emit('send', {message: text, sender:user});
        field.value = '';


    };

    //List of items

    socket.on('get users', (data) => {
        users.innerText = '';
        data.map((el) => {
            let itemMessage = document.createElement("li");
            itemMessage.classList.add('list-group-item');
            itemMessage.innerText = el.userName +" "+ el.userNickName +" " + el.status;
            users.appendChild(itemMessage);
        });
    });

    //Change to online status

    socket.on('change to online', (data) => {
        console.log(data.status);
    });

    //Change to offline

    window.onbeforeunload = () => {
        socket.emit('change to offline', user);

    };

    //While typing

    field.addEventListener('keyup', (e) => {

        if (e.keyCode === 13)  {
            let text = field.value;
            socket.emit('send', {message: text, sender:user});
            field.value =''

        }
        else{
            socket.emit('is typing', user);
        }
    });

    socket.on('typing', (data) => {
        userIsTyping.innerHTML = '';
        if (data) {
            userIsTyping.innerHTML = data.nickname + ' is typing...';
        } else {
            userIsTyping.innerHTML = '';
        }
    });

    const checkForReceiver = (item) => {
        let splittedMessage = item.split(" ");
        let receiver = splittedMessage.filter((item) => {
            if (item.startsWith("@")){
                console.log(item);
                let res = item.substring(0,1);
                console.log(res);
                return res;
            };
        });

        return receiver;
    };



})();