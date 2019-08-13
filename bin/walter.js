const Walter = require('../lib/walter');
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

let port = 3000;
if (program.port) {
  port = program.port;
}

const walter = new Walter(program.input, port);
walter.activate();
