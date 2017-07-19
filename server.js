const express = require('express');
const path = require('path');
const app = express();
app.use(express.static('public'));

const server = require('http').Server(app);
const io = require('socket.io')(server);

let users =[];
let connections = [];
let messages = [];


io.sockets.on('connection',(socket) => {
    connections.push(socket);
    console.log("Connected: %s sockets connected", connections.length);

    //Disconnect

    socket.on('disconnect', (data) => {
        updateUsernames();
        connections.splice(connections.indexOf(socket), 1);
        console.log("Connected: %s sockets connected", connections.length);
    });


    //Message

    socket.on('send', (socket) => {
        if(messages.length >= 100){
            messages.shift();
        }
        messages.push(socket);
        io.sockets.emit('messageHistory', messages);

    });

    //New user

    socket.on('new user', (socket) => {
        users.push(socket);
        updateUsernames();
        setTimeout(() => { changeStatus(socket) }, 60000);
    });

    const updateUsernames = () => {
        io.sockets.emit('get users', users);

    };

    //Change status

    const changeStatus = (user) => {
        user.status = 'online';
        io.sockets.emit('change to online', user);
        updateUsernames();
    };

    socket.on('change to offline', (user) => {
        user.status = 'offline';
        let index = users.indexOf(user.userNickName);
        users.splice(index, 1, user);
        updateUsernames();

    });

    socket.on('is typing', (data) => {
        socket.broadcast.emit('typing', {nickname: data.userNickName});
    });

});


let port = 8080;

server.listen(port, () => {
    console.log("server is listening to port " + port);
});

