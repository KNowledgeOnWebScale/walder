const EXPORTS_START = 'module.exports = {';
const EXPORT_OBJECT = '\n    {0},';
const EXPORTS_END = '};\n';

const IS_EMPTY_IMPORT = 'const isEmpty = require(\'is-empty\');\n';

module.exports = {
    EXPORTS_START,
    EXPORT_OBJECT,
    EXPORTS_END,
    IS_EMPTY_IMPORT
};