#!/usr/bin/env node

const Walter = require('../lib/walter');
const program = require('commander');
const utils = require('../lib/utils');

// CLI
program
  .version('0.0.2', '-v, --version')
  .option('-c, --config <configFile>', 'YAML configuration file input')
  .option('-p, --port <portNumber>', 'server port number (default: 3000)')
  .option('--no-cache', 'disable comunica default caching')
  .parse(process.argv);

if (!program.config) {
  utils.printError('Error:\n\t-c --config <configFile> required. Use -h for more info.');
}

const walter = new Walter(program.config, program.port, program.cache);
walter.activate();
