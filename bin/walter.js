const walter = require('../lib/Walter');
const program = require('commander');

// CLI
program
  .version('0.0.1', '-v, --version')
  .option('-i, --input <configFile>', 'YAML configuration file input')
  .option('-p, --port <portNumber>', 'server port number (default: 3000)')
  .parse(process.argv);

if (!program.input) {
  console.error('\nError:\n\t--input <configFile> required. Use -h for more info.\n');
  process.exit(1);
}

walter.activate(program.input, program.port);
