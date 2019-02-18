const fs = require('fs');
const CodeGen = require('swagger-js-codegen').CodeGen;
const path = require('path');

const isEs6 = process.argv[2] === 'ES6';

// path for immutable model template files
const immutableTemplate = {
    model: path.resolve(__dirname, '../templates/model-immutable.mustache'),
    method: path.resolve(__dirname, '../templates/react-method.mustache'),
    modelPath: path.resolve(__dirname, '../../src/model/generated/'),
};

// path for es6 model template files
const es6Template = {
    model: path.resolve(__dirname, '../templates/model-es6.mustache'),
    method: path.resolve(__dirname, '../templates/react-method.mustache'),
    modelPath: path.resolve(__dirname, '../../src/model/generated/'),
};

// Default templates are immutable, if ES6 is passed as argument, es6 template will be used
const template = isEs6 ? es6Template : immutableTemplate;

const swaggerSource = require('../swagger.json');

// Iterate Generating Model files
for (const definitionName in swaggerSource.definitions) {
    const currentDefinition = swaggerSource.definitions[definitionName];
    const currentDefinitionType = currentDefinition.type;
    const outputFilePath = path.resolve(__dirname, template.modelPath, (definitionName + '.js'));

    const includes = [];
    const propertiesArray = [];

    if (currentDefinitionType === 'object') {
        for (const propertyName in currentDefinition.properties) {
            const property = currentDefinition.properties[propertyName];
            let propertyType = property.type;
            let isCustomProperty = false;

            const isArray = propertyType === 'array';
            let arrayItem = null;

            if (typeof propertyType === 'undefined') {
                const ref = property.$ref;
                propertyType = ref.split('#/definitions/')[1];
                isCustomProperty = true;

                let isModelAdded = includes.find(({name}) => {
                    return name === propertyType;
                });

                if (typeof isModelAdded !== 'object') {
                    includes.push({
                        name: propertyType,
                        path: './' + propertyType,
                    });
                }
            }

            if (isArray) {
                const arrayItems = property.items;
                if (typeof arrayItems.type !== 'undefined') {
                    arrayItem = {
                        type: arrayItems.type,
                        isCustomProperty: false,
                    };
                } else {
                    const ref = arrayItems.$ref;
                    propertyType = ref.split('#/definitions/')[1];

                    arrayItem = {
                        type: propertyType,
                        isCustomProperty: true,
                    };

                    let isModelAdded = includes.find(({name}) => {
                        return name === propertyType;
                    });

                    if (typeof isModelAdded !== 'object') {
                        includes.push({
                            name: propertyType,
                            path: './' + propertyType,
                        });
                    }
                }
            }

            propertiesArray.push({
                name: propertyName,
                type: propertyType,
                isArray,
                isMandatory: false,
                isCustomProperty,
                arrayItem,
            });
        }
    }

    if (propertiesArray.length > 0) {
        propertiesArray[propertiesArray.length - 1].isLast = true;
    }

    // generating Model File
    const generatedSourceCode = CodeGen.getCustomCode({
        moduleName: 'ToniKnowsAPI',
        className: 'ToniKnowsAPI',
        swagger: swaggerSource,
        lint: false,
        esnext: true,
        template: {
            class: fs.readFileSync(template.model, 'utf-8'),
            method: fs.readFileSync(template.method, 'utf-8'),
            isES6: true,
        },
        mustache: {
            className: definitionName,
            properties: propertiesArray,
            includes,
        }
    });

    // console.log(outputFilePath);
    // output the generated model file
    fs.writeFile(outputFilePath, generatedSourceCode, function(err) {
        if(err) { return console.log(err); }
    });
}
