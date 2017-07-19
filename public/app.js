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

    userBtn.onclick = () => {
        user = {
            userName:name.value,
            userNickName:nickName.value,
            status:"just appeared",
            isTyping: false
        };
        socket.emit('new user', user);
        name.value = '';
        nickName.value = '';
        modalWindow.style.display = "none";
    };


    socket.on('messageHistory', (data) => {
            messageHistory.innerText = '';
            messageHistory.innerHTML='';
            data.map((el) => {
                let itemMessage = document.createElement("div");
                if (checkForReceiver(el.message) === true){
                    itemMessage.classList.add("special");
                }
                itemMessage.classList.add('well');
                itemMessage.innerText = el.sender.userNickName +" - "+ el.message;
                messageHistory.appendChild(itemMessage);
            });
    });

    sendButton.onclick = (e) => {
        e.preventDefault();
        let text = field.value;
        socket.emit('send', {message: text, sender:user});
        field.value = '';
    };

    socket.on('get users', (data) => {
        users.innerText = '';
        data.map((el) => {
            let itemMessage = document.createElement("li");
            itemMessage.classList.add('list-group-item');
            itemMessage.innerText = el.userName +" "+ el.userNickName +" " + el.status;
            users.appendChild(itemMessage);
        });
    });

    socket.on('change to online', (data) => {
        console.log(data.status);
    });

    window.onbeforeunload = () => {
        socket.emit('change to offline', user);

    };


    // field.addEventListener('focus', () => {
    //     let typing = Object.assign({}, user, {isTyping:true});
    //     socket.emit('user is typing', typing);
    // });
    //
    // field.addEventListener('blur', () => {
    //     let typing = Object.assign({}, user, {isTyping:false});
    //     socket.emit('user is typing', typing);
    //
    // });

    const checkForReceiver = (item) => {
        let splittedMessage = item.split(" ");
        let receiver = splittedMessage.filter((item) => {
            return item.startsWith("@");
        });
        return !!receiver.length>0;
    };

})();