const Ajv = require('ajv');

/**
 * validate json schema
 * @param {obj} paramObj 
 * @param {obj} schema 
 */
function validateSchema(paramObj, schema){
    const ajv = new Ajv();
    const valid = ajv.validate(schema, paramObj);
    if (!valid) throw new Error(`Input parsing error: ${ajv.errors[0].dataPath} ${ajv.errors[0].message}.`);
}

module.exports = {
    validateSchema
};

