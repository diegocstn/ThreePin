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
		$statusSection,
		DEBUG	= true,
		STATUS	= {
			CONNECTING		: 1,
			CONNECTED		: 2,
			DISCONNECTED	: 0
		},
		STATUS_LOOKUP = ['disconnected','connecting','connected'];

	function log(arg){
		if ( DEBUG ){
			console.log( arg );
		}
	}

	function init(){
		$addressField	= $doc.querySelector( '#conf-url' );
		$portField		= $doc.querySelector( '#conf-port' );
		$connectBtn		= $doc.querySelector( '#conf button' );
		$statusSection	= $doc.querySelector( '#status' );

		if ( $connectBtn.addEventListener ){
			$connectBtn.addEventListener( 'click' , initSocket , false );
		} else if (el.attachEvent){
			$connectBtn.attachEvent( 'onclick' , initSocket );
		}

		// init status
		status = STATUS.DISCONNECTED;

	}

	function initSocket(){
		var connectionString;

		// store address ad port value
		url		= $addressField.value;
		port	= $portField.value;

		// build connection string
		connectionString = url+":"+port;

		socketStatusHandler( STATUS.CONNECTING );

		// connect and bind events
		socket = io.connect( connectionString );
		socket.on('connect', function () {
			socketStatusHandler( STATUS.CONNECTED );
		});

		socket.on('disconnect', function () {
			socketStatusHandler( STATUS.DISCONNECTED );
		});
	}

	// TO-DO : usare classList per modificare status ui. funzione o parte o all'interno dell'handler?
	function socketStatusHandler( newStatus ){
		var connectionString = url+":"+port;

		switch( newStatus ){

			case STATUS.CONNECTED :
				log( 'Connection to: '+connectionString );
				socketStatusUpdate( STATUS.CONNECTED );
			break;

			case STATUS.CONNECTING :
				log( 'Connecting to: '+connectionString );
				socketStatusUpdate( STATUS.CONNECTING );
			break;

			case STATUS.DISCONNECTED :
				log( 'Disconnected from: '+connectionString );
				socketStatusUpdate( STATUS.DISCONNECTED );
			break;

		}
	}

	function socketStatusUpdate( newStatus ){

		$statusSection.classList.remove( STATUS_LOOKUP[status] );
		$statusSection.classList.add( STATUS_LOOKUP[newStatus] );
		status = newStatus;
	}

	init();

})();
