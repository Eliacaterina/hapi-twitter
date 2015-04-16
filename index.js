var Hapi = require('hapi');
var server = new Hapi.Server();

server.connection({
	host: '0.0.0.0',
	port: process.env.PORT || 3000, //what is process.env.PORT? It's an environment variable prepared by HEroku Deployment
	routes: {
		cors: true
	}
});


//this is where you include dependencies
var plugins = [
	
	{ register: require('./routes/sessions.js') }, //to make this happen in users. js we have to do line 4. same in sessions.js
	{ register: require('./routes/users.js') },
	{ 
		register: require('hapi-mongodb'),
		options: {
			"url": "mongodb://127.0.0.1:27017/hapi-twitter",
			"settings": {
				"db": {
					"native_parser": false
				}
			}
		}
	},
	{
		register: require('yar'),
		options: {
			cookieOptions: {
				password: 'password',
				isSecure: false //you can use it without HTTPS
			}
		}
	}
];


server.register(plugins, function(err) { ///server please recognize the plugins that we have defined in line 12. 
	if (err) {
		throw err; 
	}

	server.start(function() {
		console.log('info', 'Server running at:' + server.info.uri);
	});
});