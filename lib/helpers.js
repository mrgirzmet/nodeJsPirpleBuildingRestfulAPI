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



// Export the module
module.exports = helpers;