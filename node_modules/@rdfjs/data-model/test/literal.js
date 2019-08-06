'use strict'

/* global describe, it */

var assert = require('assert')

function runTests (DataFactory) {
  describe('.literal', function () {
    it('should be a static method', function () {
      assert.equal(typeof DataFactory.literal, 'function')
    })

    it('should create an object with a termType property that contains the value "Literal"', function () {
      var term = DataFactory.literal()

      assert.equal(term.termType, 'Literal')
    })

    it('should create an object with a value property that contains the given string', function () {
      var string = 'example'
      var term = DataFactory.literal(string)

      assert.equal(term.value, string)
    })

    it('should create an object with a language property that contains an empty string', function () {
      var string = 'example'
      var term = DataFactory.literal(string)

      assert.equal(term.language, '')
    })

    it('should create an object with a language property that contains the given language string', function () {
      var string = 'example'
      var language = 'en'
      var term = DataFactory.literal(string, language)

      assert.equal(term.language, language)
    })

    it('should create an object with a datatype property that contains a NamedNode with the value "http://www.w3.org/2001/XMLSchema#string"', function () {
      var string = 'example'
      var term = DataFactory.literal(string)

      assert.equal(term.datatype.termType, 'NamedNode')
      assert.equal(term.datatype.value, 'http://www.w3.org/2001/XMLSchema#string')
    })

    it('should create an object with a datatype property that contains a NamedNode with the value "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString"', function () {
      var string = 'example'
      var language = 'en'
      var term = DataFactory.literal(string, language)

      assert.equal(term.datatype.termType, 'NamedNode')
      assert.equal(term.datatype.value, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString')
    })

    it('should create an object with a datatype property that contains a NamedNode with the given IRI', function () {
      var string = 'example'
      var datatypeIRI = 'http://example.org'
      var datatypeNode = DataFactory.namedNode(datatypeIRI)
      var term = DataFactory.literal(string, datatypeNode)

      assert.equal(term.datatype.termType, 'NamedNode')
      assert.equal(term.datatype.value, datatypeIRI)
    })

    it('should create an object with a datatype property that contains the given NamedNode', function () {
      var string = 'example'
      var datatype = {termType: 'NamedNode', value: 'http://example.org'}
      var term = DataFactory.literal(string, datatype)

      assert.equal(term.datatype.termType, 'NamedNode')
      assert.equal(term.datatype.value, datatype.value)
    })

    describe('.equals', function () {
      it('should be a method', function () {
        var term = DataFactory.literal('')

        assert.equal(typeof term.equals, 'function')
      })

      it('should return true if termType, value, language and datatype are equal', function () {
        var string = 'example'
        var language = 'en'
        var term = DataFactory.literal(string, language)
        var mock = {
          termType: 'Literal',
          value: string,
          language: language,
          datatype: DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString')
        }

        assert.equal(term.equals(mock), true)
      })

      it('should return false if termType is not equal', function () {
        var string = 'example'
        var language = 'en'
        var term = DataFactory.literal(string, language)
        var mock = {
          termType: 'NamedNode',
          value: string,
          language: language,
          datatype: DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString')
        }

        assert.equal(term.equals(mock), false)
      })

      it('should return false if value is not equal', function () {
        var string = 'example'
        var language = 'en'
        var term = DataFactory.literal(string, language)
        var mock = {
          termType: 'Literal',
          value: string + '1',
          language: language,
          datatype: DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString')
        }

        assert.equal(term.equals(mock), false)
      })

      it('should return false if language is not equal', function () {
        var string = 'example'
        var language = 'en'
        var term = DataFactory.literal(string, language)
        var mock = {
          termType: 'Literal',
          value: string,
          language: 'de',
          datatype: DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString')
        }

        assert.equal(term.equals(mock), false)
      })

      it('should return false if datatype is not equal', function () {
        var string = 'example'
        var language = 'en'
        var term = DataFactory.literal(string, language)
        var mock = {
          termType: 'Literal',
          value: string,
          language: language,
          datatype: DataFactory.namedNode('http://example.org')
        }

        assert.equal(term.equals(mock), false)
      })

      it('should return false if value is falsy', function () {
        var string = 'example'
        var language = 'en'
        var term = DataFactory.literal(string, language)

        assert.equal(term.equals(null), false)
      })
    })
  })
}

module.exports = runTests
