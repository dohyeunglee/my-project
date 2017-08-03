let io = require('socket.io')();
let users = [];

io.on('connection', function(socket){
  console.log('New user connected');
  socket.on('disconnect', function() {
    console.log('User disconnected: ', socket, findIdWithSocket(socket.id));
    console.log('room?: ', findRoomWithUser(socket.id));
    io.to(findRoomWithUser(socket.id)).emit('disconnect', findIdWithSocket(socket.id));
    for(let i = 0 ; i < users.length ; i++) {
      if(users[i].socket === socket.id) {
        console.log('in disconnect user');
        users.splice(i,1);
        break;
      }
    }
    console.log('updated users: ', users);
  })
  socket.on('new_user', function(username, room) {
    console.log('room name: ', room);

      users.push({socket: socket.id, id: username, room: room});
      console.log('updated users: ', users);
      socket.join(room, () => {
        io.to(room).emit('joined', socket.id, username, findUsersWithRoom(room));
      })

  })


  socket.on('signaling', function(message) {
    console.log(message.type + ' message is sent from ' + message.name + ' to ' + message.target);
    socket.broadcast.to(getSocketFromId(message.target)).emit('signaling', message);
  })
});

function getSocketFromId(id) {
  let user = users.find(user => user.id === id);
  return user.socket;
}

function findUsersWithRoom(room) {
  let usersInRoom = [];
  for(let i = 0 ; i < users.length ; i++) {
    if(users[i].room === room) {
      console.log('find!');
      usersInRoom.push(users[i]);
    }
  }
  return usersInRoom;
}

function findIdWithSocket(socket) {
  let targetUser = users.find(target => target.socket === socket);
  console.log('find id: ', targetUser);
  return targetUser.id;
}
function findRoomWithUser(user) {
  console.log('user: ', findIdWithSocket(user));
  let targetUser = users.find(target => target.socket === user);
  console.log('find room!: ', targetUser);
  if(targetUser) {
    return targetUser.room;
  } else {
    console.log('error in room find');
  }
}

function duplicateUsername(username) {
  for(let i = 0 ; i < users.length ; i++) {
    if(users[i].id === username) {
      return true;
    }
  }
  return false;
}
module.exports= io;