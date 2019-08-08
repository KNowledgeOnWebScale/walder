'use strict';

const program = require('commander');
const fs = require('fs');
const spawn = require('child_process').spawn;
const generate = require('../lib/generator');

// CLI
program
    .version('0.0.1', '-v, --version')
    .option('-i, --input <configFile>', 'path to input YAML configuration file (required)')
    .option('-o, --output <outputDirectory>', 'path to desired output directory (default: CWD)')
    .option('-p, --port <portNumber>', 'application port number (default: 5656)')
    .option('-g, --generate', 'generate a package.json file')
    .parse(process.argv);


// Config file check
if (!program.input) {
    console.error('\nError:\n\t--input <configFile> required. Use -h for more info.\n');
    process.exit(1);
}
if (!fs.existsSync(program.input)) {
    console.error('\nError:\n\tGiven config file does not exist!\n');
    process.exit(1);
}


// Output files
let outputDirectory = '.';
if (program.output) {
    if (program.output.endsWith('/')) {
        outputDirectory = program.output.slice(0, -1);
    } else {
        outputDirectory = program.output;
    }

    // Create directory if it does not exist yet
    if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, {recursive: true});
    }
}

if (program.generate) {
    spawn('sh', ['lib/npmPackageInstaller.sh', outputDirectory], {
        stdio: 'inherit',
        cwd: process.cwd()
    });
}

let portNumber = 5656; // Default port number
if (program.port) {
    portNumber = program.port;
}

generate(program.input, outputDirectory, portNumber);