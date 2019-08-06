'use strict'

/* global describe, it */

var assert = require('assert')

function runTests (DataFactory) {
  describe('.namedNode', function () {
    it('should be a static method', function () {
      assert.equal(typeof DataFactory.namedNode, 'function')
    })

    it('should create an object with a termType property that contains the value "NamedNode"', function () {
      var iri = 'http://example.org'
      var term = DataFactory.namedNode(iri)

      assert.equal(term.termType, 'NamedNode')
    })

    it('should create an object with a value property that contains the given IRI', function () {
      var iri = 'http://example.org'
      var term = DataFactory.namedNode(iri)

      assert.equal(term.value, iri)
    })

    describe('.equals', function () {
      it('should be a method', function () {
        var iri = 'http://example.org'
        var term = DataFactory.namedNode(iri)

        assert.equal(typeof term.equals, 'function')
      })

      it('should return true if termType and value are equal', function () {
        var iri = 'http://example.org'
        var term = DataFactory.namedNode(iri)
        var mock = {termType: 'NamedNode', value: iri}

        assert.equal(term.equals(mock), true)
      })

      it('should return false if termType is not equal', function () {
        var iri = 'http://example.org'
        var term = DataFactory.namedNode(iri)
        var mock = {termType: 'BlankNode', value: iri}

        assert.equal(term.equals(mock), false)
      })

      it('should return false if value is not equal', function () {
        var iri = 'http://example.org'
        var term = DataFactory.namedNode(iri)
        var mock = {termType: 'NamedNode', value: iri + '1'}

        assert.equal(term.equals(mock), false)
      })

      it('should return false if value is falsy', function () {
        var iri = 'http://example.org'
        var term = DataFactory.namedNode(iri)

        assert.equal(term.equals(null), false)
      })
    })
  })
}

module.exports = runTests
