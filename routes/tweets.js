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
					if (err) { 
            return reply('Internal MongoDB error', err);
				  }

					reply(tweets);
				});
			}
		},
		{
			//create a new tweet
			method: 'POST',
			path: '/tweets',
			
			config: {
				handler: function(request, reply) {
					Auth.authenticated(request, function(result) {
						if (result.authenticated) {
							//if the user is logged in / authenticated, create the new post
							var db       = request.server.plugins['hapi-mongodb'].db;
							var session  = request.session.get('hapi_twitter_session');
							var ObjectId = request.server.plugins['hapi-mongodb'].ObjectID;
							
              var tweet = {
								"message": request.payload.tweet.message,
								"user_id": ObjectId(session.user_id)
							};

							db.collection('tweets').insert(tweet, function(err, writeResult) {
								if(err) { 
									return reply('Internal MongoDB error', err); 
								}

								reply(writeResult);
							});

						} else {
							reply(result.message);
						}
	      });
	    },
	    validate: {
	      payload: {
	        tweet: {
	          message: Joi.string().max(140).required()
	        }
	      }
	    }
	  }
	},
	{
	  method: 'GET',
	  path:'/tweets/{id}',
	  handler: function(request, reply) {
	  	var tweet_id = encodeURIComponent(request.params.id); //i dont understand the encodeURIComponent
	  	var db       = request.server.plugins['hapi-mongodb'].ObjectID;

	  	db.collection('tweets').findOne({ "_id": ObjectId(tweet_id)}, function(err, tweet) {
	  		if (err) { return reply('Internal MongoDB error', err); }

	  		reply(tweet);
	  	})
	  }
	},
	{
  // Delete one tweet
  method: 'DELETE',
  path: '/tweets/{id}',
  handler: function(request, reply) {
    Auth.authenticated(request, function(result) {
      if (result.authenticated) {
        var tweet_id = encodeURIComponent(request.params.id);

        var db       = request.server.plugins['hapi-mongodb'].db;
        var ObjectId = request.server.plugins['hapi-mongodb'].ObjectID;

        db.collection('tweets').remove({ "_id": ObjectId(tweet_id) }, function(err, writeResult) {
          if (err) { return reply('Internal MongoDB error', err); }

          reply(writeResult);
        });
      } else {
        reply(result.message);
      }
    });
  }
},
{
  // Retrieve all tweets by a specific user
  method: 'GET',
  path: '/users/{username}/tweets',
  handler: function(request, reply) {
    var db       = request.server.plugins['hapi-mongodb'].db;
    var username = encodeURIComponent(request.params.username);

    db.collection('users').findOne({ "username": username }, function(err, user) {
      if (err) { return reply('Internal MongoDB error', err); }

      db.collection('tweets').find({ "user_id": user._id }).toArray(function(err, tweets) {
        if (err) { return reply('Internal MongoDB error', err); }

        reply(tweets);
      });
    })
  }
}
]);


	next();
};



exports.register.attributes = {
  name: 'tweets-route',
  version: '0.0.1'
}