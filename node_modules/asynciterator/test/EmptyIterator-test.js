var EmptyIterator = require('../asynciterator').EmptyIterator;

var AsyncIterator = require('../asynciterator'),
    EventEmitter = require('events').EventEmitter;

describe('EmptyIterator', function () {
  describe('The EmptyIterator function', function () {
    describe('the result when called without `new`', function () {
      var instance;
      before(function () { instance = EmptyIterator(); });

      it('should be an EmptyIterator object', function () {
        instance.should.be.an.instanceof(EmptyIterator);
      });

      it('should be an AsyncIterator object', function () {
        instance.should.be.an.instanceof(AsyncIterator);
      });

      it('should be an EventEmitter object', function () {
        instance.should.be.an.instanceof(EventEmitter);
      });
    });

    describe('the result when called with `new`', function () {
      var instance;
      before(function () { instance = new EmptyIterator(); });

      it('should be an EmptyIterator object', function () {
        instance.should.be.an.instanceof(EmptyIterator);
      });

      it('should be an AsyncIterator object', function () {
        instance.should.be.an.instanceof(AsyncIterator);
      });

      it('should be an EventEmitter object', function () {
        instance.should.be.an.instanceof(EventEmitter);
      });
    });

    describe('the result when called through `.empty`', function () {
      var instance;
      before(function () { instance = AsyncIterator.empty(); });

      it('should be an EmptyIterator object', function () {
        instance.should.be.an.instanceof(EmptyIterator);
      });

      it('should be an AsyncIterator object', function () {
        instance.should.be.an.instanceof(AsyncIterator);
      });

      it('should be an EventEmitter object', function () {
        instance.should.be.an.instanceof(EventEmitter);
      });
    });
  });

  describe('An EmptyIterator without arguments', function () {
    var iterator;
    before(function () {
      iterator = new EmptyIterator();
      captureEvents(iterator, 'readable', 'end');
    });

    it('should provide a readable `toString` representation', function () {
      iterator.toString().should.equal('[EmptyIterator]');
    });

    it('should not have emitted the `readable` event', function () {
      iterator._eventCounts.readable.should.equal(0);
    });

    it('should have emitted the `end` event', function () {
      iterator._eventCounts.end.should.equal(1);
    });

    it('should have ended', function () {
      iterator.ended.should.be.true;
    });

    it('should not be readable', function () {
      iterator.readable.should.be.false;
    });

    it('should return null when read is called', function () {
      expect(iterator.read()).to.be.null;
    });
  });
});
