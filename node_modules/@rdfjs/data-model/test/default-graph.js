'use strict'

/* global describe, it */

var assert = require('assert')

function runTests (DataFactory) {
  describe('.defaultGraph', function () {
    it('should be a static method', function () {
      assert.equal(typeof DataFactory.defaultGraph, 'function')
    })

    it('should create an object with a termType property that contains the value "DefaultGraph"', function () {
      var term = DataFactory.defaultGraph()

      assert.equal(term.termType, 'DefaultGraph')
    })

    it('should create an object with a value property that contains an empty string', function () {
      var term = DataFactory.defaultGraph()

      assert.equal(term.value, '')
    })

    describe('.equals', function () {
      it('should be a method', function () {
        var term = DataFactory.defaultGraph()

        assert.equal(typeof term.equals, 'function')
      })

      it('should return true if termType and value are equal', function () {
        var term = DataFactory.defaultGraph()
        var mock = {termType: 'DefaultGraph', value: ''}

        assert.equal(term.equals(mock), true)
      })

      it('should return false if termType is not equal', function () {
        var term = DataFactory.defaultGraph()
        var mock = {termType: 'NamedNode', value: ''}

        assert.equal(term.equals(mock), false)
      })

      it('should return false if value is falsy', function () {
        var term = DataFactory.defaultGraph()

        assert.equal(term.equals(null), false)
      })
    })
  })
}

module.exports = runTests
