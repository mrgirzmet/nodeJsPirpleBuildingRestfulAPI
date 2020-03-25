
//Define the handlers
var handlers = {};
var _data = require('./crudOperations');
var helpers = require('./helpers');

const LENGTH_ID = 20;

// Users
handlers.users = (data,callback) => {
    var acceptableMethods = ['post','get','put','delete'];
    if(acceptableMethods.includes(data.method) > -1){
        handlers._users[data.method](data,callback);
    } else {
        callback(405);
    }
};

// Container for the users subMethods
handlers._users = {};

// Users - post
// Required data : firstName, lastName, phone, password, tosAgreement
// Optional data : none
handlers._users.post = (data,callback) => {
    //Check all fields are filled out.
    var { firstName,lastName,phone,password} = validateFields(data);

    var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && 
            data.payload.tosAgreement ? true : false;

    if(firstName && lastName && phone && password && tosAgreement){
        // Make sure that the user does not already exist.
        _data.read('users',phone,(error,data)=>{
            if(error){
                // Hash the password
                var hashedPassword = helpers.hash(password);

                if(hashedPassword){
                    //Create the user object
                    var userObject = {
                        'firstName' : firstName,
                        'lastName' : lastName,
                        'phone' : phone,
                        'hashedPassword': hashedPassword,
                        'tosAgreement' : true
                    };

                    _data.create('users',phone,userObject,(error)=>{
                        if(!error){
                            callback(200);
                        }else{
                            callback(500,{'Error':' Could not create the new user with reason : ' + error});
                        }
                    });
                } else { 
                    callback(500,{'Error':'Could not hash the user\'s password'});
                }
            }else{
                callback(400,{'Error':'A user with that phone number already exists'});
            }
        });
    } else {
        callback(400,{'Error': 'Missing required fields'});
    }
};

// Users - get
// Required data : phone
// Optional data : none
// @TODO Only let an authenticated user access their objec.Dont let them access anyone elses 
handlers._users.get = (data,callback) => {
    //Check that the phone number is valid
    var phone = typeof(data.queryStringObject.phone) == 'string' && 
        data.queryStringObject.phone.trim().length == 10 ? 
            data.queryStringObject.phone.trim() : 
            false;
    if(phone) {
        _data.read('users',phone,(err,data)=>{
            if(!err && data) {
                // remove the hashed password from the user object before returning it to the requester
                delete data.hashedPassword;
                callback(200,data);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400,{'Error':'Missing required field'});
    }         
};


// Users - put
// Required data : phone
// Optional data : firstName, lastName, password ( at least one must be specified)
// @TODO Only let an authenticated user update their object.Dont let them access anyone elses 
handlers._users.put = (data,callback) => {
    //Check that the phone number is valid
    if(phone) {
        // Error if nothing is sent to update
        var { firstName,lastName,phone,password} = validateFields(data);
        if(firstName || lastName || password ) {
            
        } else {

        }
    } else {
        callback(400,{'Error':'Missing required field'});
    }         
};


// Users - delete
// Required data : id
handlers._users.delete = (data,callback) => {
    // Check that id is valid
    var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == LENGTH_ID ? data.queryStringObject.phone : false;
    if(phone) {
        // Lookup the token
        _data.read('users',phone,(error,data)=>{
            if(!error) { 
                _data.delete('users',phone,(error)=>{
                    if(!error){
                        callback(200,{"Delete": "Succeed!"});    
                    } else {
                        callback(500,{'Error':'Could not delete the specified user'})
                    }
                })
            } else { 
                callback(400,{'Error':'Could not find the specified user'})
            }
        })
    } else {
        callback(400,{'Error': 'Missing required field'});
    }
}
œ
const validateFields = (data) => {

    let validatedData = {};
    var firstName = typeof(data.payload.firstName) == 'string' && 
        data.payload.firstName.trim().length > 0 ? 
        data.payload.firstName.trim() : 
        false;

    var lastName = typeof(data.payload.lastName) == 'string' && 
        data.payload.lastName.trim().length > 0 ? 
            data.payload.lastName.trim() : 
            false;

    var phone = typeof(data.payload.phone) == 'string' && 
        data.payload.phone.trim().length == 10 ? 
            data.payload.phone.trim() : 
            false;

    var password = typeof(data.payload.password) == 'string' && 
        data.payload.password.trim().length > 0 ? 
            data.payload.password.trim() : 
            false;
    validatedData.firstName = firstName;
    validatedData.lastName = lastName;
    validatedData.phone = phone;
    validatedData.password = password;
    return {...data,...validatedData};
};

// Tokens
handlers.tokens = (data,callback) => {
    var acceptableMethods = ['post','get','put','delete'];
    if(acceptableMethods.includes(data.method) > -1){
        handlers._tokens[data.method](data,callback);
    } else {
        callback(405);
    }
};

// Container for all the tokens methods
handlers._tokens = {};

// Tokens - Post 
// Required data : phone,password
// Optional : none
handlers._tokens.post = function(data,callback){
    var phone = typeof(data.payload.phone) == 'string' && 
    data.payload.phone.trim().length == 10 ? 
        data.payload.phone.trim() : false;

    var password = typeof(data.payload.password) == 'string' && 
    data.payload.password.trim().length > 0 ? 
        data.payload.password.trim() : false;
        if(phone && password) { 
        _data.read('users',phone,function(err,userData){
            if(!err &&  userData) { 
                //Hash the sent password, and compare it to the password stored in the user object
                var hashedPassword = helpers.hash(password);
                if(hashedPassword == userData.hashedPassword) { 
                    // If valid, create a new token with a random name. Set expiration date 1 hour in the feature.
                    var tokenId = helpers.createRandomString(LENGTH_ID);
                    var expires = Date.now() + 1000 * 60 * 60;
                    var tokenObject = { 
                        'phone' : phone,
                        'id' : tokenId,
                        'expires' : expires
                    };

                    _data.create('tokens',tokenId,tokenObject,function(err){
                        if(!err){
                            callback(200,tokenObject);
                        } else {
                            callback(500,{'Error' : 'Could not create the new token'});
                        }
                    })
                } else {
                    callback(400,{'Error': 'Password did not match the specified user\'s stored password'});
                }
            } else {
                callback(400,{'Error':'Could not find the specified user'});
            }
        });        
    } else { 
        callback(400,{'Error' : 'Missing required field(s)'})
    }

}

// Tokens - GET 
// Required data : id
// Optional : none
handlers._tokens.get = function(data,callback){
    //Check that the token id is valid
    var id = typeof(data.queryStringObject.id) == 'string' && 
    data.queryStringObject.id.trim().length == LENGTH_ID ? 
        data.queryStringObject.id.trim() : false;
    if(id) {
        // Lookup the token 
        _data.read('tokens',id,(err,tokenData)=>{
            if(!err && tokenData) {;
                callback(200,tokenData);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400,{ 'Error' : 'Missing required field'});
    }   
}

// Tokens - PUT 
// Required data : id, extend
// Optional : none
handlers._tokens.put = function(data,callback){
    var id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == LENGTH_ID ? data.payload.id : false;
    var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true;
    if ( id && extend) {
        //Lookup the token
        _data.read('tokens',id,function(error,tokenData) {
            if(!error && tokenData){ 
                //Check to make sure the token isn't already expired
                if(tokenData.expires > Date.now()){
                    // Set the expiration an hour from now
                    tokenData.expires = Date.now() + 1000 * 60 * 60;

                    //Store the new updates
                    _data.update('tokens',id,tokenData,function(error){
                        if(!error){
                            callback(200,{ "Token extend operation result" : "Succeed"});
                        } else {
                            callback(500,{'Error':'Could not update the token\s expiration'});
                        }
                    })
                } else {
                    callback(400,{ 'Error' : 'The token has already expired, and cannot be extended' });
                }
            } else {
                callback(400,{ 'Error' : 'Specified data does not exist' });
            }
        })
    } else {
        callback(400,{'Error' : 'Missing required field(s) or field(s) are invalid'});
    }
}

// Tokens - DELETE 
// Required data : id
// Optional : none
handlers._tokens.delete = function(data,callback){
    // Check that id is valid for the token
    var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == LENGTH_ID ? data.queryStringObject.id : false;
    if(id) {
        // Lookup the token
        _data.read('tokens',id,(error,data)=>{
            if(!error) {
                _data.delete('tokens',id,(error)=>{
                    if(!error){
                        callback(200,{"Delete": "Succeed!"});
                    } else {
                        callback(500,{'Error':'Could not delete the specified token'})
                    }
                })
            } else { 
                callback(400,{'Error':'Could not find the specified user'})
            }
        })
    } else {
        callback(400,{'Error': 'Missing required field'});
    }
}

//Ping handler
handlers.ping = (data,callback) => {
  callback(200);
};  

handlers.notFound = (data,callback) => {
    callback(404);
};

module.exports = handlers;