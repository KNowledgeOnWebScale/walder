var ArrayIterator = require('../asynciterator').ArrayIterator;

var AsyncIterator = require('../asynciterator'),
    EventEmitter = require('events').EventEmitter;

describe('ArrayIterator', function () {
  describe('The ArrayIterator function', function () {
    describe('the result when called without `new`', function () {
      var instance;
      before(function () { instance = ArrayIterator(); });

      it('should be an ArrayIterator object', function () {
        instance.should.be.an.instanceof(ArrayIterator);
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
      before(function () { instance = new ArrayIterator(); });

      it('should be an ArrayIterator object', function () {
        instance.should.be.an.instanceof(ArrayIterator);
      });

      it('should be an AsyncIterator object', function () {
        instance.should.be.an.instanceof(AsyncIterator);
      });

      it('should be an EventEmitter object', function () {
        instance.should.be.an.instanceof(EventEmitter);
      });
    });

    describe('the result when called through `fromArray`', function () {
      var instance;
      before(function () { instance = AsyncIterator.fromArray(); });

      it('should be an ArrayIterator object', function () {
        instance.should.be.an.instanceof(ArrayIterator);
      });

      it('should be an AsyncIterator object', function () {
        instance.should.be.an.instanceof(AsyncIterator);
      });

      it('should be an EventEmitter object', function () {
        instance.should.be.an.instanceof(EventEmitter);
      });
    });
  });

  describe('An ArrayIterator without arguments', function () {
    var iterator;
    before(function () {
      iterator = new ArrayIterator();
      captureEvents(iterator, 'readable', 'end');
    });

    it('should provide a readable `toString` representation', function () {
      iterator.toString().should.equal('[ArrayIterator (0)]');
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

    it('should not have been destroyed', function () {
      iterator.destroyed.should.be.false;
    });

    it('should be done', function () {
      iterator.done.should.be.true;
    });

    it('should not be readable', function () {
      iterator.readable.should.be.false;
    });

    it('should return null when read is called', function () {
      expect(iterator.read()).to.be.null;
    });
  });

  describe('An ArrayIterator with a non-array', function () {
    var iterator;
    before(function () {
      iterator = new ArrayIterator({ foo: 1, bar: 2 });
      captureEvents(iterator, 'readable', 'end');
    });

    it('should provide a readable `toString` representation', function () {
      iterator.toString().should.equal('[ArrayIterator (0)]');
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

    it('should not have been destroyed', function () {
      iterator.destroyed.should.be.false;
    });

    it('should be done', function () {
      iterator.done.should.be.true;
    });

    it('should not be readable', function () {
      iterator.readable.should.be.false;
    });

    it('should return null when read is called', function () {
      expect(iterator.read()).to.be.null;
    });

    it('should return null when read is called', function () {
      expect(iterator.read()).to.be.null;
    });
  });

  describe('An ArrayIterator with an empty array', function () {
    var iterator;
    before(function () {
      iterator = new ArrayIterator([]);
      captureEvents(iterator, 'readable', 'end');
    });

    it('should provide a readable `toString` representation', function () {
      iterator.toString().should.equal('[ArrayIterator (0)]');
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

    it('should not have been destroyed', function () {
      iterator.destroyed.should.be.false;
    });

    it('should be done', function () {
      iterator.done.should.be.true;
    });

    it('should not be readable', function () {
      iterator.readable.should.be.false;
    });

    it('should return null when read is called', function () {
      expect(iterator.read()).to.be.null;
    });

    it('should return null when read is called', function () {
      expect(iterator.read()).to.be.null;
    });
  });

  describe('An ArrayIterator with a one-item array', function () {
    var iterator, item;
    before(function () {
      iterator = new ArrayIterator([1]);
      captureEvents(iterator, 'readable', 'end');
    });

    describe('before calling read', function () {
      it('should provide a readable `toString` representation', function () {
        iterator.toString().should.equal('[ArrayIterator (1)]');
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

      it('should not have been destroyed', function () {
        iterator.destroyed.should.be.false;
      });

      it('should not be done', function () {
        iterator.done.should.be.false;
      });

      it('should be readable', function () {
        iterator.readable.should.be.true;
      });
    });

    describe('after calling read for the first time', function () {
      before(function () { item = iterator.read(); });

      it('should provide a readable `toString` representation', function () {
        iterator.toString().should.equal('[ArrayIterator (0)]');
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

      it('should not have been destroyed', function () {
        iterator.destroyed.should.be.false;
      });

      it('should be done', function () {
        iterator.done.should.be.true;
      });

      it('should not be readable', function () {
        iterator.readable.should.be.false;
      });
    });
  });

  describe('An ArrayIterator with a three-item array', function () {
    var iterator, item;
    before(function () {
      iterator = new ArrayIterator([1, 2, 3]);
      captureEvents(iterator, 'readable', 'end');
    });

    describe('before calling read', function () {
      it('should provide a readable `toString` representation', function () {
        iterator.toString().should.equal('[ArrayIterator (3)]');
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

      it('should not have been destroyed', function () {
        iterator.destroyed.should.be.false;
      });

      it('should not be done', function () {
        iterator.done.should.be.false;
      });

      it('should be readable', function () {
        iterator.readable.should.be.true;
      });
    });

    describe('after calling read for the first time', function () {
      before(function () { item = iterator.read(); });

      it('should provide a readable `toString` representation', function () {
        iterator.toString().should.equal('[ArrayIterator (2)]');
      });

      it('should read the first item of the array', function () {
        item.should.equal(1);
      });

      it('should not have emitted the `end` event', function () {
        iterator._eventCounts.end.should.equal(0);
      });

      it('should not have ended', function () {
        iterator.ended.should.be.false;
      });

      it('should not have been destroyed', function () {
        iterator.destroyed.should.be.false;
      });

      it('should not be done', function () {
        iterator.done.should.be.false;
      });

      it('should be readable', function () {
        iterator.readable.should.be.true;
      });
    });

    describe('after calling read for the second time', function () {
      before(function () { item = iterator.read(); });

      it('should provide a readable `toString` representation', function () {
        iterator.toString().should.equal('[ArrayIterator (1)]');
      });

      it('should read the second item of the array', function () {
        item.should.equal(2);
      });

      it('should not have emitted the `end` event', function () {
        iterator._eventCounts.end.should.equal(0);
      });

      it('should not have ended', function () {
        iterator.ended.should.be.false;
      });

      it('should not have been destroyed', function () {
        iterator.destroyed.should.be.false;
      });

      it('should not be done', function () {
        iterator.done.should.be.false;
      });

      it('should be readable', function () {
        iterator.readable.should.be.true;
      });
    });

    describe('after calling read for the third time', function () {
      before(function () { item = iterator.read(); });

      it('should provide a readable `toString` representation', function () {
        iterator.toString().should.equal('[ArrayIterator (0)]');
      });

      it('should read the third item of the array', function () {
        item.should.equal(3);
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

      it('should not have been destroyed', function () {
        iterator.destroyed.should.be.false;
      });

      it('should be done', function () {
        iterator.done.should.be.true;
      });

      it('should not be readable', function () {
        iterator.readable.should.be.false;
      });
    });
  });

  describe('An ArrayIterator with a three-item array-like object', function () {
    var iterator, item;
    before(function () {
      iterator = new ArrayIterator({ length: '3', 0: 1, 1: 2, 2: 3 });
      captureEvents(iterator, 'readable', 'end');
    });

    describe('before calling read', function () {
      it('should provide a readable `toString` representation', function () {
        iterator.toString().should.equal('[ArrayIterator (3)]');
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

      it('should not have been destroyed', function () {
        iterator.destroyed.should.be.false;
      });

      it('should not be done', function () {
        iterator.done.should.be.false;
      });

      it('should be readable', function () {
        iterator.readable.should.be.true;
      });
    });

    describe('after calling read for the first time', function () {
      before(function () { item = iterator.read(); });

      it('should provide a readable `toString` representation', function () {
        iterator.toString().should.equal('[ArrayIterator (2)]');
      });

      it('should read the first item of the array', function () {
        item.should.equal(1);
      });

      it('should not have emitted the `end` event', function () {
        iterator._eventCounts.end.should.equal(0);
      });

      it('should not have ended', function () {
        iterator.ended.should.be.false;
      });

      it('should not have been destroyed', function () {
        iterator.destroyed.should.be.false;
      });

      it('should not be done', function () {
        iterator.done.should.be.false;
      });

      it('should be readable', function () {
        iterator.readable.should.be.true;
      });
    });

    describe('after calling read for the second time', function () {
      before(function () { item = iterator.read(); });

      it('should provide a readable `toString` representation', function () {
        iterator.toString().should.equal('[ArrayIterator (1)]');
      });

      it('should read the second item of the array', function () {
        item.should.equal(2);
      });

      it('should not have emitted the `end` event', function () {
        iterator._eventCounts.end.should.equal(0);
      });

      it('should not have ended', function () {
        iterator.ended.should.be.false;
      });

      it('should not have been destroyed', function () {
        iterator.destroyed.should.be.false;
      });

      it('should not be done', function () {
        iterator.done.should.be.false;
      });

      it('should be readable', function () {
        iterator.readable.should.be.true;
      });
    });

    describe('after calling read for the third time', function () {
      before(function () { item = iterator.read(); });

      it('should provide a readable `toString` representation', function () {
        iterator.toString().should.equal('[ArrayIterator (0)]');
      });

      it('should read the third item of the array', function () {
        item.should.equal(3);
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

      it('should not have been destroyed', function () {
        iterator.destroyed.should.be.false;
      });

      it('should be done', function () {
        iterator.done.should.be.true;
      });

      it('should not be readable', function () {
        iterator.readable.should.be.false;
      });
    });
  });

  describe('An ArrayIterator with an array that is modified afterwards', function () {
    var iterator, items;
    before(function () {
      var array = [1, 2, 3];
      iterator = new ArrayIterator(array);

      // Modify the array
      array[0] = 'a';
      array.pop();
      array.pop();

      items = [iterator.read(), iterator.read(), iterator.read(), iterator.read()];
    });

    it('should return the original items', function () {
      items.should.deep.equal([1, 2, 3, null]);
    });
  });

  describe('An ArrayIterator with a two-item array that is destroyed', function () {
    var iterator;
    before(function () {
      iterator = new ArrayIterator([1, 2]);
      captureEvents(iterator, 'readable', 'end');
      iterator.destroy();
    });

    it('should not have emitted a `readable` event', function () {
      iterator._eventCounts.readable.should.equal(0);
    });

    it('should not have emitted the `end` event', function () {
      iterator._eventCounts.end.should.equal(0);
    });

    it('should not have ended', function () {
      iterator.ended.should.be.false;
    });

    it('should have been destroyed', function () {
      iterator.destroyed.should.be.true;
    });

    it('should be done', function () {
      iterator.done.should.be.true;
    });

    it('should not be readable', function () {
      iterator.readable.should.be.false;
    });

    it('cannot be made readable again', function () {
      iterator.readable = true;
      iterator.readable.should.be.false;
    });

    it('should return null when trying to read', function () {
      expect(iterator.read()).to.be.null;
    });

    it('should not have any listeners for data, readable, or end', function () {
      expect(iterator._events).to.not.contain.key('data');
      expect(iterator._events).to.not.contain.key('readable');
      expect(iterator._events).to.not.contain.key('end');
    });

    it('should have an empty buffer', function () {
      expect(iterator._buffer).to.be.an('undefined');
    });

    describe('after destroy has been called a second time', function () {
      before(function () { iterator.destroy(); });

      it('should not have emitted a `readable` event', function () {
        iterator._eventCounts.readable.should.equal(0);
      });

      it('should not have emitted the `end` event a second time', function () {
        iterator._eventCounts.end.should.equal(0);
      });

      it('should not have ended', function () {
        iterator.ended.should.be.false;
      });

      it('should have been destroyed', function () {
        iterator.destroyed.should.be.true;
      });

      it('should be done', function () {
        iterator.done.should.be.true;
      });

      it('should not be readable', function () {
        iterator.readable.should.be.false;
      });

      it('should return null when trying to read', function () {
        expect(iterator.read()).to.be.null;
      });

      it('should not have any listeners for data, readable, or end', function () {
        expect(iterator._events).to.not.contain.key('data');
        expect(iterator._events).to.not.contain.key('readable');
        expect(iterator._events).to.not.contain.key('end');
      });

      it('should have an empty buffer', function () {
        expect(iterator._buffer).to.be.an('undefined');
      });
    });
  });
});
