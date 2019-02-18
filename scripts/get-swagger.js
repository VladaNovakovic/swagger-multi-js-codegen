const fs = require('fs');
const request = require('request');

const inputSpecsUrl = 'https://scp.testing.soaf-dev.computerrock.com/api-docs';
const swaggerSpecsOutputFile = './swagger-codegen/swagger.json';

request.get({
    method: 'GET',
    rejectUnauthorized: false,
    url: inputSpecsUrl,
}).pipe(fs.createWriteStream(swaggerSpecsOutputFile));
