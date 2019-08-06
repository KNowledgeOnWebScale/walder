'use strict'

/* global describe, it */

var assert = require('assert')

function runTests (DataFactory) {
  describe('.triple', function () {
    it('should be a static method', function () {
      assert.equal(typeof DataFactory.triple, 'function')
    })

    it('should create an object with .subject, .predicate and .object with the given values and .graph set to DefaultGraph', function () {
      var subject = DataFactory.namedNode('http://example.org/subject')
      var predicate = DataFactory.namedNode('http://example.org/predicate')
      var object = DataFactory.namedNode('http://example.org/object')
      var triple = DataFactory.triple(subject, predicate, object)

      assert.equal(subject.equals(triple.subject), true)
      assert.equal(predicate.equals(triple.predicate), true)
      assert.equal(object.equals(triple.object), true)
      assert.equal(DataFactory.defaultGraph().equals(triple.graph), true)
    })

    it('should ignore a 4th parameter and always use DefaultGraph', function () {
      var subject = DataFactory.namedNode('http://example.org/subject')
      var predicate = DataFactory.namedNode('http://example.org/predicate')
      var object = DataFactory.namedNode('http://example.org/object')
      var graph = DataFactory.namedNode('http://example.org/graph')
      var triple = DataFactory.triple(subject, predicate, object, graph)

      assert.equal(DataFactory.defaultGraph().equals(triple.graph), true)
    })

    describe('.equals', function () {
      it('should return true if the other triple contains the same subject, predicate and object', function () {
        var subject = DataFactory.namedNode('http://example.org/subject')
        var predicate = DataFactory.namedNode('http://example.org/predicate')
        var object = DataFactory.namedNode('http://example.org/object')
        var triple1 = DataFactory.triple(subject, predicate, object)
        var triple2 = DataFactory.triple(subject, predicate, object)

        assert.equal(triple1.equals(triple2), true)
      })

      it('should return false if the subject of the other triple is not the same', function () {
        var subject1 = DataFactory.namedNode('http://example.org/subject')
        var subject2 = DataFactory.namedNode('http://example.com/subject')
        var predicate = DataFactory.namedNode('http://example.org/predicate')
        var object = DataFactory.namedNode('http://example.org/object')
        var triple1 = DataFactory.triple(subject1, predicate, object)
        var triple2 = DataFactory.triple(subject2, predicate, object)

        assert.equal(triple1.equals(triple2), false)
      })

      it('should return false if the predicate of the other triple is not the same', function () {
        var subject = DataFactory.namedNode('http://example.org/subject')
        var predicate1 = DataFactory.namedNode('http://example.org/predicate')
        var predicate2 = DataFactory.namedNode('http://example.com/predicate')
        var object = DataFactory.namedNode('http://example.org/object')
        var triple1 = DataFactory.triple(subject, predicate1, object)
        var triple2 = DataFactory.triple(subject, predicate2, object)

        assert.equal(triple1.equals(triple2), false)
      })

      it('should return false if the object of the other triple is not the same', function () {
        var subject = DataFactory.namedNode('http://example.org/subject')
        var predicate = DataFactory.namedNode('http://example.org/predicate')
        var object1 = DataFactory.namedNode('http://example.org/object')
        var object2 = DataFactory.namedNode('http://example.com/object')
        var triple1 = DataFactory.triple(subject, predicate, object1)
        var triple2 = DataFactory.triple(subject, predicate, object2)

        assert.equal(triple1.equals(triple2), false)
      })

      it('should return false if the graph of the other quad is not the same', function () {
        var subject = DataFactory.namedNode('http://example.org/subject')
        var predicate = DataFactory.namedNode('http://example.org/predicate')
        var object = DataFactory.namedNode('http://example.org/object')
        var graph = DataFactory.namedNode('http://example.org/graph')
        var triple = DataFactory.triple(subject, predicate, object)
        var quad = DataFactory.quad(subject, predicate, object, graph)

        assert.equal(triple.equals(quad), false)
      })

      it('should return false if value is falsy', function () {
        var subject = DataFactory.namedNode('http://example.org/subject')
        var predicate = DataFactory.namedNode('http://example.org/predicate')
        var object = DataFactory.namedNode('http://example.org/object')
        var triple = DataFactory.triple(subject, predicate, object)

        assert.equal(triple.equals(null), false)
      })
    })
  })
}

module.exports = runTests
