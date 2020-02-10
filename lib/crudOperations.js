/*
*Library for storing and editing data
*/
var fs = require('fs');
var path = require('path');
var helpers = require('./helpers');

//Container for the module
var lib = {};

// Base directory of the data folder\
lib.baseDir = path.join(__dirname,'/../.data/');

//Write data to a file
lib.create = (dir,file,data,callback) => {
    //Open the file for writing
    fs.open(`${lib.baseDir}${dir}/${file}.json`,'wx',(err,fileDescriptor)=>{
        if(!err && fileDescriptor){
        // Convert data to string
        var stringData = JSON.stringify(data);
        //Write to file and close it
        fs.writeFile(fileDescriptor,stringData,(error)=>{
            if(!error){
                callback(false);
            }else{
                callback('Error closing new file');
            }
        });    
        } else {
            callback('Could not create new file,it may already exist');
        }
    });
};

// Read data from the file
lib.read = (dir,fileName,callback) => {
    fs.readFile(`${lib.baseDir}${dir}/${fileName}.json`,'utf-8',
        (error,data)=>{
            if(!error && data) {
              callback(false,helpers.parseJsonToObject(data));     
            } else {
                callback(error,data);
            }
        });
};

 // Update data inside a file
 lib.update = (dir,file,data,callback) => {
    fs.open(lib.baseDir+dir+'/'+file+'.json','r+',(error,fileDescriptor)=>{
        if(!error && fileDescriptor){
            var stringData = JSON.stringify(data);
            fs.ftruncate(fileDescriptor,(error)=>{
                if(!error){
                    fs.writeFile(fileDescriptor,stringData,(error)=>{
                        if(!error){
                            fs.close(fileDescriptor,(error)=>{
                                if(!error){
                                    callback(false);
                                } else { 
                                    callback('Error while closing the file : ' + error);
                                }
                            });
                        }else {
                            callback('Error writing to existing file : ' + error);
                        }
                    });
                }else{
                    callback('Error truncating file : ' + error );    
                }
            });

        } else {
            callback('Error while opening file : ' + error);
        }
    });
 };

lib.delete = (dir,file,callback)=>{
    //Unlink the file
    fs.unlink(`${lib.baseDir}${dir}/${file}.json`,(error)=>{
        if(!error){
            callback(false);
        } else {
            callback('Error while deleting file');
        }
    });
};
module.exports = lib;