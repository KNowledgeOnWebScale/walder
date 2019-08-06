'use strict'

/* global describe, it */

var assert = require('assert')

function runTests (DataFactory) {
  // support for Variable is optional
  if (!DataFactory.variable) {
    return
  }

  describe('.variable', function () {
    it('should be a static method', function () {
      assert.equal(typeof DataFactory.variable, 'function')
    })

    it('should create an object with a termType property that contains the value "Variable"', function () {
      var name = 'v'
      var term = DataFactory.variable(name)

      assert.equal(term.termType, 'Variable')
    })

    it('should create an object with a value property that contains the given name', function () {
      var name = 'v'
      var term = DataFactory.variable(name)

      assert.equal(term.value, name)
    })

    describe('.equals', function () {
      it('should be a method', function () {
        var term = DataFactory.variable()

        assert.equal(typeof term.equals, 'function')
      })

      it('should return true if termType and value are equal', function () {
        var name = 'v'
        var term = DataFactory.variable(name)
        var mock = {termType: 'Variable', value: name}

        assert.equal(term.equals(mock), true)
      })

      it('should return false if termType is not equal', function () {
        var name = 'v'
        var term = DataFactory.variable(name)
        var mock = {termType: 'NamedNode', value: name}

        assert.equal(term.equals(mock), false)
      })

      it('should return false if value is not equal', function () {
        var name = 'v'
        var term = DataFactory.variable(name)
        var mock = {termType: 'Variable', value: name + '1'}

        assert.equal(term.equals(mock), false)
      })

      it('should return false if value is falsy', function () {
        var name = 'v'
        var term = DataFactory.variable(name)

        assert.equal(term.equals(null), false)
      })
    })
  })
}

module.exports = runTests
