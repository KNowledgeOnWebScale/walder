var MultiTransformIterator = require('../asynciterator').MultiTransformIterator;

var AsyncIterator = require('../asynciterator'),
    TransformIterator = AsyncIterator.TransformIterator,
    BufferedIterator = AsyncIterator.BufferedIterator,
    EmptyIterator = AsyncIterator.EmptyIterator,
    SingletonIterator = AsyncIterator.SingletonIterator,
    ArrayIterator = AsyncIterator.ArrayIterator,
    EventEmitter = require('events').EventEmitter;

describe('MultiTransformIterator', function () {
  describe('The MultiTransformIterator function', function () {
    describe('the result when called without `new`', function () {
      var instance;
      before(function () { instance = MultiTransformIterator(); });

      it('should be a MultiTransformIterator object', function () {
        instance.should.be.an.instanceof(MultiTransformIterator);
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
      before(function () { instance = new MultiTransformIterator(); });

      it('should be a MultiTransformIterator object', function () {
        instance.should.be.an.instanceof(MultiTransformIterator);
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

  describe('A MultiTransformIterator without options', function () {
    var iterator, source;
    before(function () {
      source = new ArrayIterator(['a', 'b', 'c', 'd', 'e', 'f']);
      iterator = new MultiTransformIterator(source);
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should return items as they are', function () {
        items.should.deep.equal(['a', 'b', 'c', 'd', 'e', 'f']);
      });
    });
  });

  describe('A MultiTransformIterator with transformers that emit 0 items', function () {
    var iterator, source;
    before(function () {
      source = new ArrayIterator(['a', 'b', 'c', 'd', 'e', 'f']);
      iterator = new MultiTransformIterator(source);
      iterator._createTransformer = sinon.spy(EmptyIterator);
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should not return any items', function () {
        items.should.deep.equal([]);
      });

      it('should have called _createTransformer for each item', function () {
        iterator._createTransformer.should.have.callCount(6);
        iterator._createTransformer.getCall(0).args.should.deep.equal(['a']);
        iterator._createTransformer.getCall(1).args.should.deep.equal(['b']);
        iterator._createTransformer.getCall(2).args.should.deep.equal(['c']);
        iterator._createTransformer.getCall(3).args.should.deep.equal(['d']);
        iterator._createTransformer.getCall(4).args.should.deep.equal(['e']);
        iterator._createTransformer.getCall(5).args.should.deep.equal(['f']);
      });
    });
  });

  describe('A MultiTransformIterator with transformers that synchronously emit 1 item', function () {
    var iterator, source;
    before(function () {
      source = new ArrayIterator(['a', 'b', 'c', 'd', 'e', 'f']);
      iterator = new MultiTransformIterator(source);
      iterator._createTransformer = sinon.spy(function (item) {
        return new SingletonIterator(item + '1');
      });
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should return the transformed items', function () {
        items.should.deep.equal(['a1', 'b1', 'c1', 'd1', 'e1', 'f1']);
      });
    });
  });

  describe('A MultiTransformIterator with transformers that synchronously emit 3 items', function () {
    var iterator, source;
    before(function () {
      source = new ArrayIterator(['a', 'b', 'c', 'd', 'e', 'f']);
      iterator = new MultiTransformIterator(source);
      iterator._createTransformer = sinon.spy(function (item) {
        return new ArrayIterator([item + '1', item + '2', item + '3']);
      });
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should return the transformed items', function () {
        items.should.deep.equal([
          'a1', 'a2', 'a3',
          'b1', 'b2', 'b3',
          'c1', 'c2', 'c3',
          'd1', 'd2', 'd3',
          'e1', 'e2', 'e3',
          'f1', 'f2', 'f3',
        ]);
      });
    });
  });

  describe('A MultiTransformIterator with transformers that asynchronously close', function () {
    var iterator, source;
    before(function () {
      source = new ArrayIterator(['a', 'b', 'c', 'd', 'e', 'f']);
      iterator = new MultiTransformIterator(source);
      iterator._createTransformer = sinon.spy(function () {
        var transformer = new BufferedIterator();
        setImmediate(function () {
          transformer.close();
        });
        return transformer;
      });
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should not return any items', function () {
        items.should.deep.equal([]);
      });

      it('should have called _createTransformer for each item', function () {
        iterator._createTransformer.should.have.callCount(6);
        iterator._createTransformer.getCall(0).args.should.deep.equal(['a']);
        iterator._createTransformer.getCall(1).args.should.deep.equal(['b']);
        iterator._createTransformer.getCall(2).args.should.deep.equal(['c']);
        iterator._createTransformer.getCall(3).args.should.deep.equal(['d']);
        iterator._createTransformer.getCall(4).args.should.deep.equal(['e']);
        iterator._createTransformer.getCall(5).args.should.deep.equal(['f']);
      });
    });
  });

  describe('A MultiTransformIterator with transformers that asynchronously emit 1 item', function () {
    var iterator, source;
    before(function () {
      source = new ArrayIterator(['a', 'b', 'c', 'd', 'e', 'f']);
      iterator = new MultiTransformIterator(source);
      iterator._createTransformer = sinon.spy(function (item) {
        var transformer = new BufferedIterator();
        setImmediate(function () {
          transformer._push(item + '1');
          transformer.close();
        });
        return transformer;
      });
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should return the transformed items', function () {
        items.should.deep.equal(['a1', 'b1', 'c1', 'd1', 'e1', 'f1']);
      });
    });
  });

  describe('A MultiTransformIterator with transformers that asynchronously emit 3 items', function () {
    var iterator, source;
    before(function () {
      source = new ArrayIterator(['a', 'b', 'c', 'd', 'e', 'f']);
      iterator = new MultiTransformIterator(source);
      iterator._createTransformer = sinon.spy(function (item) {
        var transformer = new BufferedIterator();
        setImmediate(function () {
          transformer._push(item + '1');
          transformer._push(item + '2');
          transformer._push(item + '3');
          transformer.close();
        });
        return transformer;
      });
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should return the transformed items', function () {
        items.should.deep.equal([
          'a1', 'a2', 'a3',
          'b1', 'b2', 'b3',
          'c1', 'c2', 'c3',
          'd1', 'd2', 'd3',
          'e1', 'e2', 'e3',
          'f1', 'f2', 'f3',
        ]);
      });
    });
  });

  describe('A MultiTransformIterator with optional set to false', function () {
    var iterator, source;
    before(function () {
      source = new ArrayIterator([1, 2, 3, 4, 5, 6]);
      iterator = new MultiTransformIterator(source, { optional: false });
      iterator._createTransformer = sinon.spy(function (item) {
        switch (item) {
        case 3: return new EmptyIterator();
        case 6: return null;
        default: return new SingletonIterator('t' + item);
        }
      });
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should return the transformed items only', function () {
        items.should.deep.equal(['t1', 't2', 't4', 't5']);
      });
    });
  });

  describe('A MultiTransformIterator with optional set to true', function () {
    var iterator, source;
    before(function () {
      source = new ArrayIterator([1, 2, 3, 4, 5, 6]);
      iterator = new MultiTransformIterator(source, { optional: true });
      iterator._createTransformer = sinon.spy(function (item) {
        switch (item) {
        case 3: return new EmptyIterator();
        case 6: return null;
        default: return new SingletonIterator('t' + item);
        }
      });
    });

    describe('when reading items', function () {
      var items = [];
      before(function (done) {
        iterator.on('data', function (item) { items.push(item); });
        iterator.on('end', done);
      });

      it('should return the transformed items, and originals when the transformer is empty', function () {
        items.should.deep.equal(['t1', 't2', 3, 't4', 't5', 6]);
      });
    });
  });

  describe('A MultiTransformIterator with transformers that error', function () {
    var iterator, source;
    before(function () {
      source = new ArrayIterator(['a', 'b', 'c', 'd', 'e', 'f']);
      iterator = new MultiTransformIterator(source);
      iterator._createTransformer = sinon.spy(function (item) {
        var transformer = new BufferedIterator();
        setImmediate(function () {
          transformer.emit('error', new Error('Error ' + item));
        });
        return transformer;
      });
      captureEvents(iterator, 'error');
    });

    it('should emit `bufferSize` errors', function () {
      iterator._eventCounts.error.should.equal(4);
    });
  });
});
