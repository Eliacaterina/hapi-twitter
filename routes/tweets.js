var Joi = require('joi');
var Auth =require('./auth'); //allows us use the auth.js file
exports.register = function(server, options, next) {	
	server.route([
	
	{
		//Retrieve all tweets
		method: 'GET',
		path:'/tweets',
		handler: function(request, reply){
			var db =request.server.plugins['hapi-mongodb'].db;

			db.collection('tweets').find().toArray(function(err, tweets) {
				if(err) { return reply('Internal MongoDB error', err); }

				reply(tweets);
			});
		}
	}
	// {
	// 	//create a new tweet
	// 	method:'GET',
	// 	path:'user/{username}/tweets',
	// 	handler: function(request, reply){
	// 		var db=
	// 	}
	// }
]);

	next();
};

exports.register.attributes = {
  name: 'tweets-route',
  version: '0.0.1'
};