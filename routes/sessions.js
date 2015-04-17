var Bcrypt = require('bcrypt');
var Auth =require('./auth');
exports.register = function(server, option, next) {
//everything under this register will get loaded into the plugins line 14
	//include routes. because we want ot include many routes we can do an array[]
	server.route([ 
	  {
	  		// signing in
	     	method: 'POST',
	     	path: '/sessions',
	     	handler: function(request, reply) {
	     		//load the mongoDB
	     		var db = request.server.plugins['hapi-mongodb'].db
	     		//read the payload
	     		var user = request.payload.user;
	     		//find if the user exists
	     		db.collection('users').findOne({ "username": user.username}, function(err, userMongo) {
	     			if(err) { return reply('Internal MongoDB error', err); }

	     			if (userMongo === null) {
	     				return reply({ "message": "user doesn't exist"});
	     			}

	     			Bcrypt.compare(user.password, userMongo.password, function(err, matched) {
	     				if (matched) {
	     					//if password matches, please authenticate user and add to cookies

	     					function randomKeyGenerator() {
                  return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
                }
   
                // Generate a random key
                var randomKey = randomKeyGenerator(); 

                var newSession = {
                	"session_id": randomKey,
                	"user_id": userMongo._id
                };

                db.collection('sessions').insert(newSession, function(err, writeResult) {
                	if (err) { return reply('Internal MongoDB error', err); }

                	//Store the Session information in the browser Cookie
                	//Yar
                	request.session.set( 'hapi_twitter_session', {
                		"session_key": randomKey,
                		"user_id": userMongo._id
                	});

                	return reply(writeResult);
                });
 
	     				} else {
	     					reply({ "message":"Not authorized" });
	     				}
	     			});

	     		});
	     	}	     	
		},
	  {
      method: 'GET',
      path: '/authenticated',
      handler: function(request, reply) {
      	Auth.authenticated(request, function(result) {
      		reply(result);
      	});
      } 
    },
    {
    	//logging out
    	method: 'DELETE',
    	path: '/sessions',
    	handler: function(request, reply) {
    		//obtain the session
				var session = request.session.get('hapi_twitter_session');

    		//initial db
    		var db = request.server.plugins['hapi-mongodb'].db

    		if (!session) {
    			return reply({ "message": "Already logged out"})
    			//return will terminate the rest of the program
    		}
    		//search for the same session in the db
    		db.collection('sessions').remove({"session_id": session.session_key },
    			function(err, writeResult){
    			if (err) { return reply('Internal MongoDB error', err); }
    				reply(writeResult);
    			});
    		//remove the session in the db
    	}
    }
  ]);

  next();
};

exports.register.attributes = {
	name: 'sessions-route',
	version: '0.0.1'
};