const express = require('express');
const path = require('path');
const app = express();
app.use(express.static('public'));

const server = require('http').Server(app);
const io = require('socket.io')(server);

let users =[];


io.sockets.on('connection',(socket) => {
    console.log("new connection has been made");

    socket.emit('message', { message: 'welcome to the chat' });

    socket.on('send', (data) => {
        io.sockets.emit('message', data);
    });

    socket.emit('getUser', {user: 'User'});

    socket.on('authorization', (data) => {
        users.push(data);
        io.sockets.emit('getUser', data);
    });

});



let port = 8080;

server.listen(port, () => {
    console.log("server is listening to port " + port);
});

