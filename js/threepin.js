/* global io */

var ThreePin = (function(){
	var $doc	= document,
		$addressField,
		$portField,
		$connectBtn,
		socket,
		url,
		port,
		status,
		conf,
		$statusSection,
		DEBUG	= true,
		STATUS	= {
			CONNECTING		: 1,
			CONNECTED		: 2,
			DISCONNECTED	: 0
		},
		STATUS_LOOKUP = ['disconnected','connecting','connected'];

	/**
	* Logger Wrapper
	*
	* @method log
	* @param {Object} arg Object to log with console.log
	*/

	function log(arg){
		if ( DEBUG ){
			console.log( arg );
		}
	}

	/**
	* Load configuration file( threepin.json )
	*
	* @method loadConfig
	*
	*/
	function loadConfig(){
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(){
			if( xhr.readyState < 4 ){
				return;
			}

			if( xhr.status !== 200 ){
				throw new Error('ThreePin.js : configuration file not found');
			}

			if( xhr.readyState === 4 ){
				conf = JSON.parse( xhr.response );
				initAsync();
			}
		};

		xhr.open('GET', './threepin.json', true);
		xhr.send('');
	}

	/**
	* ThreePin initializer, cache selectors and add event listeners
	*
	* @method init
	*
	*/
	function init(){
		$addressField	= $doc.querySelector( '#conf-url' );
		$portField		= $doc.querySelector( '#conf-port' );
		$connectBtn		= $doc.querySelector( '#conf button' );
		$statusSection	= $doc.querySelector( '#status' );

		if ( $connectBtn.addEventListener ){
			$connectBtn.addEventListener( 'click' , initSocket , false );
		} else if ($connectBtn.attachEvent){
			$connectBtn.attachEvent( 'onclick' , initSocket );
		}

		// init status
		status = STATUS.DISCONNECTED;

		// load configuration file
		loadConfig();

	}

	/**
	* Initializer method, invocked when the configuration file is loaded
	*
	* @method initAsync
	*
	*/
	function initAsync(){
		// set-up port and url if are present in the configuration file
		if( conf.serverPort ){
			$portField.setAttribute( 'value' , conf.serverPort );
		}

		if( conf.serverUrl ){
			$addressField.setAttribute( 'value' , conf.serverUrl );
		}
	}


	/**
	* Init a new socket and bind basic listener on it
	*
	* @method init
	*
	*/
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

	/**
	* Socket status handler
	*
	* @method socketStatusHandler
	* @param {Int} newStatus new status value
	*
	*/
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

	/**
	* Update the socket status and relative UI
	*
	* @method socketStatusUpdate
	* @param {Int} newStatus new status value
	*
	*/
	function socketStatusUpdate( newStatus ){

		$statusSection.classList.remove( STATUS_LOOKUP[status] );
		$statusSection.classList.add( STATUS_LOOKUP[newStatus] );
		status = newStatus;
	}



	init();

})();
