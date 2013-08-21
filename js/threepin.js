var ThreePin = (function(){
	var $doc	= document,
		$addressField,
		$portField,
		$connectBtn,
		socket,
		url,
		port,
		connect,
		status,
		$sectionStatus,
		DEBUG	= true,
		STATUS	= {
			CONNECTING		: 1,
			CONNECTED		: 2,
			DISCONNECTED	: 0
		};

	function log(arg){
		if ( DEBUG ){
			console.log( arg );
		}
	}

	function init(){
		$addressField	= $doc.querySelector('#conf-url');
		$portField		= $doc.querySelector('#conf-port');
		$connectBtn		= $doc.querySelector('#conf button');

		if ( $connectBtn.addEventListener ){
			$connectBtn.addEventListener( 'click' , initSocket , false );
		} else if (el.attachEvent){
			$connectBtn.attachEvent( 'onclick' , initSocket );
		}

	}

	function initSocket(){
		var connectionString;

		socketStatusHandler( STATUS.CONNECTING );

		// store address ad port value
		url		= $addressField.value;
		port	= $portField.value;

		// build connection string
		connectionString = url+":"+port;

		// connect and bind events
		socket = io.connect( connectionString);
		socket.on('connect', function () {
			socketStatusHandler( STATUS.CONNECTED );
		});

		socket.on('disconnect', function () {
			socketStatusHandler( STATUS.DISCONNECTED );
		});
	}

	// TO-DO : usare classList per modificare status ui. funzione o parte o all'interno dell'handler?
	function socketStatusHandler( status ){
		switch( status ){

			case STATUS.CONNECTED :
				log( 'Connection to: '+connectionString );

			break;

			case STATUS.CONNECTING :
				log( 'Connection to: '+connectionString );

			break;

			case STATUS.DISCONNECTED :
				log( 'Disconnected from: '+connectionString );
			break;

		}
	}

	init();

})();
