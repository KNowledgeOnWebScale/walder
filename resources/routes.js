const GRAPHQLLD_IMPORT = 'const GraphQLLD = require(\'./graphQLLDOutput.js\');\n\n';

const FIRST_LINE = 'app.{0}(\'{1}\', function(req, res, next) {';
const BODY = '    // Callback body\n';
const LAST_LINE = '});\n';


module.exports = {
    GRAPHQLLD_IMPORT,
    FIRST_LINE,
    BODY,
    LAST_LINE
};