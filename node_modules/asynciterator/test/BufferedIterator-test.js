var BufferedIterator = require('../asynciterator').BufferedIterator;

var AsyncIterator = require('../asynciterator'),
    EventEmitter = require('events').EventEmitter;

describe('BufferedIterator', function () {
  describe('The BufferedIterator function', function () {
    describe('the result when called without `new`', function () {
      var instance;
      before(function () { instance = BufferedIterator(); });

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
      before(function () { instance = new BufferedIterator(); });

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

  describe('A BufferedIterator without arguments', function () {
    var iterator;
    before(function () {
      iterator = new BufferedIterator();
      captureEvents(iterator, 'readable', 'end');
    });

    it('should have maxBufferSize 4', function () {
      iterator.maxBufferSize.should.equal(4);
    });

    it('should provide a readable `toString` representation', function () {
      iterator.toString().should.equal('[BufferedIterator {buffer: 0}]');
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

    it('should not have been destroyed', function () {
      iterator.destroyed.should.be.false;
    });

    it('should not be done', function () {
      iterator.done.should.be.false;
    });

    it('should not be readable', function () {
      iterator.readable.should.be.false;
    });

    it('should return null when `read` is called', function () {
      expect(iterator.read()).to.be.null;
    });

    describe('after `close` is called', function () {
      before(function () {
        iterator.close();
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

      it('should allow pushing but have no effect', function () {
        iterator._push(1);
        iterator.toString().should.equal('[BufferedIterator {buffer: 0}]');
      });
    });
  });

  describe('A BufferedIterator that closes itself synchronously on read', function () {
    function createIterator(options) {
      var iterator = new BufferedIterator(options);
      iterator._read = function (count, done) { this.close(); done(); };
      sinon.spy(iterator, '_read');
      return captureEvents(iterator, 'readable', 'end');
    }

    describe('without autoStart', function () {
      var iterator;
      before(function () { iterator = createIterator({ autoStart: false }); });

      describe('before `read` has been called', function () {
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

        it('should not have called _read', function () {
          iterator._read.should.not.have.been.called;
        });
      });

      describe('after `read` has been called the first time', function () {
        var item;
        before(function () { item = iterator.read(); });

        it('should have returned null', function () {
          expect(item).to.be.null;
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

        it('should not have been destroyed', function () {
          iterator.destroyed.should.be.false;
        });

        it('should be done', function () {
          iterator.done.should.be.true;
        });

        it('should not be readable', function () {
          iterator.readable.should.be.false;
        });

        it('should have called `_read` with 4 (the default maximum buffer size)', function () {
          iterator._read.should.have.been.calledOnce;
          iterator._read.should.have.been.calledWith(4);
        });
      });

      describe('after `read` has been called the second time', function () {
        var item;
        before(function () { item = iterator.read(); });

        it('should have returned null', function () {
          expect(item).to.be.null;
        });

        it('should not have emitted the `readable` event anymore', function () {
          iterator._eventCounts.readable.should.equal(1);
        });

        it('should not have emitted another `end` event', function () {
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

        it('should not have called `_read` anymore', function () {
          iterator._read.should.have.been.calledOnce;
        });
      });
    });

    describe('with autoStart', function () {
      var iterator;
      before(function () { iterator = createIterator(); });

      describe('before `read` has been called', function () {
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

        it('should have called `_read` with 4 (the default maximum buffer size)', function () {
          iterator._read.should.have.been.calledOnce;
          iterator._read.should.have.been.calledWith(4);
        });
      });

      describe('after `read` has been called', function () {
        var item;
        before(function () { item = iterator.read(); });

        it('should have returned null', function () {
          expect(item).to.be.null;
        });

        it('should not have emitted the `readable` event', function () {
          iterator._eventCounts.readable.should.equal(0);
        });

        it('should not have emitted another `end` event', function () {
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

        it('should not have called `_read` anymore', function () {
          iterator._read.should.have.been.calledOnce;
        });
      });
    });
  });

  describe('A BufferedIterator that closes itself asynchronously on read', function () {
    function createIterator(options) {
      var iterator = new BufferedIterator(options);
      iterator._read = function (count, done) {
        setImmediate(function (self) { self.close(); done(); }, this);
      };
      sinon.spy(iterator, '_read');
      return captureEvents(iterator, 'readable', 'end');
    }

    describe('without autoStart', function () {
      var iterator;
      before(function () { iterator = createIterator({ autoStart: false }); });

      describe('before `read` has been called', function () {
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

        it('should not have called _read', function () {
          iterator._read.should.not.have.been.called;
        });
      });

      describe('after `read` has been called the first time', function () {
        var item;
        before(function () { item = iterator.read(); });

        it('should have returned null', function () {
          expect(item).to.be.null;
        });

        it('should not have emitted another `readable` event', function () {
          iterator._eventCounts.readable.should.equal(1);
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

        it('should have called `_read` with 4 (the default maximum buffer size)', function () {
          iterator._read.should.have.been.calledOnce;
          iterator._read.should.have.been.calledWith(4);
        });
      });

      describe('after `read` has been called the second time', function () {
        var item;
        before(function () { item = iterator.read(); });

        it('should have returned null', function () {
          expect(item).to.be.null;
        });

        it('should not have emitted another `readable` event', function () {
          iterator._eventCounts.readable.should.equal(1);
        });

        it('should not have emitted another `end` event', function () {
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

        it('should not have called `_read` anymore', function () {
          iterator._read.should.have.been.calledOnce;
        });
      });
    });

    describe('with autoStart', function () {
      var iterator;
      before(function () { iterator = createIterator(); });

      describe('before `read` has been called', function () {
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

        it('should have called `_read` with 4 (the default maximum buffer size)', function () {
          iterator._read.should.have.been.calledOnce;
          iterator._read.should.have.been.calledWith(4);
        });
      });

      describe('after `read` has been called', function () {
        var item;
        before(function () { item = iterator.read(); });

        it('should have returned null', function () {
          expect(item).to.be.null;
        });

        it('should not have emitted the `readable` event', function () {
          iterator._eventCounts.readable.should.equal(0);
        });

        it('should not have emitted another `end` event', function () {
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

        it('should not have called `_read` anymore', function () {
          iterator._read.should.have.been.calledOnce;
        });
      });
    });
  });

  describe('A BufferedIterator that is being closed', function () {
    var iterator;
    before(function () {
      iterator = new BufferedIterator();
      captureEvents(iterator, 'readable', 'end');
    });

    it('should provide a readable `toString` representation', function () {
      iterator.toString().should.equal('[BufferedIterator {buffer: 0}]');
    });

    describe('before it has been closed', function () {
      it('should not have emitted the `readable` event', function () {
        iterator._eventCounts.readable.should.equal(0);
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

      it('should return null on read', function () {
        expect(iterator.read()).to.be.null;
      });
    });

    describe('after it has been closed', function () {
      before(function () { iterator.close(); });

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

      it('should return null on read', function () {
        expect(iterator.read()).to.be.null;
      });
    });
  });

  describe('A BufferedIterator that is being closed while reading is in progress', function () {
    var iterator, _readDone;
    function createIterator() {
      iterator = new BufferedIterator({ autoStart: false, maxBufferSize: 1 });
      iterator._read = function (count, done) { _readDone = done; };
      sinon.spy(iterator, '_read');
      captureEvents(iterator, 'readable', 'end');
    }

    describe('when the iterator is closed synchronously after `read` is called', function () {
      before(createIterator);

      it('should provide a readable `toString` representation', function () {
        iterator.toString().should.equal('[BufferedIterator {buffer: 0}]');
      });

      describe('before the iterator has been closed', function () {
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

        it('should not have called `_read`', function () {
          iterator._read.should.have.callCount(0);
        });
      });

      describe('after `read` is called and the iterator has been closed', function () {
        before(function () {
          iterator.read();
          iterator.close();
          // _readDone cannot be called, as _read should never be called either
          // because the iterator closes before an asynchronous _read can take place
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

        it('should not have called `_read`', function () {
          iterator._read.should.have.callCount(0);
        });
      });
    });

    describe('when the iterator is closed asynchronously after `read` is called', function () {
      before(createIterator);

      it('should provide a readable `toString` representation', function () {
        iterator.toString().should.equal('[BufferedIterator {buffer: 0}]');
      });

      describe('before the iterator has been closed', function () {
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

        it('should not have called `_read`', function () {
          iterator._read.should.have.callCount(0);
        });
      });

      describe('after `read` is called and the iterator has been closed', function () {
        before(function () {
          iterator.read();
          setImmediate(function () { _readDone(); });
          setImmediate(function () { iterator.close(); });
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

        it('should have called `_read` once', function () {
          iterator._read.should.have.callCount(1);
        });
      });
    });

    describe('when an item is pushed, and read before closing', function () {
      before(createIterator);

      describe('before the iterator has been closed', function () {
        it('should provide a readable `toString` representation', function () {
          iterator.toString().should.equal('[BufferedIterator {buffer: 0}]');
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

        it('should return null when `read` is called', function () {
          expect(iterator.read()).to.be.null;
        });

        it('should have called `_read` once', function () {
          iterator._read.should.have.callCount(1);
        });
      });

      describe('after an item is pushed', function () {
        before(function () { iterator._push('a'); });

        it('should provide a readable `toString` representation', function () {
          iterator.toString().should.equal('[BufferedIterator {next: a, buffer: 1}]');
        });

        it('should have emitted another `readable` event', function () {
          iterator._eventCounts.readable.should.equal(2);
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

        it('should not have called `_read` anymore', function () {
          iterator._read.should.have.callCount(1);
        });
      });

      describe('after an item is read', function () {
        var item;
        before(function () { item = iterator.read(); });

        it('should not have emitted another `readable` event', function () {
          iterator._eventCounts.readable.should.equal(2);
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

        it('should have returned the pushed item', function () {
          item.should.equal('a');
        });

        it('should not have called `_read` anymore', function () {
          iterator._read.should.have.callCount(1);
        });
      });

      describe('after the iterator has been closed', function () {
        before(function () { iterator.close(); });

        it('should not have emitted another `readable` event', function () {
          iterator._eventCounts.readable.should.equal(2);
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

        it('should not have called `_read` anymore', function () {
          iterator._read.should.have.callCount(1);
        });
      });

      describe('after reading has finished', function () {
        before(function () { _readDone(); });

        it('should not have emitted another `readable` event', function () {
          iterator._eventCounts.readable.should.equal(2);
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

        it('should return null when `read` is called', function () {
          expect(iterator.read()).to.be.null;
        });

        it('should not have called `_read` anymore', function () {
          iterator._read.should.have.callCount(1);
        });
      });
    });

    describe('when an item is pushed, and read after closing', function () {
      before(createIterator);

      describe('before the iterator has been closed', function () {
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

        it('should return null when `read` is called', function () {
          expect(iterator.read()).to.be.null;
        });

        it('should have called `_read` once', function () {
          iterator._read.should.have.callCount(1);
        });
      });

      describe('after an item is pushed', function () {
        before(function () { iterator._push('a'); });

        it('should have emitted another `readable` event', function () {
          iterator._eventCounts.readable.should.equal(2);
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

        it('should not have called `_read` anymore', function () {
          iterator._read.should.have.callCount(1);
        });
      });

      describe('after the iterator has been closed', function () {
        before(function () { iterator.close(); });

        it('should not have emitted another `readable` event', function () {
          iterator._eventCounts.readable.should.equal(2);
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

        it('should not have called `_read` anymore', function () {
          iterator._read.should.have.callCount(1);
        });
      });

      describe('after an item is read', function () {
        var item;
        before(function () { item = iterator.read(); });

        it('should not have emitted another `readable` event', function () {
          iterator._eventCounts.readable.should.equal(2);
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

        it('should have returned the pushed item', function () {
          item.should.equal('a');
        });

        it('should not have called `_read` anymore', function () {
          iterator._read.should.have.callCount(1);
        });
      });

      describe('after reading has finished', function () {
        before(function () { _readDone(); });

        it('should not have emitted another `readable` event', function () {
          iterator._eventCounts.readable.should.equal(2);
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

        it('should return null when `read` is called', function () {
          expect(iterator.read()).to.be.null;
        });

        it('should not have called `_read` anymore', function () {
          iterator._read.should.have.callCount(1);
        });
      });
    });
  });

  describe('A BufferedIterator that synchronously pushes "a" and ends', function () {
    function createIterator(options) {
      var iterator = new BufferedIterator(options);
      iterator._read = function (count, done) { this._push('a'); this.close(); done(); };
      sinon.spy(iterator, '_read');
      return captureEvents(iterator, 'readable', 'end');
    }

    describe('without autoStart', function () {
      var iterator;
      before(function () { iterator = createIterator({ autoStart: false }); });

      it('should provide a readable `toString` representation', function () {
        iterator.toString().should.equal('[BufferedIterator {buffer: 0}]');
      });

      describe('before `read` has been called', function () {
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

        it('should not have called _read', function () {
          iterator._read.should.not.have.been.called;
        });
      });

      describe('after `read` has been called the first time', function () {
        var item;
        before(function () { item = iterator.read(); });

        it('should have returned null', function () {
          expect(item).to.be.null;
        });

        it('should have emitted another `readable` event', function () {
          iterator._eventCounts.readable.should.equal(2);
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

        it('should have called `_read` with 4 (the default maximum buffer size)', function () {
          iterator._read.should.have.been.calledOnce;
          iterator._read.should.have.been.calledWith(4);
        });
      });

      describe('after `read` has been called the second time', function () {
        var item;
        before(function () { item = iterator.read(); });

        it('should have returned "a"', function () {
          expect(item).to.equal('a');
        });

        it('should not have emitted another `readable` event', function () {
          iterator._eventCounts.readable.should.equal(2);
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

        it('should have called `_read` with 4 (the default maximum buffer size)', function () {
          iterator._read.should.have.been.calledOnce;
          iterator._read.should.have.been.calledWith(4);
        });
      });

      describe('after `read` has been called the third time', function () {
        var item;
        before(function () { item = iterator.read(); });

        it('should have returned null', function () {
          expect(item).to.be.null;
        });

        it('should not have emitted another `readable` event', function () {
          iterator._eventCounts.readable.should.equal(2);
        });

        it('should not have emitted another `end` event', function () {
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

        it('should not have called `_read` anymore', function () {
          iterator._read.should.have.been.calledOnce;
        });
      });
    });

    describe('with autoStart', function () {
      var iterator;
      before(function () { iterator = createIterator(); });

      it('should provide a readable `toString` representation', function () {
        iterator.toString().should.equal('[BufferedIterator {next: a, buffer: 1}]');
      });

      describe('before `read` has been called', function () {
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

        it('should have called `_read` with 4 (the default maximum buffer size)', function () {
          iterator._read.should.have.been.calledOnce;
          iterator._read.should.have.been.calledWith(4);
        });
      });

      describe('after `read` has been called', function () {
        var item;
        before(function () { item = iterator.read(); });

        it('should have returned "a"', function () {
          expect(item).to.equal('a');
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

        it('should not have been destroyed', function () {
          iterator.destroyed.should.be.false;
        });

        it('should be done', function () {
          iterator.done.should.be.true;
        });

        it('should not be readable', function () {
          iterator.readable.should.be.false;
        });

        it('should not have called `_read` anymore', function () {
          iterator._read.should.have.been.calledOnce;
        });
      });
    });
  });

  describe('A BufferedIterator that pushes "a" (sync) and "b" and "c" (async) on every read', function () {
    function createIterator(options) {
      var iterator = new BufferedIterator(options);
      iterator._read = function (count, done) {
        this._push('a');
        setImmediate(function (self) {
          self._push('b');
          self._push('c');
          done();
        }, this);
      };
      sinon.spy(iterator, '_read');
      return captureEvents(iterator, 'readable', 'end');
    }

    describe('with autoStart enabled', function () {
      var iterator;
      before(function () { iterator = createIterator(); });

      it('should provide a readable `toString` representation', function () {
        iterator.toString().should.equal('[BufferedIterator {next: a, buffer: 3}]');
      });

      describe('before `read` has been called', function () {
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

        it('should have called `_read` with 4 (the maximum buffer size)', function () {
          iterator._read.should.have.been.calledOnce;
          iterator._read.getCall(0).args[0].should.equal(4);
        });
      });

      describe('after `read` has been called the first time', function () {
        var item;
        before(function () {
          item = iterator.read();
          iterator._read.should.have.been.calledOnce; // ensure `_read` is not called synchronously
        });

        it('should have returned "a"', function () {
          expect(item).to.equal('a');
        });

        it('should not have emitted another `readable` event yet', function () {
          iterator._eventCounts.readable.should.equal(1);
        });

        it('should have called `_read` with 2 (number of free places in buffer)', function () {
          iterator._read.should.have.been.calledTwice;
          iterator._read.getCall(1).args[0].should.equal(2);
        });
      });

      describe('after `read` has been called the second time', function () {
        var item;
        before(function () { item = iterator.read(); });

        it('should have returned "b"', function () {
          expect(item).to.equal('b');
        });

        it('should not have emitted another `readable` event yet', function () {
          iterator._eventCounts.readable.should.equal(1);
        });

        it('should not have called `_read` anymore (because buffer is full)', function () {
          iterator._read.should.have.been.calledTwice;
        });
      });

      describe('after `read` is called six more times', function () {
        var items = [];
        before(function () {
          for (var i = 0; i < 6; i++)
            items.push(iterator.read());
        });

        it('should have returned all remaining items in the buffer', function () {
          // plus `null` for two reads past the end of the buffer
          expect(items).to.deep.equal(['c', 'a', 'b', 'c', null, null]);
        });

        it('should have emitted another `readable` event', function () {
          iterator._eventCounts.readable.should.equal(2);
        });

        it('should have called `_read` then with 4 (to fill the entire buffer)', function () {
          iterator._read.should.have.callCount(3);
          iterator._read.getCall(2).args[0].should.equal(4);
        });
      });
    });
  });

  describe('A BufferedIterator with `_read` that calls `done` multiple times', function () {
    var iterator, readDone;
    before(function (done) {
      iterator = new BufferedIterator({ autoStart: false });
      iterator._read = function (count, done) { readDone = done; };
      // `setImmediate` because reading directly after construction does not call `_read`;
      // this is necessary to enable attaching a `_begin` hook after construction
      setImmediate(function () { iterator.read(); done(); });
    });

    it('should cause an exception', function () {
      readDone.should.not.throw();
      readDone.should.throw('done callback called multiple times');
      readDone.should.throw('done callback called multiple times');
    });
  });

  describe('A BufferedIterator with `_read` that does not call `done`', function () {
    var iterator;
    before(function () {
      iterator = new BufferedIterator();
      iterator._read = function () { this._push('a'); };
    });

    it('should return the first item on read', function () {
      expect(iterator.read()).to.equal('a');
    });

    it('should return null on subsequent reads', function () {
      expect(iterator.read()).to.be.null;
    });
  });

  describe('A BufferedIterator with `_read` that calls `read`', function () {
    var iterator;
    before(function () {
      var counter = 0;
      iterator = new BufferedIterator();
      iterator._read = function () { this.read(); this._push(counter++); };
    });

    it('should return the first item on read', function () {
      expect(iterator.read()).to.equal(0);
    });

    it('should return null on subsequent reads', function () {
      expect(iterator.read()).to.be.null;
    });
  });

  describe('A BufferedIterator with a synchronous beginning', function () {
    var iterator;
    before(function () {
      iterator = new BufferedIterator();
      iterator._begin = function (done) {
        this._push('x');
        this._push('y');
        done();
      };
      iterator._read = function (item, done) {
        this._push('a');
        this.close();
        done();
      };
      captureEvents(iterator, 'readable', 'end');
    });

    it('should provide a readable `toString` representation', function () {
      iterator.toString().should.equal('[BufferedIterator {next: x, buffer: 3}]');
    });

    describe('before reading an item', function () {
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

    describe('after reading the beginning items', function () {
      var items = [];
      before(function () {
        for (var i = 0; i < 2; i++)
          items.push(iterator.read());
      });

      it('should have read the beginning items', function () {
        items.should.deep.equal(['x', 'y']);
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

    describe('after reading the item', function () {
      var item;
      before(function () { item = iterator.read(); });

      it('should have read the item', function () {
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

      it('should not have been destroyed', function () {
        iterator.destroyed.should.be.false;
      });

      it('should be done', function () {
        iterator.done.should.be.true;
      });

      it('should not be readable', function () {
        iterator.readable.should.be.false;
      });

      it('should return null when `read` is called', function () {
        expect(iterator.read()).to.be.null;
      });
    });
  });

  describe('A BufferedIterator that pushes less than `maxBufferSize` items before _read', function () {
    var iterator;
    before(function () {
      iterator = new BufferedIterator();
      for (var i = 0; i < 3; i++)
        iterator._push(i);
      sinon.spy(iterator, '_read');
    });

    it('should call _read with the remaining number of items', function () {
      iterator._read.should.have.been.calledOnce;
      iterator._read.should.have.been.calledWith(1);
    });
  });

  describe('A BufferedIterator that pushes `maxBufferSize` items before _read', function () {
    var iterator;
    before(function () {
      iterator = new BufferedIterator();
      for (var i = 0; i < 4; i++)
        iterator._push(i);
      sinon.spy(iterator, '_read');
    });

    it('should not call _read', function () {
      iterator._read.should.not.have.been.called;
    });
  });

  describe('A BufferedIterator that starts reading before _read is called', function () {
    var iterator;
    before(function () {
      iterator = new BufferedIterator();
      // Forcibly change the status to 'reading',
      // to test if the iterator deals with such an exceptional situation
      iterator._changeState = function () { iterator._reading = true; };
      sinon.spy(iterator, '_read');
    });

    it('should not call _read', function () {
      iterator._read.should.not.have.been.called;
    });
  });

  describe('A BufferedIterator that closes before _completeClose is called', function () {
    var iterator;
    before(function () {
      iterator = new BufferedIterator();
      iterator.close();
      iterator._changeState(AsyncIterator.CLOSED);
      sinon.spy(iterator, '_flush');
    });

    it('should not call _flush', function () {
      iterator._flush.should.not.have.been.called;
    });
  });

  describe('A BufferedIterator with an asynchronous beginning', function () {
    var iterator;
    before(function () {
      iterator = new BufferedIterator();
      iterator._begin = function (done) {
        setImmediate(function () {
          iterator._push('x');
          iterator._push('y');
          done();
        });
      };
      iterator._read = function (item, done) {
        this._push('a');
        this.close();
        done();
      };
      captureEvents(iterator, 'readable', 'end');
    });

    it('should provide a readable `toString` representation', function () {
      iterator.toString().should.equal('[BufferedIterator {next: x, buffer: 3}]');
    });

    describe('before reading an item', function () {
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

    describe('after reading the beginning items', function () {
      var items = [];
      before(function () {
        for (var i = 0; i < 2; i++)
          items.push(iterator.read());
      });

      it('should have read the beginning items', function () {
        items.should.deep.equal(['x', 'y']);
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

    describe('after reading the item', function () {
      var item;
      before(function () { item = iterator.read(); });

      it('should have read the item', function () {
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

      it('should not have been destroyed', function () {
        iterator.destroyed.should.be.false;
      });

      it('should be done', function () {
        iterator.done.should.be.true;
      });

      it('should not be readable', function () {
        iterator.readable.should.be.false;
      });

      it('should return null when `read` is called', function () {
        expect(iterator.read()).to.be.null;
      });
    });
  });

  describe('A BufferedIterator with `_begin` that calls `done` multiple times', function () {
    var iterator, beginDone;
    before(function () {
      iterator = new BufferedIterator();
      iterator._begin = function (done) { beginDone = done; };
    });

    it('should cause an exception', function () {
      beginDone.should.not.throw();
      beginDone.should.throw('done callback called multiple times');
      beginDone.should.throw('done callback called multiple times');
    });
  });

  describe('A BufferedIterator with `_begin` that does not call `done`', function () {
    var iterator;
    before(function () {
      iterator = new BufferedIterator();
      iterator._begin = function () { this._push('a'); };
      iterator.close();
      sinon.spy(iterator, '_read');
      captureEvents(iterator, 'end');
    });

    it('should be readable', function () {
      iterator.readable.should.be.true;
    });

    it('should return the first item on read', function () {
      expect(iterator.read()).to.equal('a');
    });

    it('should return null on subsequent reads', function () {
      expect(iterator.read()).to.be.null;
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

    it('should be readable after reading', function () {
      iterator.readable.should.be.false;
    });

    it('should not have called _read', function () {
      iterator._read.should.not.have.been.called;
    });
  });

  describe('A BufferedIterator with a synchronous flush', function () {
    var iterator;
    before(function () {
      iterator = new BufferedIterator();
      iterator._read = function (item, done) {
        this._push('a');
        this.close();
        done();
      };
      iterator._flush = function (done) {
        this._push('x');
        this._push('y');
        done();
      };
      captureEvents(iterator, 'readable', 'end');
    });

    it('should provide a readable `toString` representation', function () {
      iterator.toString().should.equal('[BufferedIterator {next: a, buffer: 3}]');
    });

    describe('before reading an item', function () {
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

    describe('after reading the item', function () {
      var item;
      before(function () { item = iterator.read(); });

      it('should have read the item', function () {
        item.should.equal('a');
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

    describe('after reading the flushed items', function () {
      var items = [];
      before(function () {
        for (var i = 0; i < 2; i++)
          items.push(iterator.read());
      });

      it('should have read the flushed items', function () {
        items.should.deep.equal(['x', 'y']);
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

      it('should not have been destroyed', function () {
        iterator.destroyed.should.be.false;
      });

      it('should be done', function () {
        iterator.done.should.be.true;
      });

      it('should not be readable', function () {
        iterator.readable.should.be.false;
      });

      it('should return null when `read` is called', function () {
        expect(iterator.read()).to.be.null;
      });
    });
  });

  describe('A BufferedIterator with an asynchronous flush', function () {
    var iterator;
    before(function () {
      iterator = new BufferedIterator();
      iterator._read = function (item, done) {
        this._push('a');
        this.close();
        done();
      };
      iterator._flush = function (done) {
        setImmediate(function () {
          iterator._push('x');
          iterator._push('y');
          done();
        });
      };
      captureEvents(iterator, 'readable', 'end');
    });

    it('should provide a readable `toString` representation', function () {
      iterator.toString().should.equal('[BufferedIterator {next: a, buffer: 3}]');
    });

    describe('before reading an item', function () {
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

    describe('after reading the item', function () {
      var item;
      before(function () { item = iterator.read(); });

      it('should have read the item', function () {
        item.should.equal('a');
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

    describe('after reading the flushed items', function () {
      var items = [];
      before(function () {
        for (var i = 0; i < 2; i++)
          items.push(iterator.read());
      });

      it('should have read the flushed items', function () {
        items.should.deep.equal(['x', 'y']);
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

      it('should not have been destroyed', function () {
        iterator.destroyed.should.be.false;
      });

      it('should be done', function () {
        iterator.done.should.be.true;
      });

      it('should not be readable', function () {
        iterator.readable.should.be.false;
      });

      it('should return null when `read` is called', function () {
        expect(iterator.read()).to.be.null;
      });
    });
  });

  describe('A BufferedIterator with `_flush` that calls `done` multiple times', function () {
    var iterator, flushDone;
    before(function () {
      iterator = new BufferedIterator();
      iterator._flush = function (done) { flushDone = done; };
      iterator.close();
      iterator.read();
    });

    it('should cause an exception', function () {
      flushDone.should.not.throw();
      flushDone.should.throw('done callback called multiple times');
      flushDone.should.throw('done callback called multiple times');
    });
  });

  describe('A BufferedIterator with `_flush` that does not call `done`', function () {
    var iterator;
    before(function () {
      iterator = new BufferedIterator();
      iterator._flush = function () { this._push('a'); };
      iterator.close();
      captureEvents(iterator, 'end');
    });

    it('should return the first item on read', function () {
      expect(iterator.read()).to.equal('a');
    });

    it('should return null on subsequent reads', function () {
      expect(iterator.read()).to.be.null;
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
  });

  describe('A BufferedIterator with a synchronous flush that is destroyed', function () {
    var iterator;
    before(function () {
      iterator = new BufferedIterator({ maxBufferSize: 1 });
      iterator._read = function (item, done) {
        this._push('a');
        done();
      };
      iterator._flush = function (done) {
        this._push('x');
        this._push('y');
        done();
      };
      captureEvents(iterator, 'readable', 'end');
    });

    it('should provide a readable `toString` representation', function () {
      iterator.toString().should.equal('[BufferedIterator {next: a, buffer: 1}]');
    });

    describe('before reading an item', function () {
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

    describe('after reading the item and destroying', function () {
      var item;
      before(function () {
        item = iterator.read();
        iterator.destroy();
      });

      it('should have read the item', function () {
        item.should.equal('a');
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

      it('should have been destroyed', function () {
        iterator.destroyed.should.be.true;
      });

      it('should be done', function () {
        iterator.done.should.be.true;
      });

      it('should not be readable', function () {
        iterator.readable.should.be.false;
      });

      it('should return null when `read` is called', function () {
        expect(iterator.read()).to.be.null;
      });
    });
  });

  describe('A BufferedIterator with an asynchronous flush that is destroyed', function () {
    var iterator;
    before(function () {
      iterator = new BufferedIterator({ maxBufferSize: 1 });
      iterator._read = function (item, done) {
        this._push('a');
        done();
      };
      iterator._flush = function (done) {
        setImmediate(function () {
          iterator._push('x');
          iterator._push('y');
          done();
        });
      };
      captureEvents(iterator, 'readable', 'end');
    });

    it('should provide a readable `toString` representation', function () {
      iterator.toString().should.equal('[BufferedIterator {next: a, buffer: 1}]');
    });

    describe('before reading an item', function () {
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

    describe('after reading the item and destroying', function () {
      var item;
      before(function () {
        item = iterator.read();
        iterator.destroy();
      });

      it('should have read the item', function () {
        item.should.equal('a');
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

      it('should have been destroyed', function () {
        iterator.destroyed.should.be.true;
      });

      it('should be done', function () {
        iterator.done.should.be.true;
      });

      it('should not be readable', function () {
        iterator.readable.should.be.false;
      });

      it('should return null when `read` is called', function () {
        expect(iterator.read()).to.be.null;
      });
    });
  });

  describe('A BufferedIterator created with a maximum buffer size', function () {
    it('changes non-numeric maximum buffer sizes into 4', function () {
      (new BufferedIterator({ maxBufferSize: 'b' })).maxBufferSize.should.equal(4);
    });

    it('changes negative maximum buffer sizes into 1', function () {
      (new BufferedIterator({ maxBufferSize: -37 })).maxBufferSize.should.equal(1);
    });

    it('changes a 0 maximum buffer sizes into 1', function () {
      (new BufferedIterator({ maxBufferSize: 0 })).maxBufferSize.should.equal(1);
    });

    it('retains a positive integer maximum buffer size', function () {
      (new BufferedIterator({ maxBufferSize: 7 })).maxBufferSize.should.equal(7);
    });

    it('floors a positive non-integer maximum buffer size', function () {
      (new BufferedIterator({ maxBufferSize: 7.5 })).maxBufferSize.should.equal(7);
    });

    it('retains an infinite maximum buffer size', function () {
      (new BufferedIterator({ maxBufferSize: Infinity })).maxBufferSize.should.equal(Infinity);
    });

    describe('when changing the buffer size', function () {
      var iterator;
      before(function () {
        iterator = new BufferedIterator({ maxBufferSize: 6 });
        iterator._read = sinon.spy(function (count, done) {
          for (var i = 0; i < 4; i++)
            this._push(i);
          done();
        });
      });

      describe('before changing', function () {
        it('should have called _read', function () {
          iterator._read.should.have.callCount(1);
        });
      });

      describe('to a different value', function () {
        before(function () {
          iterator.maxBufferSize = 8.4;
        });

        it('should change the value', function () {
          iterator.maxBufferSize.should.equal(8);
        });

        it('should have called _read again', function () {
          iterator._read.should.have.callCount(2);
        });
      });

      describe('to the same value', function () {
        before(function () {
          iterator.maxBufferSize = 8.6;
        });

        it('should not change the value', function () {
          iterator.maxBufferSize.should.equal(8);
        });

        it('should not have called _read again', function () {
          iterator._read.should.have.callCount(2);
        });
      });
    });
  });

  describe('A BufferedIterator created with an infinite maximum buffer size', function () {
    var iterator, i = 0;
    before(function (done) {
      iterator = new BufferedIterator({ maxBufferSize: Infinity });
      iterator._read = sinon.spy(function (count, next) {
        this._push(++i);
        if (i === 10)
          this.close(), done();
        next();
      });
    });

    it('reads the source until the end', function () {
      iterator._read.should.have.callCount(10);
    });

    it('calls `_read` on the source with a count of 128', function () {
      iterator._read.getCall(0).args[0].should.equal(128);
    });
  });

  describe('A BufferedIterator create with a finite maximum buffer size', function () {
    var iterator, i = 0, beforeDone;
    before(function () {
      iterator = new BufferedIterator({ maxBufferSize: 4 });
      iterator._read = sinon.spy(function (count, next) {
        this._push(++i);
        if (i === 10)
          this.close(), beforeDone();
        next();
      });
    });

    describe('before the maximum buffer size is increased to infinity', function () {
      it('reads the source twice', function () {
        iterator._read.should.have.callCount(2);
      });
    });

    describe('after the maximum buffer size is increased to infinity', function () {
      before(function (done) {
        iterator.maxBufferSize = Infinity;
        beforeDone = done;
      });

      it('reads the source until the end', function () {
        iterator._read.should.have.callCount(10);
      });
    });
  });

  describe('A BufferedIterator that is destroyed', function () {
    var iterator, i = 0;
    before(function () {
      iterator = new BufferedIterator();
      iterator._read = sinon.spy(function (count, next) {
        this._push(++i);
        next();
      });
      captureEvents(iterator, 'data', 'end', 'readable');
      iterator.destroy();
    });

    it('should not call _read()', function () {
      iterator._read.should.have.callCount(0);
    });

    it('should allow pushing but have no effect', function () {
      iterator._push(10);
      iterator.toString().should.equal('[BufferedIterator {buffer: 0}]');
    });

    it('should have an empty buffer', function () {
      iterator._buffer.length.should.equal(0);
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
  });

  describe('A BufferedIterator that is destroyed after the first item', function () {
    var iterator, i = 0;
    before(function () {
      iterator = new BufferedIterator();
      iterator._read = sinon.spy(function (count, next) {
        this._push(++i);
        next();
        if (i === 1)
          iterator.destroy();
      });
      captureEvents(iterator, 'data', 'end', 'readable');
    });

    it('should have called _read() once', function () {
      iterator._read.should.have.callCount(1);
    });

    it('should have an empty buffer', function () {
      iterator._buffer.length.should.equal(0);
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
  });

  describe('A BufferedIterator that is destroyed after the first item but before the next call', function () {
    var iterator, i = 0;
    before(function () {
      iterator = new BufferedIterator();
      iterator._read = sinon.spy(function (count, next) {
        this._push(++i);
        if (i === 1)
          iterator.destroy();
        next();
      });
      captureEvents(iterator, 'data', 'end', 'readable');
    });

    it('should have called _read() once', function () {
      iterator._read.should.have.callCount(1);
    });

    it('should have an empty buffer', function () {
      iterator._buffer.length.should.equal(0);
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
  });
});
