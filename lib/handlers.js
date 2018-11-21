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
handlers._users.get = function(data, callback){
	var phone = typeof(data.queryStringObj.phone) == 'string' && data.queryStringObj.phone.trim().length == 10 ? data.queryStringObj.phone.trim() : false;
	if(phone){
		//Get the token from the headers
		var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;


		// vrify given token is valid for phone number
		handlers._tokens.verifyToken(token, phone, function(tokenIsValid){
			if(tokenIsValid){
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
				callback(403, {'Error' : 'Missing required token in header or token is invalid'});
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
			var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
			handlers._tokens.verifyToken(token, phone, function(tokenIsValid){
			if(tokenIsValid){
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
				callback(403, {'Error' : 'Missing required token in header or token is invalid'});
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

		var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
			handlers._tokens.verifyToken(token, phone, function(tokenIsValid){
			if(tokenIsValid){
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

			} else {
				callback(403, {'Error' : 'Missing required token in header or token is invalid'});
			}
		});		

	}else {
		callback(400, {'Error' : 'Missing required fields'})
	}
};

//Tokens
handlers.tokens = function(data, callback){
	var acceptableMethods = ['post', 'get', 'put', 'delete'];
	if(acceptableMethods.indexOf(data.method) > -1) {
		handlers._tokens[data.method](data,callback);
	}else {
		callback(405);
	}
};

//contaner for tokens
handlers._tokens = {};

//Tokens post
//Requires phone and password
 handlers._tokens.post = function(data, callback){
 	var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
 	var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
 	if(phone && password){
 		_data.read('users', phone, function(err, userData){
 			if(!err && userData){
 				//Hased sent password and store it
 				var hashedPassword = helpers.hash(password);
 				if(hashedPassword == userData.hashedPassword){
 					//If valid create new token, and set expiration data
 					var tokenId = helpers.createRandomString(20);

 					var expires = Date.now() + 1000 * 60 * 60;

 					var tokenObject = {
 						'phone' : phone,
 						'id' : tokenId,
 						'expires' : expires
 					};
 					//store token

 					_data.create('tokens', tokenId, tokenObject, function(err){
 						if(!err){
 							callback(200, tokenObject);
 						}else {
 							callback(500, {'Error' : 'Could not create the new token'});
 						}
 					})
 				}else {
 					callback(400, {'Error' : 'Password did not match records'})
 				}
 			} else {
 				callback(400, {'Error' : 'Could not find such user'});
 			}
 		});
 	}else {
 		callback(400, {'Error' : 'Missing required fields'})
 	}
 };

 //Tokens get
 //required data id
 handlers._tokens.get = function(data, callback){

 	var id = typeof(data.queryStringObj.id) == 'string' && data.queryStringObj.id.trim().length == 20 ? data.queryStringObj.id.trim() : false;
 	if(id){
 		//lookup the user
 		_data.read('tokens', id, function(err, tokenData){
 			if(!err && tokenData){
 				//remove hashed password from user before passing it
 				delete data.hashedPassword;
 				callback(200, tokenData);
 			}else {
 				callback(404);
 			}
 		});

 	}else {
 		callback(400, {'Error' : 'Missing required fields'})
 	}

 };

 //Tokens put
 //requires id, extend
 //optional data none
 handlers._tokens.put = function(data, callback){
 	 var id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
  	 var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
  	 if(id && extend){
  	 	_data.read('tokens', id, function(err, tokenData){
  	 		if(!err && tokenData){
  	 			//check token has not expired
  	 			if(tokenData.expires > Date.now()){
  	 				tokenData.expires = Date.now() + 1000 * 60 * 60;

  	 				//Update data collection
  	 				_data.update('tokens', id, tokenData, function(err){
  	 					if(!err){
  	 						callback(200);
  	 					} else {
  	 						callback(500, {'Error': 'Could not update the new token'});
  	 					}
  	 				});
  	 			} else {
  	 				callback(400, {'Error': 'The token has already expired and can not be extended'});
  	 			}
  	 		}else {
  	 			callback(400, {'Error' : 'Specified token does not exist'});
  	 		}
  	 	});
  	 }else {
  	 	callback(400, {'Error': 'Missing required fields or fileds are not valid'});
  	 }
 };

 //Tokens delete
 //require data: id
 // no optional data
 handlers._tokens.delete = function(data, callback){
	var id = typeof(data.queryStringObj.id) == 'string' && data.queryStringObj.id.trim().length == 20 ? data.queryStringObj.id.trim() : false; 	

 	if(id){
 		//lookup the token
 		_data.read('tokens', id, function(err, data){
 			if(!err && data){
 				_data.delete('tokens', id, function(err){
 					if(!err){
 						callback(200);
 					}else {
 						callback(500, {'Error' : 'Could not delete the specified token'});
 					}
 				});
 			}else {
 				callback(400, {'Error' : 'Could not find specified token'});
 			}
 		});

 	}else {
 		callback(400, {'Error' : 'Missing required fields'})
 	}
 };

//verifying that a token is currently valid for an user 
handlers._tokens.verifyToken = function(id, phone, callback){
//Look for the token
	_data.read('tokens', id, function(err, tokenData){
		if(!err && tokenData){
			if(tokenData.phone == phone && tokenData.expires > Date.now()){
				callback(true);
			}else {
				callback(false);
			}
		}else {
			callback(false);
		}
	});
};

module.exports = handlers;