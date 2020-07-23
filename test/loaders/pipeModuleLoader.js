require('chai').should();
const Path = require('path');
const PipeModuleLoader = require('../../lib/loaders/pipeModuleLoader');

describe('PipeModuleLoader', function () {
  it('should return a list of {pipe functions, parameters}, given a list of pipe module objects {name, source, parameters}', function () {
    const pipeModules = [
      {
        "name": "filterT",
        "source": Path.resolve(__dirname, '../resources/filterT.js'),
        "parameters": []
      }];

    const pipeFunctions = PipeModuleLoader.load(pipeModules);

    pipeFunctions.should.be.a('Array');

    pipeFunctions.forEach(pipeFunction => {
      pipeFunction.function.should.be.a('function');
      pipeFunction.parameters.should.be.a('Array');
    })
  })
});
