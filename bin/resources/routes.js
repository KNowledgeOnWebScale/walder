const EXPRESS_IMPORT = 'const express = require(\'express\');\n';
const GRAPHQLLD_IMPORT = 'const GraphQLLD = require(\'./graphQLLD.js\');\n';
const PIPE_MODULES_IMPORT = 'const PipeModules = require(\'./pipeModules\');\n\n';

const CREATE_APP = 'const app = express();\n\n';
const START_APP = 'app.listen(5656, () => {\n' +
    '    console.log(\'Listening on http://localhost:5656\')\n' +
    '});';

const FIRST_LINE = 'app.{0}(\'{1}\', function(req, res, next) {';
const BODY = '    // Callback body\n';
const LAST_LINE = '});\n\n';


module.exports = {
    EXPRESS_IMPORT,
    GRAPHQLLD_IMPORT,
    PIPE_MODULES_IMPORT,
    CREATE_APP,
    START_APP,
    FIRST_LINE,
    BODY,
    LAST_LINE
};
