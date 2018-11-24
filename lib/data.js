/**
	Storing Date
**/

//dependencies\

var fs = require('fs');
var path = require('path');
var helpers = require('./helpers');


//Container for MOdule

var lib = {};

//Base directory for data
lib.baseDir = path.join(__dirname,'/../.data/');

lib.create = function(dir, file, data, callback){
	//open the file
	fs.open(lib.baseDir+dir+'/'+file+'.json','wx', function(err,fileDescriptor){
		if(!err && fileDescriptor){
			//Data to string
			var stringData =  JSON.stringify(data);

			// Writing and closing
			fs.writeFile(fileDescriptor, stringData, function(err){
				if(!err){
					fs.close(fileDescriptor, function(err){
						if(!err){
							callback(false);
						}else {
							callback('Error closing file!!!')
						}
					});
				}else {
					callback('Error Writing to file');
				}
			});
		}else {
			callback('Could not create file, it may exist already');
		}
	});
}
//Read data from file

lib.read = function(dir, file, callback){
	fs.readFile(lib.baseDir+dir+'/'+file+'.json','utf8',function(err, data){
		if(!err && data){
			var parsedData = helpers.parseJsonToObject(data);
			callback(false, parsedData);
		}else {
			callback(err, data);
		}		
	});
};

//Update data inside a file

lib.update =function(dir, file, data, callback){
	fs.open(lib.baseDir+dir+'/'+file+'.json','r+',function(err, fileDescriptor){
		if(!err && fileDescriptor){
			var stringData =  JSON.stringify(data);
			//truncate file
			fs.truncate(fileDescriptor, function(err){
				if(!err){
					fs.writeFile(fileDescriptor, stringData, function(err){
						if(!err){
							fs.close(fileDescriptor, function(err){
								if(!err){
									callback(false);
								}else {
									callback('Error closing file');
								}
							})
						}else {
							callback('Error writting to existing file');
						}
					})
				}else{
					callback('Error trucating file');
				}
			})
		}else {
			callback('Could not open file for updating, it may not exist!!!');
		}
	});
}


//Deleting file

lib.delete = function(dir, file, callback){
	//Unlink the file
	fs.unlink(lib.baseDir+dir+'/'+file+'.json',function(err){
		callback('Error deleting file');
	})
}

//list items in a directory

lib.list = function(dir, callback){
	fs.readdir(lib.baseDir+dir+'/', function(err, data){
		if(!err && data && data.length > 0){
			var trimmedFileNames = [];
			data.forEach(function(fileName){
				trimmedFileNames.push(fileName.replace('.json', ''));
			});
			callback(false, trimmedFileNames);
		}else {
			callback(err, data);
		}
	});
};







module.exports = lib;