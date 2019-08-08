const Writer = require('./writer');
const fs = require('fs');

const Global = require('../resources/global');
const PipeModules = require('../resources/pipeModules');

/**
 * Writes the pipe module sections.
 *
 * @type {module.PipeModuleWriter}
 */
module.exports = class PipeModuleWriter extends Writer {
    constructor(output) {
        super(output);
        this.pipeModules = [];
        this.prevModules = [];
    }

    preWrite() {
        this.sb.append(PipeModules.PIPE_FUNCTION);

        super.preWrite();
    }

    async write(pipeModules, loadingPipeModules) {
        this.prevModules = pipeModules;
        this.pipeModules = this.pipeModules.concat(loadingPipeModules);
        await loadingPipeModules;
        loadingPipeModules.then(modules => {
            modules.forEach(pipeModule => {
                if (!this.pipeModules.includes(pipeModule.name)) {
                    this.pipeModules.push(pipeModule.name);
                    this.sb.appendFormat(PipeModules.PIPE_MODULE, pipeModule.name, pipeModule.code);
                }
            });

            super.write();
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

            this.sb.appendFormat(Global.EXPORT_OBJECT, PipeModules.PIPE_FUNCTION_NAME);

            pipeModules.forEach((pipeModule) => {
                this.sb.appendFormat(Global.EXPORT_OBJECT, pipeModule)
            });

            this.sb.appendLine(Global.EXPORTS_END);

            super.postWrite();
        });
    }

    writePipeExecution(sb) {
        sb.appendLine(PipeModules.PIPE_START);
        this.prevModules.forEach(module => {
            sb.appendFormat(PipeModules.PIPE_OBJECT, module.name);
        });
        sb.appendFormat(PipeModules.PIPE_END, 'data');
    }
};