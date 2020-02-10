var enviroments = {};

enviroments.stagging = {
    'httpPort' : 3000,
    'httpsPort' : 3001,
    'envName' : 'stagging',
    'hashingSecret' : 'thisIsASecret'
};

enviroments.production = {
    'httpPort' : 5000,
    'httpsPort' : 5001,
    'envName' : 'production',
    'hashingSecret' : 'thisIsASecret'
};

var currentEnviroment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLocaleLowerCase() : '';

var enviromentToExport = typeof(enviroments[currentEnviroment]) == 'object' ? enviroments[currentEnviroment] : enviroments.stagging;

module.exports = enviromentToExport;