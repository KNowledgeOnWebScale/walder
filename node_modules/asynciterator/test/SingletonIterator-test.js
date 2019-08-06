var SingletonIterator = require('../asynciterator').SingletonIterator;

var AsyncIterator = require('../asynciterator'),
    EventEmitter = require('events').EventEmitter;

describe('SingletonIterator', function () {
  describe('The SingletonIterator function', function () {
    describe('the result when called without `new`', function () {
      var instance;
      before(function () { instance = SingletonIterator(); });

      it('should be a SingletonIterator object', function () {
        instance.should.be.an.instanceof(SingletonIterator);
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
      before(function () { instance = new SingletonIterator(); });

      it('should be a SingletonIterator object', function () {
        instance.should.be.an.instanceof(SingletonIterator);
      });

      it('should be an AsyncIterator object', function () {
        instance.should.be.an.instanceof(AsyncIterator);
      });

      it('should be an EventEmitter object', function () {
        instance.should.be.an.instanceof(EventEmitter);
      });
    });

    describe('the result when called through `single`', function () {
      var instance;
      before(function () { instance = AsyncIterator.single(); });

      it('should be a SingletonIterator object', function () {
        instance.should.be.an.instanceof(SingletonIterator);
      });

      it('should be an AsyncIterator object', function () {
        instance.should.be.an.instanceof(AsyncIterator);
      });

      it('should be an EventEmitter object', function () {
        instance.should.be.an.instanceof(EventEmitter);
      });
    });
  });

  describe('An SingletonIterator without item', function () {
    var iterator;
    before(function () {
      iterator = new SingletonIterator(null);
      captureEvents(iterator, 'readable', 'end');
    });

    it('should provide a readable `toString` representation', function () {
      iterator.toString().should.equal('[SingletonIterator]');
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

  describe('An SingletonIterator with an item', function () {
    var iterator, item;
    before(function () {
      iterator = new SingletonIterator(1);
      captureEvents(iterator, 'readable', 'end');
    });

    describe('before calling read', function () {
      it('should provide a readable `toString` representation', function () {
        iterator.toString().should.equal('[SingletonIterator (1)]');
      });

      it('should have emitted the `readable` event', function () {
        iterator._eventCounts.readable.should.equal(1);
      });

      it('should not have emitted the `end` event', function () {
        iterator._eventCounts.end.should.equal(0);
      });

      it('should not have ended', function () {
        iterator.ended.should.be.false;
      });

      it('should be readable', function () {
        iterator.readable.should.be.true;
      });
    });

    describe('after calling read for the first time', function () {
      before(function () { item = iterator.read(); });

      it('should provide a readable `toString` representation', function () {
        iterator.toString().should.equal('[SingletonIterator]');
      });

      it('should read the first item of the array', function () {
        item.should.equal(1);
      });

      it('should return null when read is called again', function () {
        expect(iterator.read()).to.be.null;
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
    });
  });
});
