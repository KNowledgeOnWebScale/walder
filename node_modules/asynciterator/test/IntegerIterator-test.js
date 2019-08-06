var IntegerIterator = require('../asynciterator').IntegerIterator;

var AsyncIterator = require('../asynciterator'),
    EventEmitter = require('events').EventEmitter;

describe('IntegerIterator', function () {
  describe('The IntegerIterator function', function () {
    describe('the result when called without `new`', function () {
      var instance;
      before(function () { instance = IntegerIterator(); });

      it('should be an IntegerIterator object', function () {
        instance.should.be.an.instanceof(IntegerIterator);
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
      before(function () { instance = new IntegerIterator(); });

      it('should be an IntegerIterator object', function () {
        instance.should.be.an.instanceof(IntegerIterator);
      });

      it('should be an AsyncIterator object', function () {
        instance.should.be.an.instanceof(AsyncIterator);
      });

      it('should be an EventEmitter object', function () {
        instance.should.be.an.instanceof(EventEmitter);
      });
    });
  });

  describe('An IntegerIterator without arguments', function () {
    var iterator;
    before(function () {
      iterator = new IntegerIterator();
      captureEvents(iterator, 'readable', 'end');
    });

    it('should provide a readable `toString` representation', function () {
      iterator.toString().should.equal('[IntegerIterator (0...Infinity)]');
    });

    describe('before reading', function () {
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

    describe('when reading items', function () {
      it('should return 0 on read call 1', function () {
        expect(iterator.read()).to.equal(0);
      });

      it('should return 1 on read call 2', function () {
        expect(iterator.read()).to.equal(1);
      });

      it('should return 2 on read call 3', function () {
        expect(iterator.read()).to.equal(2);
      });

      it('should not have emitted more `readable` events', function () {
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
  });

  describe('An IntegerIterator from -5 to 10 in steps of 5', function () {
    var iterator;
    before(function () {
      iterator = new IntegerIterator({ start: -5, end: 10, step: 5 });
      captureEvents(iterator, 'readable', 'end');
    });

    it('should provide a readable `toString` representation', function () {
      iterator.toString().should.equal('[IntegerIterator (-5...10)]');
    });

    describe('before reading', function () {
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

    describe('when reading items', function () {
      it('should return -5 on read call 1', function () {
        expect(iterator.read()).to.equal(-5);
      });

      it('should return 0 on read call 2', function () {
        expect(iterator.read()).to.equal(0);
      });

      it('should return 5 on read call 3', function () {
        expect(iterator.read()).to.equal(5);
      });

      it('should not have emitted more `readable` events', function () {
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

    describe('when reading the final item', function () {
      it('should return 10 on read call 4', function () {
        expect(iterator.read()).to.equal(10);
      });

      it('should not have emitted more `readable` events', function () {
        iterator._eventCounts.readable.should.equal(1);
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

      it('should return null on read call 5', function () {
        expect(iterator.read()).to.equal(null);
      });
    });
  });

  describe('An IntegerIterator from 10 to -5 in steps of 5', function () {
    var iterator;
    before(function () {
      iterator = AsyncIterator.range(10, -5, 5);
      captureEvents(iterator, 'readable', 'end');
    });

    it('should provide a readable `toString` representation', function () {
      iterator.toString().should.equal('[IntegerIterator (10...-5)]');
    });

    describe('before reading', function () {
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
        expect(iterator.read()).to.equal(null);
      });
    });
  });

  describe('An IntegerIterator from 10 to -5 in steps of -5', function () {
    var iterator;
    before(function () {
      iterator = new IntegerIterator({ start: 10, end: -5, step: -5 });
      captureEvents(iterator, 'readable', 'end');
    });

    it('should provide a readable `toString` representation', function () {
      iterator.toString().should.equal('[IntegerIterator (10...-5)]');
    });

    describe('before reading', function () {
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

    describe('when reading items', function () {
      it('should return 10 on read call 1', function () {
        expect(iterator.read()).to.equal(10);
      });

      it('should return 5 on read call 2', function () {
        expect(iterator.read()).to.equal(5);
      });

      it('should return 0 on read call 3', function () {
        expect(iterator.read()).to.equal(0);
      });

      it('should not have emitted more `readable` events', function () {
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

    describe('when reading the final item', function () {
      it('should return -5 on read call 4', function () {
        expect(iterator.read()).to.equal(-5);
      });

      it('should not have emitted more `readable` events', function () {
        iterator._eventCounts.readable.should.equal(1);
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

      it('should return null on read call 5', function () {
        expect(iterator.read()).to.equal(null);
      });
    });
  });

  describe('An IntegerIterator starting at Infinity', function () {
    var iterator;
    before(function () {
      iterator = new IntegerIterator({ start: Infinity });
      captureEvents(iterator, 'readable', 'end');
    });

    it('should provide a readable `toString` representation', function () {
      iterator.toString().should.equal('[IntegerIterator (Infinity...Infinity)]');
    });

    describe('before reading', function () {
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
        expect(iterator.read()).to.equal(null);
      });
    });
  });

  describe('An IntegerIterator starting at -Infinity', function () {
    var iterator;
    before(function () {
      iterator = new IntegerIterator({ start: -Infinity });
      captureEvents(iterator, 'readable', 'end');
    });

    it('should provide a readable `toString` representation', function () {
      iterator.toString().should.equal('[IntegerIterator (-Infinity...Infinity)]');
    });

    describe('before reading', function () {
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
        expect(iterator.read()).to.equal(null);
      });
    });
  });

  describe('An IntegerIterator stopping at -Infinity', function () {
    var iterator;
    before(function () {
      iterator = new IntegerIterator({ end: -Infinity });
      captureEvents(iterator, 'readable', 'end');
    });

    it('should provide a readable `toString` representation', function () {
      iterator.toString().should.equal('[IntegerIterator (0...-Infinity)]');
    });

    describe('before reading', function () {
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
        expect(iterator.read()).to.equal(null);
      });
    });
  });
});
