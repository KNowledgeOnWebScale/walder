const GRAPHQLLD_IMPORT = 'const GraphQLLD = require(\'./graphQLLDOutput.js\');\n\n';
const PIPE_MODULES_IMPORT = 'const PipeModules = require(\'./pipeModules\');\n';

const FIRST_LINE = 'app.{0}(\'{1}\', function(req, res, next) {';
const BODY = '    // Callback body\n';
const LAST_LINE = '});\n\n';


module.exports = {
    GRAPHQLLD_IMPORT,
    PIPE_MODULES_IMPORT,
    FIRST_LINE,
    BODY,
    LAST_LINE
};
