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
		eventsToEmit,
		eventsToListen,
		$console,
		$statusSection,
		$eventsEmitList,
		$eventsListenList,
		STATUS	= {
			CONNECTING		: 1,
			CONNECTED			: 2,
			DISCONNECTED	: 0
		},
		STATUS_LOOKUP = ['disconnected','connecting','connected'],
		ERRORS_ENUM		= {
			CONFIG_NOTFOUND : "Configuration file not found",
			CONFIG_ERROR		: "Configuration error "
		};

	/**
	* Logger Wrapper
	*
	* @method log
	* @param {Object} arg Object to log with console.log
	*/

	function log(arg){
		var	line	= $doc.createElement( 'p' ),
				date	= $doc.createElement( 'time' ),
				txt		= $doc.createElement( 'span' );

		date.innerHTML	= renderDate( new Date() );
		txt.innerHTML		= arg;

		line.appendChild( date );
		line.appendChild( txt );

		$console.appendChild( line );

		// scroll to the last line if is needed
		if( $console.scrollHeight > $console.clientHeight ){
			$console.scrollTop = $console.scrollHeight;
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
				log( 'Config file threeping.json not found' );
				throwError( ERRORS_ENUM.CONFIG_NOTFOUND );
			}

			if( xhr.readyState === 4 ){
				conf = JSON.parse( xhr.response );
				log( 'Config loaded' );
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
		$addressField			= $doc.querySelector( '#conf-url' );
		$portField				= $doc.querySelector( '#conf-port' );
		$connectBtn				= $doc.querySelector( '#conf button' );
		$statusSection		= $doc.querySelector( '#status' );
		$eventsEmitList		= $doc.querySelector( '.event-emit-list' );
		$eventsListenList	= $doc.querySelector( '.event-listen-list' );
		$console					= $doc.querySelector( '#console' );

		if ( $connectBtn.addEventListener ){
			$connectBtn.addEventListener( 'click' , buttonConnectHandler , false );
		} else if ($connectBtn.attachEvent){
			$connectBtn.attachEvent( 'onclick' , buttonConnectHandler );
		}

		log( '**** ThreePin Console ****' );

		// init status
		status = STATUS.DISCONNECTED;

		// init events storage
		eventsToEmit	= [];
		eventsToListen	= [];

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
		if( conf.serverPort ){
			$portField.innerHTML = conf.serverPort;
		}

		if( conf.serverUrl ){
			$addressField.innerHTML = conf.serverUrl;
		}

		// build events emit list
		buildEventsEmit();

		// build events listen list
		buildEventsListen();

		log( 'System ready' );
	}

	/**
	* Build list of event to emit
	*
	* @method buildEventsEmit
	*
	*/
	function buildEventsEmit(){
		var frag = $doc.createDocumentFragment(),
			dt,dd,pre,btn,index = 0;
		conf.emit.map(function(e){
			// push event into the array of event to emit
			eventsToEmit.push({
				name	: e.name,
				data	: e.data
			});

			// build html
			dt	= $doc.createElement( 'dt' );
			dd	= $doc.createElement( 'dd' );
			pre	= $doc.createElement( 'pre');
			btn	= $doc.createElement( 'button' );

			dt.innerHTML	= e.name + ': ' + e.data.op;
			pre.innerHTML	= JSON.stringify(e.data,null, '\t');

			btn.innerHTML	= "Send";
			btn.classList.add( 'btn-event-emit' );
			btn.classList.add( 'btn' );
			btn.classList.add( 'btn-gray' );
			btn.setAttribute( 'data-evt' , index );

			dd.appendChild( pre );
			dt.appendChild(btn);

			frag.appendChild(dt);
			frag.appendChild(dd);

			index +=1;

		});

		$eventsEmitList.appendChild(frag);

		$eventsEmitList.addEventListener( 'click' , function(e){
			if( e.target.nodeName === "BUTTON" ){
				emitEvent( e.target.getAttribute('data-evt') );
			}

		});

	}

	/**
	* Build list of event to listen onto
	*
	* @method buildEventsListen
	*
	*/
	function buildEventsListen(){
		var frag = $doc.createDocumentFragment(),
			li;
		conf.listen.map(function(e){
			// push event into the array of event to emit
			eventsToListen.push({
				name	: e
			});

			// build html
			li = $doc.createElement('li');
			li.innerHTML = e;

			frag.appendChild( li );
		});

		$eventsListenList.appendChild( frag );
	}

	/**
	* Button actions handler
	*
	* @method buttonConnectHandler
	*
	*/

	function buttonConnectHandler(){
		if( status === STATUS.DISCONNECTED ){
			initSocket();
			$connectBtn.innerHTML = "Disconnect";
		}else{
			closeSocket();
			$connectBtn.innerHTML = "Connect";
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
		url		= $addressField.innerText;
		port	= $portField.innerText;

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

		socket.on('error',function(err){
			log( 'Connection error' );
			socketStatusUpdate( STATUS.DISCONNECTED );
			socket = null;
		});

		// listen on custom event
		for (var i = eventsToListen.length - 1; i >= 0; i--) {
			bindOnEvent( eventsToListen[i].name , function(data){
				receiveEvent( data );
			});
		}
	}

	/**
	* Close current socket
	*
	* @method closeSocket
	*
	*/
	function closeSocket(){
		socket.disconnect();
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
				// TO-DO : force disconnect to avoid js error in console
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

	/**
	* Emit specific event
	*
	* @method emitEvent
	* @param {Int} eventIndex event index
	*
	*/

	function emitEvent( eventIndex ){
		// emit event only if there's a socket opened
		if( status === STATUS.CONNECTED ){
			var evt = eventsToEmit[eventIndex];
			if( evt.data ){
				socket.emit( evt.name , evt.data );
			}else{
				socket.emit( evt.name );
			}
			log( 'Emit event : ' + evt.name );
		}else{
			log( 'Nothing to do here my friend!' );
		}
	}


	/**
	* Bind on specific listen event
	*
	* @method bindOnEvent
	* @param {String} eventName event name
	* @param {Function} fn callback function
	*
	*/

	function bindOnEvent( eventName , fn ){
		socket.on( eventName , function( eventData ){
			log( 'Received event : ' + eventName );
			fn( eventData );
		});
	}

	/**
	* Receive data for specifically event and display in console
	*
	* @method emitEvent
	* @param {Object} eventData event data
	*
	*/
	function receiveEvent( eventData ){
		log( 'Data :' + JSON.stringify(eventData,null, '\t') );
	}

	/**
	* Helper fun to render date in a human readable format
	*
	* @method renderDate
	* @param {Date} date Date Object to render
	* @return {String} string representation of the date obj
	*
	*/
	function renderDate( date ){
		var d = (date.getFullYear()) + '/' + (date.getMonth()+1) + '/' + date.getDate(),
				t = '['+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()+']';
		return d+'\t'+t+'\t';
	}

	/**
	* Helper function to throws errors
	*
	* @method throwError
	* @param {String} errorType Error type
	* @param {String} customMessage specific error message
	*
	*/
	function throwError( errorType , customMessage ){
		var errMessage = '[ ThreePinJs ] ';
		errMessage += ( customMessage ) ? errorType + customMessage : errorType;
		throw new Error( errMessage );
	}


	init();

	return{
		log			: log,
		listen	: eventsToListen,
		emit		: eventsToEmit
	};

})();
