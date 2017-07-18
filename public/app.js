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
        let typingUsers = [];
        data.map((el) => {
            console.log(el);
            if (el.isTyping){
                typingUsers.push(el.userNickName);
            }
            if(typingUsers.length !== 0){
                userIsTyping.innerText = typingUsers.join(',') + ' is typing...';
                while (typingUsers.length) {
                    typingUsers.pop();
                }
            }
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


    field.addEventListener('focus', () => {
        let typing = Object.assign({}, user, {isTyping:true});
        socket.emit('user is typing', typing);
    });

    field.addEventListener('blur', () => {
        let typing = Object.assign({}, user, {isTyping:false});
        socket.emit('user is typing', typing);

    });

    const renderUsers = () => {
        if (users.length !== 0) {
            userIsTyping.innerText = '';
            let typingUsers = [];
            users.map((el) => {
                if (el.isTyping === "true"){
                    typingUsers.push(el.user);
                }
            });
            if(typingUsers.length !== 0){
                //let index = typingUsers.indexOf(userName.innerText);
                //typingUsers.splice(index,1);
                userIsTyping.innerText = typingUsers.join(',') + ' is typing...';
                while (typingUsers.length) {
                    typingUsers.pop();
                }
            }
        }
    };

})();