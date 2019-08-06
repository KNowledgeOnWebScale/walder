// Set up the Chai assertion library
var chai = require('chai');
global.sinon = require('sinon');
global.should = chai.should();
global.expect = chai.expect;

chai.use(require('sinon-chai'));

// Captures the number of times an event has been emitted
global.captureEvents = function (item) {
  var counts = item._eventCounts = Object.create(null);
  for (var i = 1; i < arguments.length; i++)
    addIncrementListener(arguments[i]);
  function addIncrementListener(e) { counts[e] = 0; item.on(e, function () { counts[e]++; }); }
  return item;
};
