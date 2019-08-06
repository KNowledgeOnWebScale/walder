'use strict'

function runTests (rdf) {
  require('./named-node')(rdf)
  require('./blank-node')(rdf)
  require('./literal')(rdf)
  require('./default-graph')(rdf)
  require('./variable')(rdf)
  require('./triple')(rdf)
  require('./quad')(rdf)
}

if (global.rdf) {
  runTests(global.rdf)
}

module.exports = runTests
