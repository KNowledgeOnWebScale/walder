var TransformIterator = require('../asynciterator').TransformIterator;

var AsyncIterator = require('../asynciterator'),
    BufferedIterator = AsyncIterator.BufferedIterator,
    EmptyIterator = AsyncIterator.EmptyIterator,
    ArrayIterator = AsyncIterator.ArrayIterator,
    EventEmitter = require('events').EventEmitter;

describe('TransformIterator', function () {
  describe('The TransformIterator function', function () {
    describe('the result when called without `new`', function () {
      var instance;
      before(function () { instance = TransformIterator(); });

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
      before(function () { instance = new TransformIterator(); });

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

  describe('A TransformIterator', function () {
    it('disallows setting a falsy object as source', function () {
      var iterator = new TransformIterator();
      (function () { iterator.source = null; })
        .should.throw('Invalid source: null');
    });

    it('disallows setting an object without `read` function as source', function () {
      var iterator = new TransformIterator();
      (function () { iterator.source = { read: 1, on: function () {} }; })
        .should.throw('Invalid source: [object Object]');
    });

    it('disallows setting an object without `on` function as source', function () {
      var iterator = new TransformIterator();
      (function () { iterator.source = { on: 1, read: function () {} }; })
        .should.throw('Invalid source: [object Object]');
    });

    it('disallows setting another source after one has been set', function () {
      var iterator = new TransformIterator();
      iterator.source = new EmptyIterator();
      (function () { iterator.source = new EmptyIterator(); })
        .should.throw('The source cannot be changed after it has been set');
    });

    it('allows setting the source through the first argument', function () {
      var source = new EmptyIterator(),
          iterator = new TransformIterator(source);
      iterator.source.should.equal(source);
    });

    it('allows setting the source through an options hash as first argument', function () {
      var source = new EmptyIterator(),
          iterator = new TransformIterator({ source: source });
      iterator.source.should.equal(source);
    });

    it('allows setting the source through an options hash as second argument', function () {
      var source = new EmptyIterator(),
          iterator = new TransformIterator(null, { source: source });
      iterator.source.should.equal(source);
    });

    it('gives precedence to a source as first argument', function () {
      var sourceA = new EmptyIterator(),
          sourceB = new EmptyIterator(),
          iterator = new TransformIterator(sourceA, { source: sourceB });
      iterator.source.should.equal(sourceA);
    });

    it('does not allow setting a source that already has a destination', function () {
      var source = new EmptyIterator(),
          iteratorA = new TransformIterator(),
          iteratorB = new TransformIterator();
      (function () { iteratorA.source = source; }).should.not.throw();
      (function () { iteratorB.source = source; }).should.throw('The source already has a destination');
    });
  });

  describe('A TransformIterator without source', function () {
    var iterator;
    before(function () {
      iterator = new TransformIterator();
      captureEvents(iterator, 'readable', 'end');
    });

    describe('before closing', function () {
      it('should have undefined as `source` property', function () {
        expect(iterator.source).to.be.undefined;
      });

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

      it('should return null when `read` is called', function () {
        expect(iterator.read()).to.be.null;
      });
    });

    describe('after closing', function () {
      before(function () {
        iterator.close();
      });

      it('should have undefined as `source` property', function () {
        expect(iterator.source).to.be.undefined;
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

      it('should return null when `read` is called', function () {
        expect(iterator.read()).to.be.null;
      });
    });
  });

  describe('A TransformIterator initialized with an empty source', function () {
    var iterator, source;
    before(function () {
      iterator = new TransformIterator(source = new EmptyIterator());
      captureEvents(iterator, 'readable', 'end');
      expect(source._events).to.not.contain.key('data');
      expect(source._events).to.not.contain.key('readable');
      expect(source._events).to.not.contain.key('end');
    });

    it('should expose the source in the `source` property', function () {
      iterator.source.should.equal(source);
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

  describe('A TransformIterator initialized with a source that ends asynchronously', function () {
    var iterator, source;
    before(function () {
      iterator = new TransformIterator(source = new AsyncIterator());
      captureEvents(iterator, 'readable', 'end');
    });

    describe('before the source ends', function () {
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

      it('should return null when read is called', function () {
        expect(iterator.read()).to.be.null;
      });
    });

    describe('when the source emits a `readable` event (but does not actually contain items)', function () {
      before(function () { source.emit('readable'); });

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

      it('should return null when read is called', function () {
        expect(iterator.read()).to.be.null;
      });
    });

    describe('after the source ends', function () {
      before(function () { source.close(); });

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

  describe('A default TransformIterator with a one-item source', function () {
    var iterator, source;
    before(function () {
      iterator = new TransformIterator(source = new ArrayIterator(['a']));
      captureEvents(iterator, 'readable', 'end');
      sinon.spy(source, 'read');
      // intentionally break source cleanup to verify whether destination does it
      source._terminate = function () { this._changeState(AsyncIterator.ENDED); };
    });

    describe('before reading an item', function () {
      it('should have called `read` on the source', function () {
        source.read.should.have.been.calledOnce;
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

    describe('after reading an item', function () {
      var item;
      before(function () { item = iterator.read(); });

      it('should have read the original item', function () {
        item.should.equal('a');
      });

      it('should not have emitted the `readable` event anymore', function () {
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

      it('should return null when `read` is called', function () {
        expect(iterator.read()).to.be.null;
      });

      it('should not leave `readable` listeners on the source', function () {
        EventEmitter.listenerCount(source, 'readable').should.equal(0);
      });

      it('should not leave `end` listeners on the source', function () {
        EventEmitter.listenerCount(source, 'end').should.equal(0);
      });

      it('should remove itself as destination from the source', function () {
        source.should.not.have.key('_destination');
      });
    });
  });

  describe('A TransformIterator that synchronously transforms a two-item source', function () {
    var iterator, source;
    before(function () {
      iterator = new TransformIterator(source = new ArrayIterator(['a', 'b', 'c']));
      iterator._transform = function (item, done) {
        this._push(item + '1');
        this._push(item + '2');
        done();
      };
      captureEvents(iterator, 'readable', 'end');
      sinon.spy(source, 'read');
      // intentionally break source cleanup to verify whether destination does it
      source._terminate = function () { this._changeState(AsyncIterator.ENDED); };
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

      it('should not have ended', function () {
        iterator.ended.should.be.false;
      });

      it('should be readable', function () {
        iterator.readable.should.be.true;
      });
    });

    describe('after reading one item', function () {
      var item;
      before(function () { item = iterator.read(); });

      it('should have read the transformed item', function () {
        item.should.equal('a1');
      });

      it('should not have emitted the `readable` event anymore', function () {
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

    describe('after reading the remaining items', function () {
      var items = [];
      before(function () {
        for (var i = 0; i < 5; i++)
          items.push(iterator.read());
      });

      it('should have read the transformed items', function () {
        items.should.deep.equal(['a2', 'b1', 'b2', 'c1', 'c2']);
      });

      it('should not have emitted the `readable` event anymore', function () {
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

      it('should return null when `read` is called', function () {
        expect(iterator.read()).to.be.null;
      });

      it('should not leave `readable` listeners on the source', function () {
        EventEmitter.listenerCount(source, 'readable').should.equal(0);
      });

      it('should not leave `end` listeners on the source', function () {
        EventEmitter.listenerCount(source, 'end').should.equal(0);
      });

      it('should remove itself as destination from the source', function () {
        source.should.not.have.key('_destination');
      });
    });
  });

  describe('A TransformIterator that asynchronously transforms a two-item source', function () {
    var iterator, source;
    before(function () {
      iterator = new TransformIterator(source = new ArrayIterator(['a', 'b', 'c']));
      iterator._transform = function (item, done) {
        setImmediate(function () {
          iterator._push(item + '1');
          iterator._push(item + '2');
          done();
        });
      };
      captureEvents(iterator, 'readable', 'end');
      sinon.spy(source, 'read');
      // intentionally break source cleanup to verify whether destination does it
      source._terminate = function () { this._changeState(AsyncIterator.ENDED); };
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

      it('should not have ended', function () {
        iterator.ended.should.be.false;
      });

      it('should be readable', function () {
        iterator.readable.should.be.true;
      });
    });

    describe('after reading one item', function () {
      var item;
      before(function () { item = iterator.read(); });

      it('should have read the transformed item', function () {
        item.should.equal('a1');
      });

      it('should not have emitted the `readable` event anymore', function () {
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

    describe('after reading the remaining items', function () {
      var items = [];
      before(function () {
        for (var i = 0; i < 5; i++)
          items.push(iterator.read());
      });

      it('should have read the transformed items', function () {
        items.should.deep.equal(['a2', 'b1', 'b2', 'c1', 'c2']);
      });

      it('should not have emitted the `readable` event anymore', function () {
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

      it('should return null when `read` is called', function () {
        expect(iterator.read()).to.be.null;
      });

      it('should not leave `readable` listeners on the source', function () {
        EventEmitter.listenerCount(source, 'readable').should.equal(0);
      });

      it('should not leave `end` listeners on the source', function () {
        EventEmitter.listenerCount(source, 'end').should.equal(0);
      });

      it('should remove itself as destination from the source', function () {
        source.should.not.have.key('_destination');
      });
    });
  });

  describe('A TransformIterator that synchronously transforms a three-item source but asynchronously completes', function () {
    var iterator, source;
    before(function () {
      var i = 0;
      source = new ArrayIterator(['a', 'b', 'c']);
      iterator = new TransformIterator(source);
      iterator._transform = sinon.spy(function (item, done) {
        this._push(item + (++i));
        setImmediate(done);
      });
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

      it('should have called _transform once for each item', function () {
        iterator._transform.should.have.been.calledThrice;
      });

      it('should have called _transform function with the iterator as `this`', function () {
        iterator._transform.alwaysCalledOn(iterator).should.be.true;
      });
    });
  });

  describe('A TransformIterator with destroySource set to its default', function () {
    var iterator, source;
    before(function () {
      source = new ArrayIterator([1, 2, 3]);
      iterator = new TransformIterator(source);
    });

    describe('after being closed', function () {
      before(function (done) {
        iterator.read();
        iterator.close();
        iterator.on('end', done);
      });

      it('should have destroyed the source', function () {
        expect(source).to.have.property('destroyed', true);
      });
    });
  });

  describe('A TransformIterator with destroySource set to false', function () {
    var iterator, source;
    before(function () {
      source = new ArrayIterator([1, 2, 3]);
      iterator = new TransformIterator(source, { destroySource: false });
    });

    describe('after being closed', function () {
      before(function (done) {
        iterator.read();
        iterator.close();
        iterator.on('end', done);
      });

      it('should not have destroyed the source', function () {
        expect(source).to.have.property('destroyed', false);
      });
    });
  });

  describe('A TransformIterator with a source that errors', function () {
    var iterator, source, errorHandler;
    before(function () {
      source = new AsyncIterator();
      iterator = new TransformIterator(source);
      iterator.on('error', errorHandler = sinon.stub());
    });

    describe('before an error occurs', function () {
      it('should not have emitted any error', function () {
        errorHandler.should.not.have.been.called;
      });
    });

    describe('after a first error occurs', function () {
      var error1;
      before(function () {
        errorHandler.reset();
        source.emit('error', error1 = new Error('error1'));
      });

      it('should re-emit the error', function () {
        errorHandler.should.have.been.calledOnce;
        errorHandler.should.have.been.calledWith(error1);
      });
    });

    describe('after a second error occurs', function () {
      var error2;
      before(function () {
        errorHandler.reset();
        source.emit('error', error2 = new Error('error2'));
      });

      it('should re-emit the error', function () {
        errorHandler.should.have.been.calledOnce;
        errorHandler.should.have.been.calledWith(error2);
      });
    });

    describe('after the source has ended and errors again', function () {
      before(function (done) {
        errorHandler.reset();
        source.close();
        iterator.on('end', function () {
          function noop() {}
          source.on('error', noop); // avoid triggering the default error handler
          source.emit('error', new Error('error3'));
          source.removeListener('error', noop);
          done();
        });
      });

      it('should not re-emit the error', function () {
        errorHandler.should.not.have.been.called;
      });

      it('should not leave any error handlers attached', function () {
        source.listenerCount('error').should.equal(0);
      });
    });
  });

  describe('A TransformIterator that skips many items', function () {
    var iterator, source, i = 1;
    before(function () {
      source = new AsyncIterator();
      source.read = sinon.spy(function () { return i++; });
      iterator = new TransformIterator(source);
      iterator._transform = function (item, done) {
        if (item % 10 === 0)
          this._push(item);
        done();
      };
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

  describe('A TransformIterator that closes during the tranformation', function () {
    var iterator, source;
    before(function () {
      source = new AsyncIterator();
      source.read = sinon.spy(function () { return 1; });
      iterator = new TransformIterator(source);
      iterator._transform = function (item, done) {
        this._push(item);
        this.close();
        done();
      };
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

      it('should not leave `readable` listeners on the source', function () {
        EventEmitter.listenerCount(source, 'readable').should.equal(0);
      });

      it('should not leave `end` listeners on the source', function () {
        EventEmitter.listenerCount(source, 'end').should.equal(0);
      });

      it('should not leave `error` listeners on the source', function () {
        EventEmitter.listenerCount(source, 'error').should.equal(0);
      });
    });
  });

  describe('A TransformIterator with optional set to false', function () {
    var iterator, source;
    before(function () {
      source = new ArrayIterator([1, 2, 3, 4, 5, 6]);
      iterator = new TransformIterator(source, { optional: false });
      iterator._transform = function (item, done) {
        if (item % 3 !== 0)
          this._push('t' + item);
        done();
      };
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should return items not transformed into null', function () {
        items.should.deep.equal(['t1', 't2', 't4', 't5']);
      });
    });
  });

  describe('A TransformIterator with optional set to true', function () {
    var iterator, source;
    before(function () {
      source = new ArrayIterator([1, 2, 3, 4, 5, 6]);
      iterator = new TransformIterator(source, { optional: true });
      iterator._transform = function (item, done) {
        if (item % 3 !== 0)
          this._push('t' + item);
        done();
      };
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should return the transformed items, or if none, the item itself', function () {
        items.should.deep.equal(['t1', 't2', 3, 't4', 't5', 6]);
      });
    });
  });
});
