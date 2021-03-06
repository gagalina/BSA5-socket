(() => {
    const sendButton = document.getElementById('sendButton');
    const field = document.getElementById('field');
    const messageHistory = document.querySelector('.messageHistory');
    const name = document.getElementById('nameInput');
    const nickName = document.getElementById('nickNameInput');
    const userBtn = document.querySelector('.userBtn');
    const nameFiled = document.querySelector('.nameFiled');
    const userIsTyping = document.querySelector('.userIsTyping');
    const validationField = document.querySelector('.validationField');
    const modalWindow = document.getElementById('myModal');
    const users = document.getElementById('users');


    const socket = io('http://localhost:8080');

    let user = {};

    //Log in

    userBtn.onclick = () => {
        user = {
            userName: name.value,
            userNickName: nickName.value,
            status: "just appeared",
        };
        socket.emit('new user', user);
        socket.on('validation', (data) => {
            if (data === true) {
                name.value = '';
                nickName.value = '';
                modalWindow.style.display = "none";
            } else {

                validationField.innerText = 'Wrong input';
            }
        });

    };

    //View message history

    socket.on('messageHistory', (data) => {
        console.log('messageHistory: ', data);
        userIsTyping.innerText = '';
        messageHistory.innerText = '';
        data.map((el) => {
            let itemMessage = document.createElement("div");
            itemMessage.classList.add('well');
            itemMessage.innerText = el.sender.userNickName + " - " + el.message;
            messageHistory.appendChild(itemMessage);
        });
    });

    //Send message with button

    sendButton.onclick = (e) => {
        e.preventDefault();
        let text = field.value;
        let receiver = checkForReceiver(text);
        console.log(receiver);
        if (receiver !== "") {
            socket.emit('send to specific client', {receiver: receiver, message: text})
            field.value = '';
            return;
        }

        socket.emit('send', {message: text, sender: user});
        field.value = '';

    };

    //List of items

    socket.on('get users', (data) => {
        users.innerText = '';
        data.map((el) => {
            let itemMessage = document.createElement("li");
            itemMessage.classList.add('list-group-item');
            itemMessage.innerText = el.userName + " " + el.userNickName + " " + el.status;
            users.appendChild(itemMessage);
        });
    });

    //Change to online status

    socket.on('change to online', (data) => {
        console.log('change to online: ', data.status);
    });

    //Change to offline

    window.onbeforeunload = () => {
        socket.emit('change to offline', user);

    };

    //While typing

    field.addEventListener('keyup', (e) => {

        if (e.keyCode === 13) {
            let text = field.value;
            socket.emit('send', {message: text, sender: user});
            field.value = ''

        }
        else {
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

    //check for the receiver

    const checkForReceiver = (item) => {
        let splittedMessage = item.split(" ");
        let res = '';
        splittedMessage.map((item) => {
            if (item.startsWith("@")) {
                res = item.substring(1, item.length);
            }
        });
        return res;
    };

    // validate form
    const validateForm = () => {
        if (name.value === "" || nickName.value === "") {
            userBtn.classList.add("disabled");
        } else {
            userBtn.classList.remove("disabled");
        }

    };

    name.onkeydown = validateForm;
    nickName.onkeydown = validateForm;

})();