var ClonedIterator = require('../asynciterator').ClonedIterator;

var AsyncIterator = require('../asynciterator'),
    TransformIterator = AsyncIterator.TransformIterator,
    BufferedIterator = AsyncIterator.BufferedIterator,
    EmptyIterator = AsyncIterator.EmptyIterator,
    ArrayIterator = AsyncIterator.ArrayIterator,
    EventEmitter = require('events').EventEmitter;

describe('ClonedIterator', function () {
  describe('The ClonedIterator function', function () {
    describe('the result when called without `new`', function () {
      var instance;
      before(function () { instance = ClonedIterator(); });

      it('should be a ClonedIterator object', function () {
        instance.should.be.an.instanceof(ClonedIterator);
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
      before(function () { instance = new ClonedIterator(); });

      it('should be a ClonedIterator object', function () {
        instance.should.be.an.instanceof(ClonedIterator);
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

  describe('A ClonedIterator without source', function () {
    var clone;
    before(function () {
      clone = new ClonedIterator();
      captureEvents(clone, 'readable', 'end');
    });

    describe('before closing', function () {
      it('should have undefined as `source` property', function () {
        expect(clone.source).to.be.undefined;
      });

      it('should provide a readable `toString` representation', function () {
        clone.toString().should.equal('[ClonedIterator {source: none}]');
      });

      it('should not have emitted the `readable` event', function () {
        clone._eventCounts.readable.should.equal(0);
      });

      it('should not have emitted the `end` event', function () {
        clone._eventCounts.end.should.equal(0);
      });

      it('should not have ended', function () {
        clone.ended.should.be.false;
      });

      it('should not be readable', function () {
        clone.readable.should.be.false;
      });

      it('should return null when `read` is called', function () {
        expect(clone.read()).to.be.null;
      });

      it('should return an empty property set', function () {
        clone.getProperties().should.deep.equal({});
      });
    });

    describe('after closing', function () {
      before(function () {
        clone.close();
      });

      it('should have undefined as `source` property', function () {
        expect(clone.source).to.be.undefined;
      });

      it('should not have emitted the `readable` event', function () {
        clone._eventCounts.readable.should.equal(0);
      });

      it('should have emitted the `end` event', function () {
        clone._eventCounts.end.should.equal(1);
      });

      it('should have ended', function () {
        clone.ended.should.be.true;
      });

      it('should not be readable', function () {
        clone.readable.should.be.false;
      });

      it('should return null when `read` is called', function () {
        expect(clone.read()).to.be.null;
      });

      it('should return an empty property set', function () {
        clone.getProperties().should.deep.equal({});
      });
    });
  });

  describe('Cloning an iterator that already has a destination', function () {
    it('should throw an exception', function () {
      var source = new AsyncIterator(), destination = new TransformIterator(source);
      source.should.have.property('_destination', destination);
      (function () { source.clone(); }).should.throw('The source already has a destination');
    });
  });

  describe('Cloning an empty iterator', function () {
    var clones = createClones(function () { return new EmptyIterator(); });

    describeClones(clones, function (getClone, getIterator) {
      it('should have the original iterator as source', function () {
        getClone().source.should.equal(getIterator());
      });

      it('should provide a readable `toString` representation', function () {
        getClone().toString().should.equal('[ClonedIterator {source: [EmptyIterator]}]');
      });

      it('should not have emitted the `readable` event', function () {
        getClone()._eventCounts.readable.should.equal(0);
      });

      it('should have emitted the `end` event', function () {
        getClone()._eventCounts.end.should.equal(1);
      });

      it('should have ended', function () {
        getClone().ended.should.be.true;
      });

      it('should not be readable', function () {
        getClone().readable.should.be.false;
      });

      it('should return null on read', function () {
        expect(getClone().read()).to.be.null;
      });
    });
  });

  describe('Cloning an iterator that asynchronously closes', function () {
    function createIterator() { return new BufferedIterator(); }

    function beforeClosing(getClone, getIterator, index) {
      describe('before closing', function () {
        it('should have the original iterator as source', function () {
          getClone().source.should.equal(getIterator());
        });

        if (index === 0) {
          it('should not have emitted the `readable` event', function () {
            getClone()._eventCounts.readable.should.equal(0);
          });
        }

        it('should not have emitted the `end` event', function () {
          getClone()._eventCounts.end.should.equal(0);
        });

        it('should not have ended', function () {
          getClone().ended.should.be.false;
        });

        if (index === 0) {
          it('should not be readable', function () {
            getClone().readable.should.be.false;
          });

          it('should return null on read', function () {
            expect(getClone().read()).to.be.null;
          });
        }
      });
    }

    function afterItem(getClone, getIterator, index) {
      describe('after emitting an item', function () {
        if (index === 0)
          before(function () { getIterator()._push('a'); });

        it('should have emitted the `readable` event', function () {
          getClone()._eventCounts.readable.should.equal(1);
        });

        it('should not have emitted the `end` event', function () {
          getClone()._eventCounts.end.should.equal(0);
        });

        it('should not have ended', function () {
          getClone().ended.should.be.false;
        });

        it('should be readable', function () {
          getClone().readable.should.be.true;
        });

        it('should read the item', function () {
          expect(getClone().read()).to.equal('a');
        });
      });
    }

    function afterClosing(getClone, getIterator, index) {
      describe('after closing', function () {
        if (index === 0)
          before(function () { getIterator().close(); });

        it('should not have emitted anymore `readable` events', function () {
          getClone()._eventCounts.readable.should.equal(1);
        });

        it('should have emitted the `end` event', function () {
          getClone()._eventCounts.end.should.equal(1);
        });

        it('should have ended', function () {
          getClone().ended.should.be.true;
        });

        it('should not be readable', function () {
          getClone().readable.should.be.false;
        });

        it('should return null on read', function () {
          expect(getClone().read()).to.be.null;
        });
      });
    }

    describe('reading sequentially', function () {
      var clones = createClones(createIterator);
      describeClones(clones, function (getClone, getIterator, index) {
        beforeClosing(getClone, getIterator, index);
        afterItem(getClone, getIterator, index);
        afterClosing(getClone, getIterator, index);
      });
    });

    describe('reading in parallel', function () {
      var clones = createClones(createIterator);
      describeClones(clones, beforeClosing);
      describeClones(clones, afterItem);
      describeClones(clones, afterClosing);
    });
  });

  describe('Cloning a one-item iterator', function () {
    function createIterator() { return new ArrayIterator(['a']); }

    function beforeReading(getClone, getIterator) {
      describe('before reading an item', function () {
        it('should have the original iterator as source', function () {
          getClone().source.should.equal(getIterator());
        });

        it('should have emitted the `readable` event', function () {
          getClone()._eventCounts.readable.should.equal(1);
        });

        it('should not have emitted the `end` event', function () {
          getClone()._eventCounts.end.should.equal(0);
        });

        it('should not have ended', function () {
          getClone().ended.should.be.false;
        });

        it('should be readable', function () {
          getClone().readable.should.be.true;
        });
      });
    }

    function afterReading(getClone) {
      describe('after reading an item', function () {
        var item;
        before(function () { item = getClone().read(); });

        it('should have read the item', function () {
          expect(item).to.equal('a');
        });

        it('should not have emitted the `readable` event anymore', function () {
          getClone()._eventCounts.readable.should.equal(1);
        });

        it('should have emitted the `end` event', function () {
          getClone()._eventCounts.end.should.equal(1);
        });

        it('should have ended', function () {
          getClone().ended.should.be.true;
        });

        it('should not be readable', function () {
          getClone().readable.should.be.false;
        });

        it('should return null on read', function () {
          expect(getClone().read()).to.be.null;
        });
      });
    }

    describe('reading sequentially', function () {
      var clones = createClones(createIterator);
      describeClones(clones, function (getClone, getIterator, index) {
        beforeReading(getClone, getIterator, index);
        afterReading(getClone, getIterator, index);
      });
    });

    describe('reading in parallel', function () {
      var clones = createClones(createIterator);
      describeClones(clones, beforeReading);
      describeClones(clones, afterReading);
    });
  });

  describe('Cloning a two-item iterator', function () {
    function createIterator() { return new ArrayIterator(['a', 'b']); }

    function beforeReading(getClone, getIterator) {
      describe('before reading an item', function () {
        it('should have the original iterator as source', function () {
          getClone().source.should.equal(getIterator());
        });

        it('should have emitted the `readable` event', function () {
          getClone()._eventCounts.readable.should.equal(1);
        });

        it('should not have emitted the `end` event', function () {
          getClone()._eventCounts.end.should.equal(0);
        });

        it('should not have ended', function () {
          getClone().ended.should.be.false;
        });

        it('should be readable', function () {
          getClone().readable.should.be.true;
        });
      });
    }

    function afterReadingFirst(getClone) {
      describe('after reading the first item', function () {
        var item;
        before(function () { item = getClone().read(); });

        it('should have read the item', function () {
          expect(item).to.equal('a');
        });

        it('should not have emitted the `readable` event anymore', function () {
          getClone()._eventCounts.readable.should.equal(1);
        });

        it('should not have emitted the `end` event', function () {
          getClone()._eventCounts.end.should.equal(0);
        });

        it('should not have ended', function () {
          getClone().ended.should.be.false;
        });

        it('should be readable', function () {
          getClone().readable.should.be.true;
        });
      });
    }

    function afterReadingSecond(getClone) {
      describe('after reading the second item', function () {
        var item;
        before(function () { item = getClone().read(); });

        it('should have read the item', function () {
          if (!getClone().closedBeforeReadingItem2)
            expect(item).to.equal('b');
        });

        it('should not have emitted the `readable` event anymore', function () {
          getClone()._eventCounts.readable.should.equal(1);
        });

        it('should have emitted the `end` event', function () {
          getClone()._eventCounts.end.should.equal(1);
        });

        it('should have ended', function () {
          getClone().ended.should.be.true;
        });

        it('should not be readable', function () {
          getClone().readable.should.be.false;
        });

        it('should return null on read', function () {
          expect(getClone().read()).to.be.null;
        });
      });
    }

    describe('reading sequentially', function () {
      var clones = createClones(createIterator);
      describeClones(clones, function (getClone, getIterator, index) {
        beforeReading(getClone, getIterator, index);
        afterReadingFirst(getClone, getIterator, index);
        afterReadingSecond(getClone, getIterator, index);
      });
    });

    describe('reading in parallel', function () {
      var clones = createClones(createIterator);
      describeClones(clones, beforeReading);
      describeClones(clones, afterReadingFirst);
      describeClones(clones, afterReadingSecond);
    });

    describe('reading when one clone is closed', function () {
      var clones = createClones(createIterator);
      describeClones(clones, beforeReading);
      describeClones(clones, afterReadingFirst);
      describe('after clone 2 is closed', function () {
        before(function () {
          clones['clone 2']().close();
          clones['clone 2']().closedBeforeReadingItem2 = true;
        });
        describeClones(clones, afterReadingSecond);
      });
    });
  });

  describe('Cloning an iterator with properties', function () {
    var iterator, clone;
    before(function () {
      iterator = new AsyncIterator();
      iterator.setProperty('foo', 'FOO');
      iterator.setProperty('bar', 'BAR');
      clone = iterator.clone();
    });

    describe('before a property is set on the clone', function () {
      var callback;
      before(function () {
        callback = sinon.stub();
        clone.getProperty('foo', callback);
      });

      it('should return all properties from the original', function () {
        clone.getProperties().should.deep.equal({ foo: 'FOO', bar: 'BAR' });
      });

      it('should return the property from the original without callback', function () {
        expect(clone.getProperty('foo')).to.equal('FOO');
      });

      it('should return the property from the original with callback', function () {
        callback.should.have.been.calledOnce;
        callback.should.have.been.calledWith('FOO');
      });
    });

    describe('after a property is changed on the original', function () {
      var callback;
      before(function () {
        iterator.setProperty('foo', 'FOO2');
        callback = sinon.stub();
        clone.getProperty('foo', callback);
      });

      it('should return all properties from the original', function () {
        clone.getProperties().should.deep.equal({ foo: 'FOO2', bar: 'BAR' });
      });

      it('should return the property from the original without callback', function () {
        expect(clone.getProperty('foo')).to.equal('FOO2');
      });

      it('should return the property from the original with callback', function () {
        callback.should.have.been.calledOnce;
        callback.should.have.been.calledWith('FOO2');
      });
    });

    describe('after a property is set on the clone', function () {
      var callback;
      before(function () {
        clone.setProperty('bar', 'NEWBAR');
        callback = sinon.stub();
        clone.getProperty('bar', callback);
      });

      it('should not have changed the original', function () {
        expect(iterator.getProperty('bar')).to.equal('BAR');
      });

      it('should return all properties', function () {
        clone.getProperties().should.deep.equal({ foo: 'FOO2', bar: 'NEWBAR' });
      });

      it('should return the new property without callback', function () {
        expect(clone.getProperty('bar')).to.equal('NEWBAR');
      });

      it('should return the new property with callback', function () {
        callback.should.have.been.calledOnce;
        callback.should.have.been.calledWith('NEWBAR');
      });
    });

    describe('a property callback for a property first set on the clone', function () {
      var callback;
      before(function () {
        callback = sinon.stub();
        clone.getProperty('cloneFirst', callback);
      });

      describe('before the property is set', function () {
        it('should not call the callback', function () {
          callback.should.not.have.been.called;
        });
      });

      describe('after the property is set on the clone', function () {
        before(function () {
          clone.setProperty('cloneFirst', 'CLONE');
          callback.should.not.have.been.called;
        });

        it('should call the callback with the value', function () {
          callback.should.have.been.calledOnce;
          callback.should.have.been.calledWith('CLONE');
        });

        it("should return the clone's property value", function () {
          expect(clone.getProperty('cloneFirst')).to.equal('CLONE');
        });
      });

      describe('after the property is set on the original', function () {
        before(function () {
          iterator.setProperty('cloneFirst', 'ORIGINAL');
        });

        it('should not call the callback anymore', function () {
          callback.should.have.been.calledOnce;
        });

        it("should return the clone's property value", function () {
          expect(clone.getProperty('cloneFirst')).to.equal('CLONE');
        });
      });
    });

    describe('a property callback for a property first set on the original', function () {
      var callback;
      before(function () {
        callback = sinon.stub();
        clone.getProperty('originalFirst', callback);
      });

      describe('before the property is set', function () {
        it('should not call the callback', function () {
          callback.should.not.have.been.called;
        });
      });

      describe('after the property is set on the original', function () {
        before(function () {
          iterator.setProperty('originalFirst', 'ORIGINAL');
          callback.should.not.have.been.called;
        });

        it('should call the callback with the value', function () {
          callback.should.have.been.calledOnce;
          callback.should.have.been.calledWith('ORIGINAL');
        });

        it('should return the original property value', function () {
          expect(clone.getProperty('originalFirst')).to.equal('ORIGINAL');
        });
      });

      describe('after the property is set on the clone', function () {
        before(function () {
          iterator.setProperty('originalFirst', 'CLONE');
        });

        it('should not call the callback anymore', function () {
          callback.should.have.been.calledOnce;
        });

        it("should return the clone's property value", function () {
          expect(clone.getProperty('originalFirst')).to.equal('CLONE');
        });
      });
    });
  });

  describe('Cloning an iterator that becomes readable later on', function () {
    var clones = createClones(function () { return new BufferedIterator(); }), iterator;
    before(function () {
      iterator = clones.iterator();
      iterator._push(1);
    });

    describe('before the first item is read', function () {
      describeClones(clones, function (getClone) {
        it('should be readable', function () {
          getClone().readable.should.be.true;
        });

        it('should have emitted the `readable` event', function () {
          getClone()._eventCounts.readable.should.equal(1);
        });
      });
    });

    describe('after the first item is read', function () {
      describeClones(clones, function (getClone) {
        var item;
        before(function () { item = getClone().read(); });

        it('should have read the item correctly', function () {
          item.should.equal(1);
        });

        it('should be readable', function () {
          getClone().readable.should.be.true;
        });

        it('should not have emitted another `readable` event', function () {
          getClone()._eventCounts.readable.should.equal(1);
        });
      });
    });

    describe('after trying to read the second item', function () {
      describeClones(clones, function (getClone) {
        var item;
        before(function () { item = getClone().read(); });

        it('should not have read an item', function () {
          expect(item).to.be.null;
        });

        it('should not be readable', function () {
          getClone().readable.should.be.false;
        });

        it('should not have emitted another `readable` event', function () {
          getClone()._eventCounts.readable.should.equal(1);
        });
      });
    });

    describe('after the second item is pushed', function () {
      before(function () { iterator._push(2); });

      describeClones(clones, function (getClone) {
        it('should be readable', function () {
          getClone().readable.should.be.true;
        });

        it('should have emitted another `readable` event', function () {
          getClone()._eventCounts.readable.should.equal(2);
        });
      });
    });

    describe('after reading the second item', function () {
      describeClones(clones, function (getClone) {
        var item;
        before(function () { item = getClone().read(); });

        it('should have read the item correctly', function () {
          item.should.equal(2);
        });

        it('should be readable', function () {
          getClone().readable.should.be.true;
        });
      });
    });
  });

  describe('Cloning an iterator that errors', function () {
    var clones = createClones(function () { return new AsyncIterator(); }), iterator;
    before(function () {
      iterator = clones.iterator();
    });

    describe('before an error occurs', function () {
      describeClones(clones, function (getClone) {
        before(function () {
          getClone().errorHandler = sinon.stub();
          getClone().on('error', getClone().errorHandler);
        });

        it('should not have emitted an error', function () {
          getClone().errorHandler.should.not.have.been.called;
        });
      });
    });

    describe('after a first error occurs', function () {
      var error;
      before(function () {
        iterator.emit('error', error = new Error('error1'));
      });

      describeClones(clones, function (getClone) {
        it('should re-emit the error', function () {
          getClone().errorHandler.should.have.been.calledOnce;
          getClone().errorHandler.should.have.been.calledWith(error);
        });
      });
    });

    describe('after a second error occurs', function () {
      var error;
      before(function () {
        iterator.emit('error', error = new Error('error2'));
      });

      describeClones(clones, function (getClone) {
        it('should re-emit the error', function () {
          getClone().errorHandler.should.have.been.calledTwice;
          getClone().errorHandler.should.have.been.calledWith(error);
        });
      });
    });

    describe('after the iterator has ended and errors again', function () {
      before(function (done) {
        iterator.close();
        iterator.on('end', function () {
          function noop() {}
          iterator.on('error', noop); // avoid triggering the default error handler
          iterator.emit('error', new Error('error3'));
          iterator.removeListener('error', noop);
          done();
        });
      });

      it('should not leave any error handlers attached', function () {
        iterator.listenerCount('error').should.equal(0);
      });

      describeClones(clones, function (getClone) {
        it('should not re-emit the error', function () {
          getClone().errorHandler.should.have.been.calledTwice;
        });
      });
    });
  });

  describe('Cloning an iterator without source', function () {
    var clones = createClones(function () {}), iterator;

    describe('before a source is set', function () {
      describeClones(clones, function (getClone) {
        before(function () {
          getClone().getProperty('a', getClone().callbackA = sinon.stub());
          getClone().getProperty('b', getClone().callbackB = sinon.stub());
          getClone().getProperty('c', getClone().callbackC = sinon.stub());
        });

        it('should not have emitted the `readable` event', function () {
          getClone()._eventCounts.readable.should.equal(0);
        });

        it('should not have emitted the `end` event', function () {
          getClone()._eventCounts.end.should.equal(0);
        });

        it('should not have ended', function () {
          getClone().ended.should.be.false;
        });

        it('should not be readable', function () {
          getClone().readable.should.be.false;
        });

        it('should return null on read', function () {
          expect(getClone().read()).to.be.null;
        });

        it('should not have called a property callback for a non-set property', function () {
          getClone().callbackA.should.not.have.been.called;
          getClone().callbackB.should.not.have.been.called;
          getClone().callbackC.should.not.have.been.called;
        });
      });
    });

    describe('after a source is set', function () {
      before(function () {
        iterator = new AsyncIterator();
        iterator.setProperty('a', 'A');
        iterator.setProperty('b', 'B');

        clones['clone 1']().source = iterator;
        clones['clone 2']().source = iterator;

        clones['clone 1']().setProperty('a', 'AAA');
        clones['clone 2']().setProperty('a', 'AAA');

        forEachClone(clones, function (getClone) {
          getClone().callbackA.should.not.have.been.called;
          getClone().callbackB.should.not.have.been.called;
        });
      });

      describeClones(clones, function (getClone) {
        it('should not have emitted the `readable` event', function () {
          getClone()._eventCounts.readable.should.equal(0);
        });

        it('should not have emitted the `end` event', function () {
          getClone()._eventCounts.end.should.equal(0);
        });

        it('should not have ended', function () {
          getClone().ended.should.be.false;
        });

        it('should not be readable', function () {
          getClone().readable.should.be.false;
        });

        it('should return null on read', function () {
          expect(getClone().read()).to.be.null;
        });

        it('should have called a property callback for a property in the source', function () {
          getClone().callbackA.should.have.been.calledOnce;
          getClone().callbackA.should.have.been.calledWith('AAA');
        });

        it('should have called a property callback for a property in the clone', function () {
          getClone().callbackB.should.have.been.calledOnce;
          getClone().callbackB.should.have.been.calledWith('B');
        });
      });
    });

    describe('after a property is set on the source', function () {
      before(function () {
        iterator.setProperty('c', 'C');
        forEachClone(clones, function (getClone) {
          getClone().callbackC.should.not.have.been.called;
        });
      });

      describeClones(clones, function (getClone) {
        it('should have called the property callback for that property', function () {
          getClone().callbackC.should.have.been.calledOnce;
          getClone().callbackC.should.have.been.calledWith('C');
        });
      });
    });
  });
});

// Returns a wrapper function that remembers its return value for subsequent calls
function memoize(func, arg) {
  var result;
  return function () { return result || (result = func(arg)); };
}

// Creates a single clone
function createClone(getSource) {
  var clone = getSource() ? getSource().clone() : new ClonedIterator();
  captureEvents(clone, 'readable', 'end');
  return clone;
}

// Returns a hash of functions that create clones
function createClones(createIterator) {
  var clones = { iterator: memoize(createIterator) };
  ['clone 1', 'clone 2'].forEach(function (id) {
    clones[id] = memoize(createClone, clones.iterator);
  });
  return clones;
}

// Returns a `describe` environment for each of the clones
function describeClones(clones, describeClone) {
  forEachClone(clones, function (getClone, id, index) {
    describe(id, function () {
      // Pre-load the clone so events can fire
      before(function () { getClone(); });
      describeClone(getClone, clones.iterator, index);
    });
  });
}

function forEachClone(clones, f) {
  Object.keys(clones).forEach(function (id, index) {
    // The item at index 0 is the iterator creation function
    if (index > 0)
      f(clones[id], id, index - 1);
  });
}
