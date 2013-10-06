ThreePinJS
========

A Socket.IO stress-free test environment

## What and why
ThreePinJS as a stress-free test environment for socket.io allow you to test your websocket server code before you write the client code or on-the-job.

## Install
### Github
```
git clone https://github.com/dieguitoweb/ThreePin.git threepin
```

### NPM
```
npm install threepin
```

### Bower
```
bower install threepin
```

## Configuration
ThreePinJS configuration is based on threepin.json file, placed within the main folder.
A configuration file it's composed of 3 main section: server address and port, events to emit and events to listen onto.

#### Server
Define server address and port to which connect to
```
"serverUrl"		: "http://127.0.0.1",
"serverPort"	: 5454,
```
#### Events
Define an array of events on wich to listen for
```
"listen"	: [ "eventOn1" , "eventOn2" ],
```

Define an array of events to emit to the server, each one with its data to send
```
"emit"		: [
					{
						"name"	: "eventEmit1",
						"data"	: {
							"key1-1" : "param1-1",
							"key1-2" : "param1-2",
							"key1-3" : "param1-3"
						}
					}
]

```

This is a full example of configuration file
```
{
	"serverUrl"		: "http://127.0.0.1",
	"serverPort"	: 5454,
	"listen"	: [ "eventOn1" , "eventOn2" ],
	"emit"		: [
					{
						"name"	: "eventEmit1",
						"data"	: {
							"key1-1" : "param1-1",
							"key1-2" : "param1-2",
							"key1-3" : "param1-3"
						}
					},
					{
						"name"	: "eventEmit2",
						"data"	: {
							"key2-1" : "param2-1",
							"key2-2" : "param2-2",
							"key2-3" : "param2-3"
						}
					},
					{
						"name"	: "eventEmit3",
						"data"	: {
							"key3-1" : "param3-1",
							"key3-2" : "param3-2",
							"key3-3" : "param3-3"
						}
					}
	]
}

```
## Usage
1. Install ThreepinJS
2. Fill the configuration file with your events and data
2. Fire up a local server ( [SimpleHTTPServer](http://docs.python.org/2/library/simplehttpserver.html) is awesome for me ) and load the index.html on your favourite browser
3. Debug and enjoy
