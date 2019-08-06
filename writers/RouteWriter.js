const Writer = require('./writer');
const fs = require('fs');
const Routes = require('../resources/routes');

module.exports = class RouteWriter extends Writer {
    constructor(file) {
        super(file);
    }

    preWrite() {
        this.sb.append(Routes.GRAPHQLLD_IMPORT);

        fs.appendFileSync(this.file, this.sb.toString());

        this.sb.clear();
    }

    write(route, graphQLLDWriter) {
        this.sb.appendFormat(Routes.FIRST_LINE, route.method, route.path);

        this.sb.appendLine(Routes.BODY);
        // Write query code
        graphQLLDWriter.writeQueryExecution(this.sb);

        this.sb.appendLine(Routes.LAST_LINE);

        fs.appendFileSync(this.file, this.sb.toString());

        this.sb.clear();
    }

    postWrite() {}
};