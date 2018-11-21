/*
 * Helper for app usage
 *
 */

 //Dependencies
 var crypto = require('crypto');
 var config = require('./config');
 //Helper continers

var helpers = {};

// create a SHA256 hash

helpers.hash = function(str){
	if(typeof(str) == 'string' && str.length > 0){
		var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
		return hash;
	}else {
		return false;
	}
};
// Parse JSON string  to object without error

helpers.parseJsonToObject = function(str){
	try{
		var obj = JSON.parse(str);
		return obj;
	} catch(e){
		return {};
	}
};








 //Export container
 module.exports = helpers;