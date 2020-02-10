
//Define the handlers
var handlers = {};
var _data = require('./crudOperations');
var helpers = require('./helpers');

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


//Ping handler
handlers.ping = (data,callback) => {
  callback(200);
};  

handlers.notFound = (data,callback) => {
    callback(404);
};

module.exports = handlers;