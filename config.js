/*
*Configuration variables
*/
var environments = {};

//Stging default environment

environments.staging = {
	'port' : 3000,
	'envName' : 'staging'
};

//Production environment

environments.production = {
	'port' : 5000,
	'envName' : 'production'
};

//Passing environment by command line

var currentEnvironment =  typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

//Check current environent exist if not default staging

var environentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

//Export module

module.exports = environentToExport;