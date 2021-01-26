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
    // errors with some given types are handled already and shouldn't be thrown with a stacktrace etc.
    if (['IO_INVALID_REF', 'VALIDATION_ERROR'].includes(err.type)) {
      process.exit(1);
    } else {
      throw err;
    }
  }
}
