var io = require('socket.io')();

io.on('connection', function(socket){
  console.log(socket.id);
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
  });
});


module.exports = io;