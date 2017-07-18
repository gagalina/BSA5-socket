const express = require('express');
const path = require('path');
const app = express();
app.use(express.static('public'));

const server = require('http').Server(app);
const io = require('socket.io')(server);

let users =[];
let connections = [];


io.sockets.on('connection',(socket) => {
    connections.push(socket);
    console.log("Connected: %s sockets connected", connections.length);

    //Disconnect

    socket.on('disconnect', (data) => {
        updateUsernames();
        connections.splice(connections.indexOf(socket), 1);
        console.log("Connected: %s sockets connected", connections.length);
    });

    socket.emit('message', { message: 'welcome to the chat' });

    //Message

    socket.on('send', (socket) => {
        io.sockets.emit('message', socket);
    });

    //New user

    socket.on('new user', (socket) => {
        users.push(socket);
        updateUsernames();
        setTimeout(() => { changeStatus(socket) }, 3000);
    });

    const updateUsernames = () => {
        io.sockets.emit('get users', users);

    };


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
});


let port = 8080;

server.listen(port, () => {
    console.log("server is listening to port " + port);
});

