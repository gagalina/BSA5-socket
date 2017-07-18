(() => {
    const sendButton = document.getElementById('sendButton');
    const field = document.getElementById('field');
    const messageHistory = document.querySelector('.messageHistory');
    const name = document.getElementById('nameInput');
    const nickName = document.getElementById('nickNameInput');
    const userBtn = document.querySelector('.userBtn');
    const nameFiled = document.querySelector('.nameFiled');
    const modalWindow = document.getElementById('myModal');
    const users = document.getElementById('users');


    const socket = io('http://localhost:8080');

    let messages = [];
    let user = {};

    userBtn.onclick = () => {
        user = {
            userName:name.value,
            userNickName:nickName.value,
            status:"just appeared"
        };
        socket.emit('new user', user);
        name.value = '';
        nickName.value = '';
        modalWindow.style.display = "none";
    };


    socket.on('message', (data) => {
        if (data.message && data.sender) {
            messageHistory.innerText = '';
            messages.push(data);
            messages.map((el) => {
                let itemMessage = document.createElement("div");
                itemMessage.classList.add('well');
                itemMessage.innerText = el.sender.userNickName +" - "+ el.message;
                messageHistory.appendChild(itemMessage);
            });
        }
    });

    sendButton.onclick = (e) => {
        e.preventDefault();
        let text = field.value;
        socket.emit('send', {message: text, sender:user});
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


})();