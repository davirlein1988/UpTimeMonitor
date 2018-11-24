/*
*Configuration variables
*/
var environments = {};

//Stging default environment

environments.staging = {
	'httpPort' : 3000,
	'httpsPort' : 3001,
	'envName' : 'staging',
	'hashingSecret' : 'thisIsASecret',
	'maxChecks' : 5,
	'twilio' : {
		'accountSid' : 'AC28fa589c49d94ca3c6fc636c74f5c5e7',
		'authToken' : '89f4fa406944d78cd90646ad37a47811',
		'fromPhone' : '+573152503647'
	}
};

//Production environment

environments.production = {
	'httpPort' : 5000,
	'httpsPort' : 5001,
	'envName' : 'production',
	'hashingSecret' : 'thisIsAlsoASecret',
	'maxChecks' : 5,
	'twilio' : {
		'accountSid' : 'AC28fa589c49d94ca3c6fc636c74f5c5e7',
		'authToken' : '89f4fa406944d78cd90646ad37a47811',
		'fromPhone' : '+573152503647'
	}
};

//Passing environment by command line

var currentEnvironment =  typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

//Check current environent exist if not default staging

var environentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

//Export module

module.exports = environentToExport;