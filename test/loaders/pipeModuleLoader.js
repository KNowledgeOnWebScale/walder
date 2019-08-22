require('chai').should();
const Path = require('path');
const PipeModuleLoader = require('../../lib/loaders/pipeModuleLoader');

describe('PipeModuleLoader', function () {
  it('should return a list of pipe functions, given a list of pipe module objects {name, source}', function () {
    const pipeModules = [
      {
        "name": "filterT",
        "source": Path.resolve(__dirname, '../resources/filterT.js')
      }];

    const pipeModuleLoader = new PipeModuleLoader();

    const pipeFunctions = pipeModuleLoader.load(pipeModules);

    pipeFunctions.should.be.a('Array');

    pipeFunctions.forEach(pipeFunction => {
      pipeFunction.should.be.a('function');
    })
  })
});
