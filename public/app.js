(() => {
    const content = document.querySelector('.content');
    const sendButton = document.querySelector('.sendButton');
    const field = document.querySelector('.field');
    const messageHistory = document.querySelector('.messageHistory');
    const name = document.getElementById('nameInput');
    const nickName = document.getElementById('nickNameInput');
    const userBtn = document.querySelector('.userBtn');
    const nameFiled = document.querySelector('.nameFiled');
    const socket = io('http://localhost:8080');

    let messages = [];
    let user = {};

    userBtn.onclick = () => {
        user = {
            userName:name.value,
            userNickName:nickName.value
        };
        socket.emit('authorization', user);
        name.value = '';
        nickName.value = '';
    };
    socket.on('getUser', (data) => {
        if(data.userNickName)
        nameFiled.innerText = data.userNickName;
    });

    socket.on('message', (data) => {
        if (data.message && data.sender) {
            nameFiled.innerText = data.sender.userNickName;
            messageHistory.innerText = '';
            messages.push(data);
            messages.map((el) => {
                let itemMessage = document.createElement("li");
                itemMessage.classList.add('itemMessage');
                itemMessage.innerText = el.sender.userNickName +" - "+ el.message;
                messageHistory.appendChild(itemMessage);
            });
        }
    });
    sendButton.onclick = () => {
        let text = field.value;
        socket.emit('send', {message: text, sender:user});
    };


})();