var SimpleTransformIterator = require('../asynciterator').SimpleTransformIterator;

var AsyncIterator = require('../asynciterator'),
    TransformIterator = AsyncIterator.TransformIterator,
    BufferedIterator = AsyncIterator.BufferedIterator,
    EmptyIterator = AsyncIterator.EmptyIterator,
    ArrayIterator = AsyncIterator.ArrayIterator,
    IntegerIterator = AsyncIterator.IntegerIterator,
    EventEmitter = require('events').EventEmitter;

describe('SimpleTransformIterator', function () {
  describe('The SimpleTransformIterator function', function () {
    describe('the result when called without `new`', function () {
      var instance;
      before(function () { instance = SimpleTransformIterator(); });

      it('should be a SimpleTransformIterator object', function () {
        instance.should.be.an.instanceof(SimpleTransformIterator);
      });

      it('should be a TransformIterator object', function () {
        instance.should.be.an.instanceof(TransformIterator);
      });

      it('should be a BufferedIterator object', function () {
        instance.should.be.an.instanceof(BufferedIterator);
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
      before(function () { instance = new SimpleTransformIterator(); });

      it('should be a SimpleTransformIterator object', function () {
        instance.should.be.an.instanceof(SimpleTransformIterator);
      });

      it('should be a TransformIterator object', function () {
        instance.should.be.an.instanceof(TransformIterator);
      });

      it('should be a BufferedIterator object', function () {
        instance.should.be.an.instanceof(BufferedIterator);
      });

      it('should be an AsyncIterator object', function () {
        instance.should.be.an.instanceof(AsyncIterator);
      });

      it('should be an EventEmitter object', function () {
        instance.should.be.an.instanceof(EventEmitter);
      });
    });
  });

  describe('A SimpleTransformIterator without options', function () {
    var iterator, source;
    before(function () {
      source = new ArrayIterator(['a', 'b', 'c']);
      iterator = new SimpleTransformIterator(source);
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should return items as they are', function () {
        items.should.deep.equal(['a', 'b', 'c']);
      });
    });
  });

  describe('A SimpleTransformIterator with a map function', function () {
    var iterator, source, map;
    before(function () {
      var i = 0;
      source = new ArrayIterator(['a', 'b', 'c']);
      map = sinon.spy(function (item) { return item + (++i); });
      iterator = new SimpleTransformIterator(source, { map: map });
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should execute the map function on all items in order', function () {
        items.should.deep.equal(['a1', 'b2', 'c3']);
      });

      it('should have called the map function once for each item', function () {
        map.should.have.been.calledThrice;
      });

      it('should have called the map function with the iterator as `this`', function () {
        map.alwaysCalledOn(iterator).should.be.true;
      });
    });
  });

  describe('A SimpleTransformIterator with a map function that returns null', function () {
    var iterator, source, map;
    before(function () {
      var i = 0;
      source = new ArrayIterator(['a', 'b', 'c']);
      map = sinon.spy(function (item) {
        if (++i === 2)
          return null;
        else
          return item + i;
      });
      iterator = new SimpleTransformIterator(source, { map: map });
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should execute the map function on all items in order, skipping null', function () {
        items.should.deep.equal(['a1', 'c3']);
      });

      it('should have called the map function once for each item', function () {
        map.should.have.been.calledThrice;
      });

      it('should have called the map function with the iterator as `this`', function () {
        map.alwaysCalledOn(iterator).should.be.true;
      });
    });
  });

  describe('A SimpleTransformIterator with a transform function', function () {
    var iterator, source, transform;
    before(function () {
      var i = 0;
      source = new ArrayIterator(['a', 'b', 'c']);
      transform = sinon.spy(function (item, done) { this._push(item + (++i)); done(); });
      iterator = new SimpleTransformIterator(source, { transform: transform });
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should execute the transform function on all items in order', function () {
        items.should.deep.equal(['a1', 'b2', 'c3']);
      });

      it('should have called the transform function once for each item', function () {
        transform.should.have.been.calledThrice;
      });

      it('should have called the transform function with the iterator as `this`', function () {
        transform.alwaysCalledOn(iterator).should.be.true;
      });
    });
  });

  describe('A SimpleTransformIterator with a transform function as only option', function () {
    var iterator, source, transform;
    before(function () {
      var i = 0;
      source = new ArrayIterator(['a', 'b', 'c']);
      transform = sinon.spy(function (item, done) {
        this._push(item + (++i));
        setImmediate(done);
      });
      iterator = new SimpleTransformIterator(source, transform);
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should execute the transform function on all items in order', function () {
        items.should.deep.equal(['a1', 'b2', 'c3']);
      });

      it('should have called the transform function once for each item', function () {
        transform.should.have.been.calledThrice;
      });

      it('should have called the transform function with the iterator as `this`', function () {
        transform.alwaysCalledOn(iterator).should.be.true;
      });
    });
  });

  describe('A SimpleTransformIterator with a transform function that skips many items', function () {
    var iterator, source, transform, i = 1;
    before(function () {
      source = new AsyncIterator();
      source.read = sinon.spy(function () { return i++; });
      transform = function (item, done) {
        if (item % 10 === 0)
          this._push(item);
        done();
      };
      iterator = new SimpleTransformIterator(source, transform);
      captureEvents(iterator, 'readable', 'end');
    });

    describe('before reading an item', function () {
      it('should have called `read` on the source', function () {
        source.read.should.have.been.called;
      });

      it('should have emitted the `readable` event', function () {
        iterator._eventCounts.readable.should.equal(1);
      });

      it('should not have emitted the `end` event', function () {
        iterator._eventCounts.end.should.equal(0);
      });

      it('should be readable', function () {
        iterator.readable.should.be.true;
      });

      it('should not have ended', function () {
        iterator.ended.should.be.false;
      });
    });

    describe('after reading a first item', function () {
      var item;
      before(function () {
        item = iterator.read();
      });

      it('should read the correct item', function () {
        item.should.equal(10);
      });

      it('should have called `read` on the source until it had sufficient items', function () {
        source.read.should.have.callCount(50);
      });

      it('should not have emitted the `end` event', function () {
        iterator._eventCounts.end.should.equal(0);
      });

      it('should be readable', function () {
        iterator.readable.should.be.true;
      });

      it('should not have ended', function () {
        iterator.ended.should.be.false;
      });
    });

    describe('after reading a second item', function () {
      var item;
      before(function () {
        item = iterator.read();
      });

      it('should read the correct item', function () {
        item.should.equal(20);
      });

      it('should have called `read` on the source until it had sufficient items', function () {
        source.read.should.have.callCount(60);
      });

      it('should not have emitted the `end` event', function () {
        iterator._eventCounts.end.should.equal(0);
      });

      it('should be readable', function () {
        iterator.readable.should.be.true;
      });

      it('should not have ended', function () {
        iterator.ended.should.be.false;
      });
    });
  });

  describe('A SimpleTransformIterator with a transform function that closes', function () {
    var iterator, source, transform;
    before(function () {
      source = new AsyncIterator();
      source.read = sinon.spy(function () { return 1; });
      transform = function (item, done) {
        this._push(item);
        this.close();
        done();
      };
      iterator = new SimpleTransformIterator(source, transform);
      captureEvents(iterator, 'readable', 'end');
    });

    describe('before reading an item', function () {
      it('should have called `read` on the source', function () {
        source.read.should.have.been.called;
      });

      it('should have emitted the `readable` event', function () {
        iterator._eventCounts.readable.should.equal(1);
      });

      it('should not have emitted the `end` event', function () {
        iterator._eventCounts.end.should.equal(0);
      });

      it('should be readable', function () {
        iterator.readable.should.be.true;
      });

      it('should not have ended', function () {
        iterator.ended.should.be.false;
      });
    });

    describe('after reading a first item', function () {
      var item;
      before(function () {
        item = iterator.read();
      });

      it('should read the correct item', function () {
        item.should.equal(1);
      });

      it('should have called `read` on the source only once', function () {
        source.read.should.have.been.calledOnce;
      });

      it('should have emitted the `end` event', function () {
        iterator._eventCounts.end.should.equal(1);
      });

      it('should not be readable', function () {
        iterator.readable.should.be.false;
      });

      it('should have ended', function () {
        iterator.ended.should.be.true;
      });
    });
  });

  describe('A SimpleTransformIterator with a filter function', function () {
    var iterator, source, filter;
    before(function () {
      source = new ArrayIterator(['a', 'b', 'c']);
      filter = sinon.spy(function (item) { return item !== 'b'; });
      iterator = new SimpleTransformIterator(source, { filter: filter });
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should execute the filter function on all items in order', function () {
        items.should.deep.equal(['a', 'c']);
      });

      it('should have called the filter function once for each item', function () {
        filter.should.have.been.calledThrice;
      });

      it('should have called the filter function with the iterator as `this`', function () {
        filter.alwaysCalledOn(iterator).should.be.true;
      });
    });
  });

  describe('A SimpleTransformIterator with a prepend array', function () {
    var iterator, source, prepend;
    before(function () {
      source = new ArrayIterator(['a', 'b', 'c']);
      prepend = ['i', 'ii', 'iii'];
      iterator = new SimpleTransformIterator(source, { prepend: prepend });
      prepend.push(['iiii']); // modify array to verify it is copied
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should prepend the items to the regular items', function () {
        items.should.deep.equal(['i', 'ii', 'iii', 'a', 'b', 'c']);
      });
    });
  });

  describe('A SimpleTransformIterator with a prepend iterator', function () {
    var iterator, source, prepend;
    before(function () {
      source = new ArrayIterator(['a', 'b', 'c']);
      prepend = new ArrayIterator(['i', 'ii', 'iii']);
      iterator = new SimpleTransformIterator(source, { prepend: prepend });
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should prepend the items to the regular items', function () {
        items.should.deep.equal(['i', 'ii', 'iii', 'a', 'b', 'c']);
      });
    });
  });

  describe('A SimpleTransformIterator with a prepend iterator that ended', function () {
    var iterator, source, prepend;
    before(function () {
      source = new ArrayIterator(['a', 'b', 'c']);
      prepend = new EmptyIterator();
      iterator = new SimpleTransformIterator(source, { prepend: prepend });
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should return items as they are', function () {
        items.should.deep.equal(['a', 'b', 'c']);
      });
    });
  });

  describe('A SimpleTransformIterator with an append array', function () {
    var iterator, source, append;
    before(function () {
      source = new ArrayIterator(['a', 'b', 'c']);
      append = ['I', 'II', 'III'];
      iterator = new SimpleTransformIterator(source, { append: append });
      append.push(['IIII']); // modify array to verify it is copied
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should append the items to the regular items', function () {
        items.should.deep.equal(['a', 'b', 'c', 'I', 'II', 'III']);
      });
    });
  });

  describe('A SimpleTransformIterator with an append iterator', function () {
    var iterator, source, append;
    before(function () {
      source = new ArrayIterator(['a', 'b', 'c']);
      append = new ArrayIterator(['I', 'II', 'III']);
      iterator = new SimpleTransformIterator(source, { append: append });
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should append the items to the regular items', function () {
        items.should.deep.equal(['a', 'b', 'c', 'I', 'II', 'III']);
      });
    });
  });

  describe('A SimpleTransformIterator with an append iterator that ended', function () {
    var iterator, source, append;
    before(function () {
      source = new ArrayIterator(['a', 'b', 'c']);
      append = new EmptyIterator();
      iterator = new SimpleTransformIterator(source, { append: append });
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should return items as they are', function () {
        items.should.deep.equal(['a', 'b', 'c']);
      });
    });
  });

  describe('A SimpleTransformIterator with an offset of 0', function () {
    var iterator, source;
    before(function () {
      source = new IntegerIterator({ start: 1, end: 10 });
      sinon.spy(source, 'read');
      iterator = new SimpleTransformIterator(source, { offset: 0 });
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should call `read` on the source 11 times', function () {
        source.read.should.have.callCount(11);
      });

      it('should result in all items', function () {
        items.should.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      });
    });
  });

  describe('A SimpleTransformIterator with an offset of 5', function () {
    var iterator, source;
    before(function () {
      source = new IntegerIterator({ start: 1, end: 10 });
      sinon.spy(source, 'read');
      iterator = new SimpleTransformIterator(source, { offset: 5 });
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should call `read` on the source 11 times', function () {
        source.read.should.have.callCount(11);
      });

      it('should result in skipping the first 5 items', function () {
        items.should.deep.equal([6, 7, 8, 9, 10]);
      });
    });
  });

  describe('A SimpleTransformIterator with an offset of +Infinity', function () {
    var iterator, source;
    before(function () {
      source = new IntegerIterator({ start: 1, end: 10 });
      sinon.spy(source, 'read');
      iterator = new SimpleTransformIterator(source, { offset: Infinity });
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should not call `read` on the source', function () {
        source.read.should.not.have.been.called;
      });

      it('should not result in any items', function () {
        items.should.deep.equal([]);
      });
    });
  });

  describe('A SimpleTransformIterator with a negative offset', function () {
    var iterator, source;
    before(function () {
      source = new IntegerIterator({ start: 1, end: 10 });
      sinon.spy(source, 'read');
      iterator = new SimpleTransformIterator(source, { offset: -1 });
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should call `read` on the source 11 times', function () {
        source.read.should.have.callCount(11);
      });

      it('should result in all items', function () {
        items.should.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      });
    });
  });

  describe('A SimpleTransformIterator with an offset of -Infinity', function () {
    var iterator, source;
    before(function () {
      source = new IntegerIterator({ start: 1, end: 10 });
      sinon.spy(source, 'read');
      iterator = new SimpleTransformIterator(source, { offset: -Infinity });
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should call `read` on the source 11 times', function () {
        source.read.should.have.callCount(11);
      });

      it('should result in all items', function () {
        items.should.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      });
    });
  });

  describe('A SimpleTransformIterator with a limit of 0', function () {
    var iterator, source;
    before(function () {
      source = new IntegerIterator({ start: 1, end: 10 });
      sinon.spy(source, 'read');
      iterator = new SimpleTransformIterator(source, { limit: 0 });
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should not call `read` on the source', function () {
        source.read.should.not.have.been.called;
      });

      it('should not result in any items', function () {
        items.should.deep.equal([]);
      });
    });
  });

  describe('A SimpleTransformIterator with a limit of 5', function () {
    var iterator, source;
    before(function () {
      source = new IntegerIterator({ start: 1, end: 10 });
      sinon.spy(source, 'read');
      iterator = new SimpleTransformIterator(source, { limit: 5 });
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should call `read` on the source 5 times', function () {
        source.read.should.have.callCount(5);
      });

      it('should result in the first 5 items', function () {
        items.should.deep.equal([1, 2, 3, 4, 5]);
      });
    });
  });

  describe('A SimpleTransformIterator with a limit of +Infinity', function () {
    var iterator, source;
    before(function () {
      source = new IntegerIterator({ start: 1, end: 10 });
      sinon.spy(source, 'read');
      iterator = new SimpleTransformIterator(source, { limit: Infinity });
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should call `read` on the source 11 times', function () {
        source.read.should.have.callCount(11);
      });

      it('should result in all items', function () {
        items.should.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      });
    });
  });

  describe('A SimpleTransformIterator with a negative limit', function () {
    var iterator, source;
    before(function () {
      source = new IntegerIterator({ start: 1, end: 10 });
      sinon.spy(source, 'read');
      iterator = new SimpleTransformIterator(source, { limit: -1 });
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should not call `read` on the source', function () {
        source.read.should.not.have.been.called;
      });

      it('should not result in any items', function () {
        items.should.deep.equal([]);
      });
    });
  });

  describe('A SimpleTransformIterator with a limit of -Infinity', function () {
    var iterator, source;
    before(function () {
      source = new IntegerIterator({ start: 1, end: 10 });
      sinon.spy(source, 'read');
      iterator = new SimpleTransformIterator(source, { limit: -Infinity });
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should not call `read` on the source', function () {
        source.read.should.not.have.been.called;
      });

      it('should not result in any items', function () {
        items.should.deep.equal([]);
      });
    });
  });

  describe('A SimpleTransformIterator with an offset of 2 and a limit of 3', function () {
    var iterator, source;
    before(function () {
      source = new IntegerIterator({ start: 1, end: 10 });
      sinon.spy(source, 'read');
      iterator = new SimpleTransformIterator(source, { offset: 2, limit: 3 });
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should call `read` on the source 5 times', function () {
        source.read.should.have.callCount(5);
      });

      it('should result in skipping 2 items and reading 3', function () {
        items.should.deep.equal([3, 4, 5]);
      });
    });
  });

  describe('A SimpleTransformIterator with offset/limit and a slow source', function () {
    var iterator, source;
    before(function () {
      source = new BufferedIterator();
      sinon.spy(source, 'read');
      iterator = new SimpleTransformIterator({ offset: 2, limit: 3 });
      captureEvents(iterator, 'readable', 'end');
    });

    describe('before the source is set', function () {
      it('should not have emitted the `readable` event', function () {
        iterator._eventCounts.readable.should.equal(0);
      });

      it('should not have emitted the `end` event', function () {
        iterator._eventCounts.end.should.equal(0);
      });

      it('should not have ended', function () {
        iterator.ended.should.be.false;
      });

      it('should not be readable', function () {
        iterator.readable.should.be.false;
      });

      it('should return null on read', function () {
        expect(iterator.read()).to.be.null;
      });
    });

    describe('after the source is set', function () {
      before(function () { iterator.source = source; });

      it('should not have emitted the `readable` event', function () {
        iterator._eventCounts.readable.should.equal(0);
      });

      it('should not have emitted the `end` event', function () {
        iterator._eventCounts.end.should.equal(0);
      });

      it('should not have ended', function () {
        iterator.ended.should.be.false;
      });

      it('should not be readable', function () {
        iterator.readable.should.be.false;
      });

      it('should return null on read', function () {
        expect(iterator.read()).to.be.null;
      });
    });

    describe('after item 1 becomes available', function () {
      before(function () { source._push('a'); });

      it('should not have emitted the `readable` event', function () {
        iterator._eventCounts.readable.should.equal(0);
      });

      it('should not have emitted the `end` event', function () {
        iterator._eventCounts.end.should.equal(0);
      });

      it('should not have ended', function () {
        iterator.ended.should.be.false;
      });

      it('should not be readable', function () {
        iterator.readable.should.be.false;
      });

      it('should return null on read', function () {
        expect(iterator.read()).to.be.null;
      });
    });

    describe('after item 2 becomes available', function () {
      before(function () { source._push('b'); });

      it('should not have emitted the `readable` event', function () {
        iterator._eventCounts.readable.should.equal(0);
      });

      it('should not have emitted the `end` event', function () {
        iterator._eventCounts.end.should.equal(0);
      });

      it('should not have ended', function () {
        iterator.ended.should.be.false;
      });

      it('should not be readable', function () {
        iterator.readable.should.be.false;
      });

      it('should return null on read', function () {
        expect(iterator.read()).to.be.null;
      });
    });

    describe('after item 3 becomes available', function () {
      before(function () { source._push('c'); });

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

      it('should return the item on read', function () {
        expect(iterator.read()).to.equal('c');
      });

      it('should return null on subsequent reads', function () {
        expect(iterator.read()).to.be.null;
      });
    });

    describe('after item 4 becomes available', function () {
      before(function () { source._push('d'); });

      it('should have emitted another `readable` event', function () {
        iterator._eventCounts.readable.should.equal(2);
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

      it('should return the item on read', function () {
        expect(iterator.read()).to.equal('d');
      });

      it('should return null on subsequent reads', function () {
        expect(iterator.read()).to.be.null;
      });
    });

    describe('after item 5 becomes available', function () {
      before(function () { source._push('e'); });

      it('should have emitted another `readable` event', function () {
        iterator._eventCounts.readable.should.equal(3);
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

      it('should return the item on read', function () {
        expect(iterator.read()).to.equal('e');
      });

      it('should return null on subsequent reads', function () {
        expect(iterator.read()).to.be.null;
      });
    });

    describe('after item 5 has been read', function () {
      before(function () { source._push('f'); });

      it('should not have emitted the `readable` event anymore', function () {
        iterator._eventCounts.readable.should.equal(3);
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

      it('should return null on read', function () {
        expect(iterator.read()).to.be.null;
      });
    });
  });

  describe('A SimpleTransformIterator with filter/map/prepend/append/offset/limit', function () {
    var iterator, source, filter, map, prepend, append;
    before(function () {
      var i = 0;
      source = new ArrayIterator(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
      sinon.spy(source, 'read');
      filter = sinon.spy(function (item) { return item !== 'd'; });
      map = sinon.spy(function (item) { return item + (++i); });
      prepend = new ArrayIterator(['i', 'ii', 'iii']);
      append  = new ArrayIterator(['I', 'II', 'III']);
      iterator = new SimpleTransformIterator(source, {
        filter: filter, map: map, prepend: prepend, append: append,
        offset: 2, limit: 3,
      });
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should return the processed items', function () {
        items.should.deep.equal(['i', 'ii', 'iii', 'c1', 'e2', 'f3', 'I', 'II', 'III']);
      });

      it('should have called the filter function once for each needed item', function () {
        filter.should.have.callCount(6);
      });

      it('should have called the map function once for each needed item', function () {
        map.should.have.been.calledThrice;
      });

      it('should call `read` on the source 6 times', function () {
        source.read.should.have.callCount(6);
      });

      it('should have called the map function with the iterator as `this`', function () {
        map.alwaysCalledOn(iterator).should.be.true;
      });
    });
  });

  describe('A SimpleTransformIterator with optional set to false', function () {
    var iterator, source;
    before(function () {
      source = new ArrayIterator([1, 2, 3, 4, 5, 6]);
      iterator = new SimpleTransformIterator(source, {
        optional: false,
        map: function (item) { return item % 2 === 0 ? null : item; },
        transform: function (item, done) {
          if (item % 3 !== 0)
            this._push('t' + item);
          done();
        },
      });
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should return items not transformed/mapped into null', function () {
        items.should.deep.equal(['t1', 't5']);
      });
    });
  });

  describe('A SimpleTransformIterator with optional set to true', function () {
    var iterator, source;
    before(function () {
      source = new ArrayIterator([1, 2, 3, 4, 5, 6]);
      iterator = new SimpleTransformIterator(source, {
        optional: true,
        map: function (item) { return item % 2 === 0 ? null : item; },
        transform: function (item, done) {
          if (item % 3 !== 0)
            this._push('t' + item);
          done();
        },
      });
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should return the transformed items, or if none, the item itself', function () {
        items.should.deep.equal(['t1', 2, 3, 4, 't5', 6]);
      });
    });
  });

  describe('The AsyncIterator#map function', function () {
    it('should be a function', function () {
      expect(AsyncIterator.prototype.map).to.be.a('function');
    });

    describe('when called on an iterator', function () {
      var iterator, map, result;
      before(function () {
        var i = 0;
        iterator = new ArrayIterator(['a', 'b', 'c']);
        map = sinon.spy(function (item) { return item + (++i); });
        result = iterator.map(map);
      });

      describe('the return value', function () {
        var items = [];
        before(function (done) {
          result.on('data', function (item) { items.push(item); });
          result.on('end', done);
        });

        it('should be a SimpleTransformIterator', function () {
          result.should.be.an.instanceof(SimpleTransformIterator);
        });

        it('should execute the map function on all items in order', function () {
          items.should.deep.equal(['a1', 'b2', 'c3']);
        });

        it('should call the map function once for each item', function () {
          map.should.have.been.calledThrice;
        });

        it('should call the map function with the returned iterator as `this`', function () {
          map.alwaysCalledOn(result).should.be.true;
        });
      });
    });

    describe('when called on an iterator with a `this` argument', function () {
      var iterator, map, result, self = {};
      before(function () {
        var i = 0;
        iterator = new ArrayIterator(['a', 'b', 'c']);
        map = sinon.spy(function (item) { return item + (++i); });
        result = iterator.map(map, self);
      });

      describe('the return value', function () {
        var items = [];
        before(function (done) {
          result.on('data', function (item) { items.push(item); });
          result.on('end', done);
        });

        it('should be a SimpleTransformIterator', function () {
          result.should.be.an.instanceof(SimpleTransformIterator);
        });

        it('should execute the map function on all items in order', function () {
          items.should.deep.equal(['a1', 'b2', 'c3']);
        });

        it('should call the map function once for each item', function () {
          map.should.have.been.calledThrice;
        });

        it('should call the map function with the passed argument as `this`', function () {
          map.alwaysCalledOn(self).should.be.true;
        });
      });
    });
  });

  describe('The AsyncIterator#filter function', function () {
    it('should be a function', function () {
      expect(AsyncIterator.prototype.filter).to.be.a('function');
    });

    describe('when called on an iterator', function () {
      var iterator, filter, result;
      before(function () {
        iterator = new ArrayIterator(['a', 'b', 'c']);
        filter = sinon.spy(function (item) { return item !== 'b'; });
        result = iterator.filter(filter);
      });

      describe('the return value', function () {
        var items = [];
        before(function (done) {
          result.on('data', function (item) { items.push(item); });
          result.on('end', done);
        });

        it('should be a SimpleTransformIterator', function () {
          result.should.be.an.instanceof(SimpleTransformIterator);
        });

        it('should execute the filter function on all items in order', function () {
          items.should.deep.equal(['a', 'c']);
        });

        it('should call the filter function once for each item', function () {
          filter.should.have.been.calledThrice;
        });

        it('should call the filter function with the returned iterator as `this`', function () {
          filter.alwaysCalledOn(result).should.be.true;
        });
      });
    });

    describe('when called on an iterator with a `this` argument', function () {
      var iterator, filter, result, self = {};
      before(function () {
        iterator = new ArrayIterator(['a', 'b', 'c']);
        filter = sinon.spy(function (item) { return item !== 'b'; });
        result = iterator.filter(filter, self);
      });

      describe('the return value', function () {
        var items = [];
        before(function (done) {
          result.on('data', function (item) { items.push(item); });
          result.on('end', done);
        });

        it('should be a SimpleTransformIterator', function () {
          result.should.be.an.instanceof(SimpleTransformIterator);
        });

        it('should execute the filter function on all items in order', function () {
          items.should.deep.equal(['a', 'c']);
        });

        it('should call the filter function once for each item', function () {
          filter.should.have.been.calledThrice;
        });

        it('should call the filter function with the passed argument as `this`', function () {
          filter.alwaysCalledOn(self).should.be.true;
        });
      });
    });
  });

  describe('The AsyncIterator#prepend function', function () {
    it('should be a function', function () {
      expect(AsyncIterator.prototype.prepend).to.be.a('function');
    });

    describe('when called on an iterator', function () {
      var iterator, result;
      before(function () {
        iterator = new ArrayIterator(['a', 'b', 'c']);
        result = iterator.prepend(['i', 'ii', 'iii']);
      });

      describe('the return value', function () {
        var items = [];
        before(function (done) {
          result.on('data', function (item) { items.push(item); });
          result.on('end', done);
        });

        it('should be a SimpleTransformIterator', function () {
          result.should.be.an.instanceof(SimpleTransformIterator);
        });

        it('should prepend the items', function () {
          items.should.deep.equal(['i', 'ii', 'iii', 'a', 'b', 'c']);
        });
      });
    });
  });

  describe('The AsyncIterator#append function', function () {
    it('should be a function', function () {
      expect(AsyncIterator.prototype.append).to.be.a('function');
    });

    describe('when called on an iterator', function () {
      var iterator, result;
      before(function () {
        iterator = new ArrayIterator(['a', 'b', 'c']);
        result = iterator.append(['I', 'II', 'III']);
      });

      describe('the return value', function () {
        var items = [];
        before(function (done) {
          result.on('data', function (item) { items.push(item); });
          result.on('end', done);
        });

        it('should be a SimpleTransformIterator', function () {
          result.should.be.an.instanceof(SimpleTransformIterator);
        });

        it('should append the items', function () {
          items.should.deep.equal(['a', 'b', 'c', 'I', 'II', 'III']);
        });
      });
    });
  });

  describe('The AsyncIterator#surround function', function () {
    it('should be a function', function () {
      expect(AsyncIterator.prototype.surround).to.be.a('function');
    });

    describe('when called on an iterator', function () {
      var iterator, result;
      before(function () {
        iterator = new ArrayIterator(['a', 'b', 'c']);
        result = iterator.surround(['i', 'ii', 'iii'], ['I', 'II', 'III']);
      });

      describe('the return value', function () {
        var items = [];
        before(function (done) {
          result.on('data', function (item) { items.push(item); });
          result.on('end', done);
        });

        it('should be a SimpleTransformIterator', function () {
          result.should.be.an.instanceof(SimpleTransformIterator);
        });

        it('should surround the items', function () {
          items.should.deep.equal(['i', 'ii', 'iii', 'a', 'b', 'c', 'I', 'II', 'III']);
        });
      });
    });
  });

  describe('The AsyncIterator#skip function', function () {
    it('should be a function', function () {
      expect(AsyncIterator.prototype.skip).to.be.a('function');
    });

    describe('when called on an iterator', function () {
      var iterator, result;
      before(function () {
        iterator = new ArrayIterator(['a', 'b', 'c', 'd', 'e']);
        result = iterator.skip(2);
      });

      describe('the return value', function () {
        var items = [];
        before(function (done) {
          result.on('data', function (item) { items.push(item); });
          result.on('end', done);
        });

        it('should be a SimpleTransformIterator', function () {
          result.should.be.an.instanceof(SimpleTransformIterator);
        });

        it('should skip the given number of items', function () {
          items.should.deep.equal(['c', 'd', 'e']);
        });
      });
    });
  });

  describe('The AsyncIterator#take function', function () {
    it('should be a function', function () {
      expect(AsyncIterator.prototype.take).to.be.a('function');
    });

    describe('when called on an iterator', function () {
      var iterator, result;
      before(function () {
        iterator = new ArrayIterator(['a', 'b', 'c', 'd', 'e']);
        result = iterator.take(3);
      });

      describe('the return value', function () {
        var items = [];
        before(function (done) {
          result.on('data', function (item) { items.push(item); });
          result.on('end', done);
        });

        it('should be a SimpleTransformIterator', function () {
          result.should.be.an.instanceof(SimpleTransformIterator);
        });

        it('should take the given number of items', function () {
          items.should.deep.equal(['a', 'b', 'c']);
        });
      });
    });
  });

  describe('The AsyncIterator#range function', function () {
    it('should be a function', function () {
      expect(AsyncIterator.prototype.range).to.be.a('function');
    });

    describe('when called on an iterator', function () {
      var iterator, result;
      before(function () {
        iterator = new IntegerIterator();
        result = iterator.range(20, 29);
      });

      describe('the return value', function () {
        var items = [];
        before(function (done) {
          result.on('data', function (item) { items.push(item); });
          result.on('end', done);
        });

        it('should be a SimpleTransformIterator', function () {
          result.should.be.an.instanceof(SimpleTransformIterator);
        });

        it('should contain the indicated range', function () {
          items.should.have.length(10);
          items[0].should.equal(20);
          items[9].should.equal(29);
        });
      });
    });

    describe('when called on an iterator with an inverse range', function () {
      var iterator, result;
      before(function () {
        iterator = new IntegerIterator();
        sinon.spy(iterator, 'read');
        result = iterator.range(30, 20);
      });

      describe('the return value', function () {
        var items = [];
        before(function (done) {
          result.on('data', function (item) { items.push(item); });
          result.on('end', done);
        });

        it('should be a SimpleTransformIterator', function () {
          result.should.be.an.instanceof(SimpleTransformIterator);
        });

        it('should be empty', function () {
          items.should.be.empty;
        });

        it('should not have called `read` on the iterator', function () {
          iterator.read.should.not.have.been.called;
        });
      });
    });
  });

  describe('The AsyncIterator#transform function', function () {
    it('should be a function', function () {
      expect(AsyncIterator.prototype.transform).to.be.a('function');
    });

    describe('when called on an iterator', function () {
      var iterator, map, prepend, append, result;
      before(function () {
        var i = 0;
        iterator = new ArrayIterator(['a', 'b', 'c', 'd', 'e', 'f']);
        map = function (item) { return item + (++i); };
        prepend = new ArrayIterator(['i', 'ii', 'iii']);
        append  = new ArrayIterator(['I', 'II', 'III']);
        result = iterator.transform({
          map: map, prepend: prepend, append: append,
          offset: 2, limit: 3,
        });
      });

      describe('the return value', function () {
        var items = [];
        before(function (done) {
          result.on('data', function (item) { items.push(item); });
          result.on('end', done);
        });

        it('should be a SimpleTransformIterator', function () {
          result.should.be.an.instanceof(SimpleTransformIterator);
        });

        it('should transform the items', function () {
          items.should.deep.equal(['i', 'ii', 'iii', 'c1', 'd2', 'e3', 'I', 'II', 'III']);
        });
      });
    });
  });
});
