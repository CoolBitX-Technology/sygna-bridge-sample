const Ajv = require('ajv');

/**
 * validate json schema
 * @param {obj} paramObj 
 * @param {obj} schema 
 * @returns {{valid: boolean, err_msg?: string}}
 */
function validateSchema(paramObj, schema){
    const ajv = new Ajv();
    const valid = ajv.validate(schema, paramObj);
    if (!valid) return { valid, err_msg: `Input parsing error: ${ajv.errors[0].dataPath} ${ajv.errors[0].message}.` };
    return { valid };
}

module.exports = {
    validateSchema
};

