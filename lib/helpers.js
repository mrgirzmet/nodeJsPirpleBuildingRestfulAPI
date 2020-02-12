/**
 * 
 * Helpers for various tasks
 * 
*/
// Container for all the helpers
var helpers = {};

var crypto = require('crypto');
var config = require('./config');

// Create a SHA256 hash
helpers.hash = (string) => {
    if(typeof(string) == 'string' && string.length > 0){
        var hash = crypto.createHmac('sha256',config.hashingSecret).update(string).digest('hex');
        return hash;
    } else {
        return false;
    }
};

// Parse a json string that return 
helpers.parseJsonToObject = (string) => {
    try {
        return(JSON.parse(string));
    } catch(error) {
        return {};
    }
};


// Create a string of randomn alphanumeric characters, of a given length
helpers.createRandomString = function(strLength) {
    strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
    if(strLength) { 
        // Define all the possible characters that could go into string
        var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

        // Start the final string
        var randomStr = '';
        for(i = 1; i <= strLength;i++){
            // Get a random character from the possibleCharacters string
            var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            str+=randomCharacter;
        }

        //Return the final string
        return randomStr;
    }
}


// Export the module
module.exports = helpers;