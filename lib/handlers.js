//Request handlers


//Dependencies
var _data = require('./data');
var helpers = require('./helpers');


//define handlers
var handlers = {};

// ping handler
handlers.ping = function(data, callback){
  callback(200);
}
//not found handler
handlers.notFound = function(data, callback) {
  callback(404);
};

//users
handlers.users = function(data, callback){
	var acceptableMethods = ['post', 'get', 'put', 'delete'];
	if(acceptableMethods.indexOf(data.method) > -1) {
		handlers._users[data.method](data,callback);
	}else {
		callback(405);
	}
};



//Container for user submethods
handlers._users = {};




//Users post
//required data: firstName, lastName, phone, password, tosAgreement
//otional data: none

handlers._users.post = function(data, callback){
	//check required fields filled out
	  var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
	  var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
	  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
	  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
	  var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

	    if(firstName && lastName && phone && password && tosAgreement){
	      // Make sure the user doesnt already exist
	      _data.read('users',phone,function(err,data){
	        if(err){
	          // Hash the password
	          var hashedPassword = helpers.hash(password);

	          // Create the user object
	          if(hashedPassword){
	            var userObject = {
	              'firstName' : firstName,
	              'lastName' : lastName,
	              'phone' : phone,
	              'hashedPassword' : hashedPassword,
	              'tosAgreement' : true
	            };

	            // Store the user
	            _data.create('users',phone,userObject,function(err){
	              if(!err){
	                callback(200);
	              } else {
	                console.log(err);
	                callback(500,{'Error' : 'Could not create the new user'});
	              }
	            });
	          } else {
	            callback(500,{'Error' : 'Could not hash the user\'s password.'});
	          }

	        } else {
	          // User alread exists
	          callback(400,{'Error' : 'A user with that phone number already exists'});
	        }
	      });

	    } else {
	      callback(400,{'Error' : 'Missing required fields'});
	    }

	  };
//Users get 
//required data: phone
//optional data: none
// @todo Only let authenticated user access
handlers._users.get = function(data, callback){
	var phone = typeof(data.queryStringObj.phone) == 'string' && data.queryStringObj.phone.trim().length == 10 ? data.queryStringObj.phone.trim() : false;
	if(phone){
		//lookup the user
		_data.read('users', phone, function(err, data){
			if(!err && data){
				//remove hashed password from user before passing it
				delete data.hashedPassword;
				callback(200, data);
			}else {
				callback(404);
			}
		});

	}else {
		callback(400, {'Error' : 'Missing required fields'})
	}
};

//Users put
//required data: phone
//optional data: firstName, lastName, password (at least one specified)
// @todo only auth user can update objects
handlers._users.put = function(data, callback){
	//Check required felds
	var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
	//check optional fields
	var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
	var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
	var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
	if(phone){
		if(firstName || lastName || password){
			_data.read('users',phone, function(err, userData){
				if(!err && userData){
					if(firstName){
						userData.firstName = firstName;
					}
					if(lastName){
						userData.lastName = lastName;
					}
					if(password){
						userData.hashedPassword = helpers.hash(password);
					}

					//storing the updates
					_data.update('users', phone, userData, function(err){
						if(!err){
							callback(200);
						}else {
							console.log(err);
							callback(500, {'Error' : 'Could not update user info'});
						}
					});
				} else {
					callback(400, {'Error' : 'Specified user does not exist'});
				}
			});
		} else {
			callback(400, {'Error' : 'Missing fields to update.'});
		}
	}else {
		callback(400, {'Error': 'Missing required fields'});
	}
};

//Users delete
//required field: phone
// @todo Only auth users can delete data.
// @todo delete any any data associated with user

handlers._users.delete = function(data, callback){
	//Check phone number valid
	var phone = typeof(data.queryStringObj.phone) == 'string' && data.queryStringObj.phone.trim().length == 10 ? data.queryStringObj.phone.trim() : false;
	if(phone){
		//lookup the user
		_data.read('users', phone, function(err, data){
			if(!err && data){
				_data.delete('users', phone, function(err){
					if(!err){
						callback(200);
					}else {
						callback(500, {'Error' : 'Could not delete the specified user'});
					}
				});
			}else {
				callback(400, {'Error' : 'Could not find specified user'});
			}
		});

	}else {
		callback(400, {'Error' : 'Missing required fields'})
	}
};





module.exports = handlers;