const Writer = require('./writer');
const fs = require('fs');
const Routes = require('../resources/routes');

module.exports = class RouteWriter extends Writer {
    constructor(file) {
        super(file);
    }

    preWrite() {
        // Imports
        this.sb.append(Routes.EXPRESS_IMPORT);
        this.sb.append(Routes.GRAPHQLLD_IMPORT);
        this.sb.append(Routes.PIPE_MODULES_IMPORT);

        // Basic app structure
        this.sb.append(Routes.CREATE_APP);

        fs.appendFileSync(this.output, this.sb.toString());
        this.sb.clear();
    }

    write(route, graphQLLDWriter, pipeModuleWriter) {
        this.sb.appendFormat(Routes.FIRST_LINE, route.method, route.path);

        this.sb.appendLine(Routes.BODY);

        // Write query code
        graphQLLDWriter.writeQueryExecutionStart(this.sb);

        // Write pipe modules code
        pipeModuleWriter.writePipeExecution(this.sb);

        graphQLLDWriter.writeQueryExecutionEnd(this.sb);

        this.sb.appendLine(Routes.LAST_LINE);

        fs.appendFileSync(this.output, this.sb.toString());

        this.sb.clear();
    }

    postWrite() {
        // Basic app structure
        this.sb.append(Routes.START_APP);

        fs.appendFileSync(this.output, this.sb.toString());
        this.sb.clear();
    }
};