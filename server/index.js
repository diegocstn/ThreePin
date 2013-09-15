var io = require('socket.io').listen(5454);

io.sockets.on('connection', function (socket) {

	console.log( 'connection' );
  //socket.emit('news', { hello: 'world' });

  // event listen
  socket.on( 'eventEmit1' , function(data){
		console.log( 'eventEmit1 received' );
		setTimeout(function(){
			socket.emit( 'eventOn1' , { 'data' : 1 });
		},5000);
  });

  socket.on( 'eventEmit2' , function(data){
		console.log( 'eventEmit2 received' );
		setTimeout(function(){
			socket.emit( 'eventOn2' , { 'data' : 1213 });
		},5000);
  });

});
