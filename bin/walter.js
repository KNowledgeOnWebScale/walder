#!/usr/bin/env node

const Walter = require('../lib/walter');
const program = require('commander');
const utils = require('../lib/utils');

// CLI
program
  .version('0.0.2', '-v, --version')
  .option('-c, --config <configFile>', 'YAML configuration file input')
  .option('-p, --port [portNumber]', 'server port number', 3000)
  .option('-l, --log [level]', 'enable logging and set logging level (one of [error, warn, info, verbose, debug])', 'info')
  .option('--no-cache', 'disable comunica default caching')
  .parse(process.argv);

if (!program.config) {
  utils.printError('Error:\n\t-c --config <configFile> required. Use -h for more info.');
}

const walter = new Walter(program.config, program.port, program.log, program.cache);
walter.activate();
