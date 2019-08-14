require('chai').should();
const PipeModuleLoaer = require('../../loaders/pipeModuleLoader');

describe('PipeModuleLoader', function() {
  it('should return a list of pipe functions, given a list of pipe module objects {name, source}', function() {
    const pipeModules = [
      {
        "name": "filterT",
        "source": "walter/lib/test/resources/filterT.js"
      }];

    const pipeModuleLoader = new PipeModuleLoaer();

    const pipeFunctions = pipeModuleLoader.load(pipeModules);

    pipeFunctions.should.be.a('Array');

    pipeFunctions.forEach(pipeFunction => {
      pipeFunction.should.be.a('function');
    })
  })
});
