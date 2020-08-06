#!/usr/bin/env node

const Walder = require('../lib/walder');
const program = require('commander');
const utils = require('../lib/utils');
const pjson = require('../package');

// CLI
program
  .version('v' + pjson.version, '-v, --version')
  .option('-c, --config <configFile>', 'YAML configuration file input')
  .option('-p, --port <portNumber>', 'server port number', 3000)
  .option('-l, --log <level>', 'enable logging and set logging level (one of [error, warn, info, verbose, debug])', 'info')
  .option('--no-cache', 'disable Comunica default caching')
  .parse(process.argv);

if (!program.config) {
  utils.printError('Error:\n\t-c --config <configFile> required. Use -h for more info.');
}

main();

async function main() {
  try {
    const walder = new Walder(program.config, {port: program.port, logging: program.log, cache: program.cache});
    await walder.activate();
  } catch (err) {
    // IO_INVALID_REF errors are handled in walder.js,
    // so we can ignore them and exit.
    if (err.type !== 'IO_INVALID_REF') {
      throw err;
    } else {
      process.exit(1);
    }
  }
}
