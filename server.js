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

    let newUser ={
        socket_id: socket.id
    };

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
        let user = Object.assign({}, socket, newUser);

        if(users.length !== 0){
            let wrongUsers =users.filter((item) => {
                return item.userNickName === user.userNickName;
            });
            if(wrongUsers.length === 0){
                io.sockets.emit('validation', true);
                users.push(user);
                updateUsernames();
                setTimeout(() => { changeStatus(socket) }, 60000);

            }else{
                io.sockets.emit('validation', false)

            }
        }else{
            io.sockets.emit('validation', true);
            users.push(user);
            updateUsernames();
            setTimeout(() => { changeStatus(socket) }, 60000);

        }

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

    //Send to specific client
    socket.on('send to specific client', (data) => {
        let receiver_id = '';
        users.map((item) => {
            if(item.userNickName === data.receiver){
                if(!item.socket_id) {
                    console.log('\n\nitem', item);
                    console.log('\n\nusers', users);
                }
                receiver_id = item.socket_id;
                console.log('receiver_id: ', receiver_id);
                console.log('data', data);
                io.sockets.connected[receiver_id].emit('messageHistory', [{
                    sender: item, message: data.message
                }]);
                //socket.broadcast.to(receiver_id).emit('send', 'for your eyes only');
            }
        })
    });
});


let port = 8080;

server.listen(port, () => {
    console.log("server is listening to port " + port);
});

