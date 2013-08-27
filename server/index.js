var io = require('socket.io').listen(5454);

io.sockets.on('connection', function (socket) {
	console.log( 'connection' );
  //socket.emit('news', { hello: 'world' });

  // event listen
  socket.on( 'eventEmit1' , function(data){
	console.log( '*******************' );
	console.log( 'eventEmit1 received' );
	console.log( data );
	console.log( '*******************' );
  });

  socket.on( 'eventEmit2' , function(data){
	console.log( '*******************' );
	console.log( 'eventEmit2 received' );
	console.log( data );
	console.log( '*******************' );
  });

});
