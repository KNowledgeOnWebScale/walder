'use strict'

/* global describe, it */

var assert = require('assert')

function runTests (DataFactory) {
  describe('.blankNode', function () {
    it('should be a static method', function () {
      assert.equal(typeof DataFactory.blankNode, 'function')
    })

    it('should create an object with a termType property that contains the value "BlankNode"', function () {
      var term = DataFactory.blankNode()

      assert.equal(term.termType, 'BlankNode')
    })

    it('should create an object with a value property that contains a unique identifier', function () {
      var term1 = DataFactory.blankNode()
      var term2 = DataFactory.blankNode()

      assert.notEqual(term1.value, term2.value)
    })

    it('should create an object with a value property that contains the given identifier', function () {
      var id = 'b1'
      var term = DataFactory.blankNode(id)

      assert.equal(term.value, id)
    })

    describe('.equals', function () {
      it('should be a method', function () {
        var term = DataFactory.blankNode()

        assert.equal(typeof term.equals, 'function')
      })

      it('should return true if termType and value are equal', function () {
        var id = 'b1'
        var term = DataFactory.blankNode(id)
        var mock = {termType: 'BlankNode', value: id}

        assert.equal(term.equals(mock), true)
      })

      it('should return false if termType is not equal', function () {
        var id = 'b1'
        var term = DataFactory.blankNode(id)
        var mock = {termType: 'NamedNode', value: id}

        assert.equal(term.equals(mock), false)
      })

      it('should return false if value is not equal', function () {
        var id = 'b1'
        var term = DataFactory.blankNode(id)
        var mock = {termType: 'BlankNode', value: id + '1'}

        assert.equal(term.equals(mock), false)
      })

      it('should return false if value is falsy', function () {
        var id = 'b1'
        var term = DataFactory.blankNode(id)

        assert.equal(term.equals(null), false)
      })
    })
  })
}

module.exports = runTests
