 // all Dependencies
let http = require('http');
let https = require('https');
var url = require('url');
var _data = require('./lib/crudOperations');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./lib/config');
var handlers = require('./lib/handlers');
var helpers = require('./lib/helpers');

// TEST 
// _data.create ('test','newFile',{'foo':'bar'},function(error){
//     if(error)console.log('this was the error',error);
// }); 
// // TEST 
// _data.delete('test','newFile',(error)=>{
//     if(error)console.log('this is the error : ' + error);
// });

/* // READ OPERATION
_data.read('test','newFile',(error,data)=>
{
    console.log(`this was the error : ${error} and this was the data : ${data}`);
});

// TESTING
// @TODO delete this
_data.update('test','newFile',{'name':'munsal'},(error,data)=>{
    if(error){
        console.log('This was the error : ' + error);
    } else if(data){
        console.log('Data is ' + data);
    }
});*/

let unifiedServer = (req,res) => {
       
  // Get the URL and parse it
  var parsedUrl = url.parse(req.url,true);
  // Get the path
  var path = parsedUrl.pathname;
  var trimPath = path.replace(/^\/+|\/+$/g,'');
  // Get the query string as object
  var queryStringObject = parsedUrl.query;

  // Get the HTTP method
  var method = req.method.toLowerCase();
  
  // Get the Headers
  var headers = req.headers;

  // Get the payload, if any
  var decoder = new StringDecoder('utf-8');
  var buffer = '';
  
  req.on('data',function(data){
      buffer += decoder.write(data);
  });
  req.on('end',function(){
      buffer+= decoder.end();
  // Choose the handler this request should go to. If one is not found use the notFound handler
  var chosenHandler = typeof(router[trimPath]) !== 'undefined' ? router[trimPath] : handlers.notFound;
  // Construct the data object to send the handler
  
  var data = {
      trimPath,
      queryStringObject,
      method,
      headers,
      'payload' : helpers.parseJsonToObject(buffer)
   };

   // Route the request to the handler specified in the router
   chosenHandler(data,(statusCode,payload)=>{
       // Use the status code called back by the handler, or default to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
       // Use the payload called back by the handler, or default to 
       payload = typeof(payload) == 'object' ? payload : {};
   
      // Convert the payload to a string
      var payloadString = JSON.stringify(payload);
      res.setHeader('Content-Type','application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
  });

 

//   console.log(`Request received wih payload : ${buffer}`);
  // Log the request path
  // console.log(`Request received on path:${trimPath} with method name : ${method} `,queryStringObject);
  });
};

// The server should respond to all requests with a string
var httpServer = http.createServer(unifiedServer);

// Start the server, and have it listen on port ${PORT}
 httpServer.listen(config.httpPort,function(){ 
     console.log("The server is listening on port " + config.httpPort + " in " + config.envName + " mode");
});
 
// The server should respond to all requests with a string
var httpsServer = https.createServer(unifiedServer);

// Start the server, and have it listen on port ${PORT}
httpsServer.listen(config.httpsPort,function(){ 
    console.log("The server is listening on port " + config.httpsPort + " in " + config.envName + " mode");
});

//Define a router
var router = {
   'sample' : handlers.sample,
   'users' : handlers.users,
   'tokens' : handlers.tokens,
   'checks' : handlers.checks
};