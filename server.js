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

    socket.on('disconnect', (data) => {
        connections.splice(connections.indexOf(data), 1);
        console.log("Connected: %s sockets connected", connections.length);
    });

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

