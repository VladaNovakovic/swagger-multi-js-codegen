const fs = require('fs');
const CodeGen = require('swagger-js-codegen').CodeGen;
const path = require('path');
const inputSpecsData = require('../swagger.json');

const outputFile = path.resolve(__dirname, '../../src/apis/generated-api-lib/RSIClientAPI.js');

const classTemplate = path.resolve(__dirname, '../templates/react-class.mustache');
const methodTemplate = path.resolve(__dirname, '../templates/react-method.mustache');
const typeTemplate = path.resolve(__dirname, '../templates/type.mustache');

// generating API client
let generatedSourceCode = CodeGen.getCustomCode({
    moduleName: 'RSIClientAPI',
    className: 'RSIClientAPI',
    swagger: inputSpecsData,
    isES6: true,
    lint: false,
    template: {
        class: fs.readFileSync(classTemplate, 'utf-8'),
        method: fs.readFileSync(methodTemplate, 'utf-8'),
        type: fs.readFileSync(typeTemplate, 'utf-8'),
    },
});

// output generated client file
fs.writeFile(outputFile, generatedSourceCode, function(err) { if(err) { return console.log(err); } });