const Writer = require('./writer');
const fs = require('fs');

const Global = require('../resources/global');
const PipeModules = require('../resources/pipeModules');

module.exports = class PipeModuleWriter extends Writer {
    constructor(output) {
        super(output);
        this.pipeModules = [];
    }

    async write(pipeModules) {
        this.pipeModules = this.pipeModules.concat(pipeModules);
        await pipeModules;
        pipeModules.then(modules => {
            modules.forEach(pipeModule => {
                this.pipeModules.push(pipeModule.name);
                this.sb.appendFormat(PipeModules.PIPEMODULE, pipeModule.name, pipeModule.code);
            });

            fs.appendFileSync(this.output, this.sb.toString());
            this.sb.clear();
        });
    }

    postWrite() {
        Promise.all(this.pipeModules).then(pathsModules => {
            let pipeModules = new Set();

            pathsModules.forEach(pathModules => {
                pathModules.forEach(pathModule => {
                    pipeModules.add(pathModule.name);
                })
            });

            this.sb.appendLine(Global.EXPORTS_START);

            pipeModules.forEach((pipeModule) => {
                this.sb.appendFormat(Global.EXPORT_OBJECT, pipeModule)
            });

            this.sb.appendLine(Global.EXPORTS_END);

            fs.appendFileSync(this.output, this.sb.toString());

            this.sb.clear();
        });
    }
};