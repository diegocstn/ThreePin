var io = require('socket.io').listen(5454);

io.sockets.on('connection', function (socket) {
	console.log( 'connection' );
  //socket.emit('news', { hello: 'world' });
});
