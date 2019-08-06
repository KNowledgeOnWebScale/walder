var EventEmitter = require('events').EventEmitter;

/**
  Names of possible iterator states.
  The state's position in the array corresponds to its ID.

  @name AsyncIterator.STATES
  @type String[]
  @protected
*/
var STATES = AsyncIterator.STATES = ['INIT', 'OPEN', 'CLOSING', 'CLOSED', 'ENDED', 'DESTROYED'];
var INIT = 0, OPEN = 1, CLOSING = 2, CLOSED = 3, ENDED = 4, DESTROYED = 5;
STATES.forEach(function (state, id) { AsyncIterator[state] = id; });

/**
  ID of the INIT state.
  An iterator is initializing if it is preparing main item generation.
  It can already produce items.

  @name AsyncIterator.INIT
  @type integer
  @protected
*/

/**
  ID of the OPEN state.
  An iterator is open if it can generate new items.

  @name AsyncIterator.OPEN
  @type integer
  @protected
*/

/**
  ID of the CLOSING state.
  An iterator is closing if item generation is pending but will not be scheduled again.

  @name AsyncIterator.CLOSING
  @type integer
  @protected
*/

/**
  ID of the CLOSED state.
  An iterator is closed if it no longer actively generates new items.
  Items might still be available.

  @name AsyncIterator.CLOSED
  @type integer
  @protected
*/

/**
  ID of the ENDED state.
  An iterator has ended if no further items will become available.
  The 'end' event is guaranteed to have been called when in this state.

  @name AsyncIterator.ENDED
  @type integer
  @protected
*/

/**
 ID of the DESTROYED state.
 An iterator has been destroyed after calling {@link AsyncIterator#destroy}.
 The 'end' event has not been called, as pending elements were voided.

 @name AsyncIterator.DESTROYED
 @type integer
 @protected
 */




/**
  Creates a new `AsyncIterator`.

  @public
  @constructor
  @classdesc An asynchronous iterator provides pull-based access to a stream of objects.
  @extends EventEmitter
**/
function AsyncIterator() {
  if (!(this instanceof AsyncIterator))
    return new AsyncIterator();
  EventEmitter.call(this);
  this.on('newListener', waitForDataListener);
  this._state = OPEN;
  this._readable = false;
}

/**
  Makes the prototype of the current constructor a prototype for the given constructor.

  @protected
  @function AsyncIterator.subclass
  @param {Function} Constructor The constructor that should inherit from the current constructor
  @returns {AsyncIterator} The constructor's prototype
**/
(function subclass(Constructor) {
  Constructor.prototype = Object.create(this.prototype,
    { constructor: { value: Constructor, configurable: true, writable: true } });
  Constructor.subclass = subclass;
}).call(EventEmitter, AsyncIterator);

/**
  Changes the iterator to the given state if possible and necessary,
  possibly emitting events to signal that change.

  @protected
  @param {integer} newState The ID of the new state (from the `STATES` array)
  @param {boolean} [eventAsync=false] Whether resulting events should be emitted asynchronously
  @returns {boolean} Whether the state was changed
  @emits AsyncIterator.end
**/
AsyncIterator.prototype._changeState = function (newState, eventAsync) {
  // Validate the state change
  var valid = newState > this._state && this._state < ENDED;
  if (valid) {
    this._state = newState;
    // Emit the `end` event when changing to ENDED
    if (newState === ENDED)
      eventAsync ? setImmediate(emit, this, 'end') : this.emit('end');
  }
  return valid;
};
// Emits the event on the given EventEmitter
function emit(self, eventName) { self.emit(eventName); }

/**
  Tries to read the next item from the iterator.

  This is the main method for reading the iterator in _on-demand mode_,
  where new items are only created when needed by consumers.
  If no items are currently available, this methods returns `null`.
  The {@link AsyncIterator.event:readable} event will then signal when new items might be ready.

  To read all items from the iterator,
  switch to _flow mode_ by subscribing to the {@link AsyncIterator.event:data} event.
  When in flow mode, do not use the `read` method.

  @returns {object?} The next item, or `null` if none is available
**/
AsyncIterator.prototype.read = function () { return null; };

/**
  Emitted when the iterator might have new items available
  after having had no items available right before this event.

  If the iterator is not in flow mode,
  items can be retrieved by calling {@link AsyncIterator#read}.

  @event AsyncIterator.readable
**/

/**
  Invokes the callback for each remaining item in the iterator.

  Switches the iterator to flow mode.

  @param {Function} callback A function that will be called with each item
  @param {object?} self The `this` pointer for the callback
**/
AsyncIterator.prototype.each = function (callback, self) {
  this.on('data', self ? callback.bind(self) : callback);
};

/**
  Verifies whether the iterator has listeners for the given event.

  @private
  @param {string} eventName The name of the event
  @returns {boolean} Whether the iterator has listeners
**/
AsyncIterator.prototype._hasListeners = function (eventName) {
  return this._events && (eventName in this._events);
};

/**
  Adds the listener to the event, if it has not been added previously.

  @private
  @param {string} eventName The name of the event
  @param {Function} listener The listener to add
**/
AsyncIterator.prototype._addSingleListener = function (eventName, listener) {
  var listeners = this._events && this._events[eventName];
  if (!listeners ||
      (isFunction(listeners) ? listeners !== listener : listeners.indexOf(listener) < 0))
    this.on(eventName, listener);
};

/**
  Stops the iterator from generating new items.

  Already generated items or terminating items can still be emitted.
  After this, the iterator will end asynchronously.

  @emits AsyncIterator.end
**/
AsyncIterator.prototype.close = function () {
  if (this._changeState(CLOSED))
    endAsync(this);
};

/**
 Destroy the iterator and stop it from generating new items.

 This will not do anything if the iterator was already ended or destroyed.

 All internal resources will be released an no new items will be emitted,
 even not already generated items.

 Implementors should not override this method,
 but instead implement {@link AsyncIterator#_destroy}.

 @param {Error} [cause] An optional error to emit.
 @emits AsyncIterator.end
 @emits AsyncIterator.error Only emitted if an error is passed.
 **/
AsyncIterator.prototype.destroy = function (cause) {
  if (!this.done) {
    var self = this;
    this._destroy(cause, function (error) {
      cause = cause || error;
      if (cause)
        self.emit('error', cause);
      end(self, true);
    });
  }
};

/**
 Called by {@link AsyncIterator#destroy}.
 Implementers can override this, but this should not be called directly.

 @param {?Error} cause The reason why the iterator is destroyed.
 @param {Function} callback A callback function with an optional error argument.
 */
AsyncIterator.prototype._destroy = function (cause, callback) {
  callback();
};

/**
  Asynchronously ends the iterator and cleans up.

  Should never be called before {@link AsyncIterator#close};
  typically, `close` is responsible for calling `_end`.

  @param {boolean} [destroy] If the iterator should be forcefully destroyed.
  @protected
  @emits AsyncIterator.end
**/
AsyncIterator.prototype._end = function (destroy) {
  if (this._changeState(destroy ? DESTROYED : ENDED)) {
    this._readable = false;
    this.removeAllListeners('readable');
    this.removeAllListeners('data');
    this.removeAllListeners('end');
  }
};
function end(self, destroy) { self._end(destroy); }
function endAsync(self) { setImmediate(end, self); }

/**
  Emitted after the last item of the iterator has been read.

  @event AsyncIterator.end
**/

/**
  Gets or sets whether this iterator might have items available for read.

  A value of `false` means there are _definitely_ no items available;
  a value of `true` means items _might_ be available.

  @name AsyncIterator#readable
  @type boolean
  @emits AsyncIterator.readable
**/
Object.defineProperty(AsyncIterator.prototype, 'readable', {
  get: function () { return this._readable; },
  set: function (readable) {
    readable = !!readable && !this.done;
    // Set the readable value only if it has changed
    if (this._readable !== readable) {
      this._readable = readable;
      // If the iterator became readable, emit the `readable` event
      if (readable)
        setImmediate(emit, this, 'readable');
    }
  },
  enumerable: true,
});

/**
  Gets whether the iterator has stopped generating new items.

  @name AsyncIterator#closed
  @type boolean
  @readonly
**/
Object.defineProperty(AsyncIterator.prototype, 'closed', {
  get: function () { return this._state >= CLOSING; },
  enumerable: true,
});

/**
  Gets whether the iterator has finished emitting items.

  @name AsyncIterator#ended
  @type boolean
  @readonly
**/
Object.defineProperty(AsyncIterator.prototype, 'ended', {
  get: function () { return this._state === ENDED; },
  enumerable: true,
});

/**
 Gets whether the iterator has been destroyed.

 @name AsyncIterator#destroyed
 @type boolean
 @readonly
 **/
Object.defineProperty(AsyncIterator.prototype, 'destroyed', {
  get: function () { return this._state === DESTROYED; },
  enumerable: true,
});

/**
 Gets whether the iterator will not emit anymore items,
 either due to being closed or due to being destroyed.

 @name AsyncIterator#done
 @type boolean
 @readonly
 **/
Object.defineProperty(AsyncIterator.prototype, 'done', {
  get: function () { return this._state >= ENDED; },
  enumerable: true,
});

/**
  The iterator emits a `data` event with a new item as soon as it becomes available.

  When one or more listeners are attached to the `data` event,
  the iterator switches to _flow mode_,
  generating and emitting new items as fast as possible.
  This drains the source and might create backpressure on the consumers,
  so only subscribe to this event if this behavior is intended.
  In flow mode, don't use the {@link AsyncIterator#read} method.

  To switch back to _on-demand mode_, remove all listeners from the `data` event.
  You can then obtain items through {@link AsyncIterator#read} again.

  @event AsyncIterator.data
  @param {object} item The new item
**/

// Starts emitting `data` events when `data` listeners are added
function waitForDataListener(eventName) {
  if (eventName === 'data') {
    this.removeListener('newListener', waitForDataListener);
    this._addSingleListener('readable', emitData);
    if (this.readable)
      setImmediate(call, emitData, this);
  }
}
// Emits new items though `data` events as long as there are `data` listeners
function emitData() {
  // While there are `data` listeners and items, emit them
  var item;
  while (this._hasListeners('data') && (item = this.read()) !== null)
    this.emit('data', item);
  // Stop draining the source if there are no more `data` listeners
  if (!this._hasListeners('data') && !this.done) {
    this.removeListener('readable', emitData);
    this._addSingleListener('newListener', waitForDataListener);
  }
}
// Calls the given function with the specified argument as `this` value
function call(func, self) { func.call(self); }

/**
  Retrieves the property with the given name from the iterator.

  If no callback is passed, it returns the value of the property
  or `undefined` if the property is not set.

  If a callback is passed, it returns `undefined`
  and calls the callback with the property the moment it is set.

  @param {string} propertyName The name of the property to retrieve
  @param {Function} [callback] A one-argument callback to receive the property value
  @returns {object?} The value of the property (if set and no callback is given)
**/
AsyncIterator.prototype.getProperty = function (propertyName, callback) {
  var properties = this._properties, propertyCallbacks;
  // If no callback was passed, return the property value
  if (!callback)
    return properties && properties[propertyName];
  // If the value has been set, send it through the callback
  if (properties && (propertyName in properties))
    setImmediate(callback, properties[propertyName]);
  // If the value was not set, store the callback for when the value will be set
  else {
    if (!(propertyCallbacks = this._propertyCallbacks))
      this._propertyCallbacks = propertyCallbacks = Object.create(null);
    if (propertyName in propertyCallbacks)
      propertyCallbacks[propertyName].push(callback);
    else
      propertyCallbacks[propertyName] = [callback];
  }
};

/**
  Sets the property with the given name to the value.

  @param {string} propertyName The name of the property to set
  @param {object?} value The new value of the property
**/
AsyncIterator.prototype.setProperty = function (propertyName, value) {
  var properties = this._properties || (this._properties = Object.create(null));
  properties[propertyName] = value;
  // Execute getter callbacks that were waiting for this property to be set
  var propertyCallbacks = this._propertyCallbacks, callbacks;
  if (callbacks = propertyCallbacks && propertyCallbacks[propertyName]) {
    delete propertyCallbacks[propertyName];
    if (callbacks.length === 1)
      setImmediate(callbacks[0], value);
    else {
      setImmediate(function () {
        for (var i = 0; i < callbacks.length; i++)
          callbacks[i](value);
      });
    }
    // Remove _propertyCallbacks if no pending callbacks are left
    for (propertyName in propertyCallbacks) return;
    delete this._propertyCallbacks;
  }
};

/**
  Retrieves all properties of the iterator.

  @returns {object} An object with property names as keys.
**/
AsyncIterator.prototype.getProperties = function () {
  var properties = this._properties, copy = {};
  for (var name in properties)
    copy[name] = properties[name];
  return copy;
};

/**
  Sets all of the given properties.

  @param {object} properties Key/value pairs of properties to set
**/
AsyncIterator.prototype.setProperties = function (properties) {
  for (var propertyName in properties)
    this.setProperty(propertyName, properties[propertyName]);
};

/**
  Copies the given properties from the source iterator.

  @param {AsyncIterator} source The iterator to copy from
  @param {Array} propertyNames List of property names to copy
**/
AsyncIterator.prototype.copyProperties = function (source, propertyNames) {
  for (var i = 0; i < propertyNames.length; i++)
    copyProperty(source, this, propertyNames[i]);
};
function copyProperty(source, destination, propertyName) {
  source.getProperty(propertyName, function (value) {
    destination.setProperty(propertyName, value);
  });
}

/* Generates a textual representation of the iterator. */
AsyncIterator.prototype.toString = function () {
  var details = this._toStringDetails();
  return '[' + this.constructor.name + (details ? ' ' + details + ']' : ']');
};

/**
  Generates details for a textual representation of the iterator.

  @protected
**/
AsyncIterator.prototype._toStringDetails = function () { };



/**
  Creates a new `EmptyIterator`.

  @constructor
  @classdesc An iterator that doesn't emit any items.
  @extends AsyncIterator
**/
function EmptyIterator() {
  if (!(this instanceof EmptyIterator))
    return new EmptyIterator();
  AsyncIterator.call(this);
  this._changeState(ENDED, true);
}
AsyncIterator.subclass(EmptyIterator);



/**
  Creates a new `SingletonIterator`.

  @constructor
  @classdesc An iterator that emits a single item.
  @param {object} item The item that will be emitted.
  @extends AsyncIterator
**/
function SingletonIterator(item) {
  if (!(this instanceof SingletonIterator))
    return new SingletonIterator(item);
  AsyncIterator.call(this);

  this._item = item;
  if (item === null)
    this.close();
  else
    this.readable = true;
}
AsyncIterator.subclass(SingletonIterator);

/* Reads the item from the iterator. */
SingletonIterator.prototype.read = function () {
  var item = this._item;
  this._item = null;
  this.close();
  return item;
};

/* Generates details for a textual representation of the iterator. */
SingletonIterator.prototype._toStringDetails = function () {
  return this._item === null ? '' : '(' + this._item + ')';
};



/**
  Creates a new `ArrayIterator`.

  @constructor
  @classdesc An iterator that emits the items of a given array.
  @param {Array} items The items that will be emitted.
  @extends AsyncIterator
**/
function ArrayIterator(items) {
  if (!(this instanceof ArrayIterator))
    return new ArrayIterator(items);
  AsyncIterator.call(this);

  if (!(items && items.length > 0))
    return this.close();

  this._buffer = Array.prototype.slice.call(items);
  this.readable = true;
}
AsyncIterator.subclass(ArrayIterator);

/* Reads an item from the iterator. */
ArrayIterator.prototype.read = function () {
  var buffer = this._buffer, item = null;
  if (buffer) {
    item = buffer.shift();
    if (!buffer.length) {
      delete this._buffer;
      this.close();
    }
  }
  return item;
};

/* Generates details for a textual representation of the iterator. */
ArrayIterator.prototype._toStringDetails = function () {
  return '(' + (this._buffer && this._buffer.length || 0) + ')';
};

/* Called by {@link AsyncIterator#destroy} */
ArrayIterator.prototype._destroy = function (error, callback) {
  delete this._buffer;
  callback();
};



/**
  Creates a new `IntegerIterator`.

  @constructor
  @classdesc An iterator that enumerates integers in a certain range.
  @param {object} [options] Settings of the iterator
  @param {integer} [options.start=0] The first number to emit
  @param {integer} [options.end=Infinity] The last number to emit
  @param {integer} [options.step=1] The increment between two numbers
  @extends AsyncIterator
**/
function IntegerIterator(options) {
  if (!(this instanceof IntegerIterator))
    return new IntegerIterator(options);
  AsyncIterator.call(this);

  // Set start, end, and step
  options = options || {};
  var step = options.step, limit, last = options.end, next = options.start;
  this._step = step  = isFinite(step) ? ~~step : 1;
  limit      = step >= 0 ? Infinity : -Infinity; // counting towards plus or minus infinity?
  this._last = last  = isFinite(last) ? ~~last : (last === -limit ? last : limit);
  this._next = next  = typeof next !== 'number' ? 0 : (isFinite(next) ? ~~next : next);

  // Start iteration if there is at least one item; close otherwise
  if (!isFinite(next) || (step >= 0 ? next > last : next < last))
    this.close();
  else
    this.readable = true;
}
AsyncIterator.subclass(IntegerIterator);

/* Reads an item from the iterator. */
IntegerIterator.prototype.read = function () {
  if (this.closed)
    return null;
  var current = this._next, step = this._step, last = this._last, next = this._next += step;
  if (step >= 0 ? next > last : next < last)
    this.close();
  return current;
};

/* Generates details for a textual representation of the iterator. */
IntegerIterator.prototype._toStringDetails = function () {
  return '(' + this._next + '...' + this._last + ')';
};

/**
  Creates an iterator of natural numbers within the given range.

  The current iterator may not be read anymore until the returned iterator ends.

  @param {integer} [start=0] The first number to emit
  @param {integer} [end=Infinity] The last number to emit
  @param {integer} [step=1] The increment between two numbers
  @returns {IntegerIterator} An iterator of natural numbers within the given range
**/
AsyncIterator.range = function (start, end, step) {
  return new IntegerIterator({ start: start, end: end, step: step });
};



/**
  Creates a new `BufferedIterator`.

  @constructor
  @classdesc A iterator that maintains an internal buffer of items.

  This class serves as a base class for other iterators
  with a typically complex item generation process.
  @param {object} [options] Settings of the iterator
  @param {integer} [options.maxBufferSize=4] The number of items to preload in the internal buffer
  @param {boolean} [options.autoStart=true] Whether buffering starts directly after construction
  @extends AsyncIterator
**/
function BufferedIterator(options) {
  if (!(this instanceof BufferedIterator))
    return new BufferedIterator(options);
  AsyncIterator.call(this);

  options = options || {};

  // Set up the internal buffer
  var maxBufferSize = options.maxBufferSize, autoStart = options.autoStart;
  this._state  = INIT;
  this._buffer = [];
  this._pushedCount = 0;
  this.maxBufferSize = maxBufferSize;

  // Acquire reading lock to read initialization items
  this._reading = true;
  setImmediate(init, this, autoStart !== false || autoStart);
}
AsyncIterator.subclass(BufferedIterator);

/**
  Gets or sets the maximum number of items to preload in the internal buffer.

  A `BufferedIterator` tries to fill its buffer as far as possible.
  Set to `Infinity` to fully drain the source.

  @name BufferedIterator#maxBufferSize
  @type number
**/
Object.defineProperty(BufferedIterator.prototype, 'maxBufferSize', {
  set: function (maxBufferSize) {
    // Allow only positive integers and infinity
    if (maxBufferSize !== Infinity)
      maxBufferSize = isFinite(maxBufferSize) ? Math.max(~~maxBufferSize, 1) : 4;
    // Only set the maximum buffer size if it changes
    if (this._maxBufferSize !== maxBufferSize) {
      this._maxBufferSize = maxBufferSize;
      // Ensure sufficient elements are buffered
      if (this._state === OPEN)
        this._fillBuffer();
    }
  },
  get: function () { return this._maxBufferSize; },
  enumerable: true,
});

/**
  Initializing the iterator by calling {@link BufferedIterator#_begin}
  and changing state from INIT to OPEN.

  @protected
  @param {boolean} autoStart Whether reading of items should immediately start after OPEN.
**/
BufferedIterator.prototype._init = function (autoStart) {
  // Perform initialization tasks
  var self = this;
  this._reading = true;
  this._begin(function () {
    if (!self)
      throw new Error('done callback called multiple times');
    // Open the iterator and start buffering
    self._reading = false;
    self._changeState(OPEN);
    if (autoStart)
      fillBufferAsync(self);
    // If reading should not start automatically, the iterator doesn't become readable.
    // Therefore, mark the iterator as (potentially) readable so consumers know it might be read.
    else
      self.readable = true;
    self = null;
  });
};
function init(self, autoStart) { self._init(autoStart); }

/**
  Writes beginning items and opens iterator resources.

  Should never be called before {@link BufferedIterator#_init};
  typically, `_init` is responsible for calling `_begin`.

  @protected
  @param {function} done To be called when initialization is complete
**/
BufferedIterator.prototype._begin = function (done) { done(); };

/**
  Tries to read the next item from the iterator.

  If the buffer is empty,
  this method calls {@link BufferedIterator#_read} to fetch items.
  @returns {object?} The next item, or `null` if none is available
**/
BufferedIterator.prototype.read = function () {
  if (this.done)
    return null;

  // Try to retrieve an item from the buffer
  var buffer = this._buffer, item;
  if (buffer.length)
    item = buffer.shift();
  else {
    item = null;
    this.readable = false;
  }

  // If the buffer is becoming empty, either fill it or end the iterator
  if (!this._reading && buffer.length < this._maxBufferSize) {
    // If the iterator is not closed and thus may still generate new items, fill the buffer
    if (!this.closed)
      fillBufferAsync(this);
    // No new items will be generated, so if none are buffered, the iterator ends here
    else if (!buffer.length)
      endAsync(this);
  }

  return item;
};

/**
  Tries to generate the given number of items.

  Implementers should add `count` items through {@link BufferedIterator#_push}.

  @protected
  @param {integer} count The number of items to generate
  @param {function} done To be called when reading is complete
**/
BufferedIterator.prototype._read = function (count, done) { done(); };

/**
  Adds an item to the internal buffer.

  @protected
  @param {object} item The item to add
  @emits AsyncIterator.readable
**/
BufferedIterator.prototype._push = function (item) {
  if (!this.done) {
    this._pushedCount++;
    this._buffer.push(item);
    this.readable = true;
  }
};

/**
  Fills the internal buffer until `this._maxBufferSize` items are present.

  This method calls {@link BufferedIterator#_read} to fetch items.

  @protected
  @emits AsyncIterator.readable
**/
BufferedIterator.prototype._fillBuffer = function () {
  var self = this, neededItems;
  // Avoid recursive reads
  if (this._reading)
    return;
  // If iterator closing started in the meantime, don't generate new items anymore
  else if (this.closed)
    this._completeClose();
  // Otherwise, try to fill empty spaces in the buffer by generating new items
  else if ((neededItems = Math.min(this._maxBufferSize - this._buffer.length, 128)) > 0) {
    // Acquire reading lock and start reading, counting pushed items
    this._pushedCount = 0;
    this._reading = true;
    this._read(neededItems, function () {
      // Verify the callback is only called once
      if (!neededItems)
        throw new Error('done callback called multiple times');
      neededItems = 0;
      // Release reading lock
      self._reading = false;
      // If the iterator was closed while reading, complete closing
      if (self.closed)
        self._completeClose();
      // If the iterator pushed one or more items,
      // it might currently be able to generate additional items
      // (even though all pushed items might already have been read)
      else if (self._pushedCount) {
        self.readable = true;
        // If the buffer is insufficiently full, continue filling
        if (self._buffer.length < self._maxBufferSize / 2)
          fillBufferAsync(self);
      }
    });
  }
};
function fillBufferAsync(self) {
  // Acquire reading lock to avoid recursive reads
  if (!self._reading) {
    self._reading = true;
    setImmediate(fillBufferAsyncCallback, self);
  }
}
function fillBufferAsyncCallback(self) {
  // Release reading lock so _fillBuffer` can take it
  self._reading = false;
  self._fillBuffer();
}

/**
  Stops the iterator from generating new items
  after a possible pending read operation has finished.

  Already generated, pending, or terminating items can still be emitted.
  After this, the iterator will end asynchronously.

  @emits AsyncIterator.end
**/
BufferedIterator.prototype.close = function () {
  // If the iterator is not currently reading, we can close immediately
  if (!this._reading)
    this._completeClose();
  // Closing cannot complete when reading, so temporarily assume CLOSING state
  // `_fillBuffer` becomes responsible for calling `_completeClose`
  else
    this._changeState(CLOSING);
};

/**
  Stops the iterator from generating new items,
  switching from `CLOSING` state into `CLOSED` state.

  @protected
  @emits AsyncIterator.end
**/
BufferedIterator.prototype._completeClose = function () {
  if (this._changeState(CLOSED)) {
    // Write possible terminating items
    var self = this;
    this._reading = true;
    this._flush(function () {
      if (!self._reading)
        throw new Error('done callback called multiple times');
      self._reading = false;
      // If no items are left, end the iterator
      // Otherwise, `read` becomes responsible for ending the iterator
      if (!self._buffer.length)
        endAsync(self);
    });
  }
};

/* Called by {@link AsyncIterator#destroy} */
BufferedIterator.prototype._destroy = function (error, callback) {
  this._buffer = [];
  callback();
};

/**
  Writes terminating items and closes iterator resources.

  Should never be called before {@link BufferedIterator#close};
  typically, `close` is responsible for calling `_flush`.

  @protected
  @param {function} done To be called when termination is complete
**/
BufferedIterator.prototype._flush = function (done) { done(); };

/* Generates details for a textual representation of the iterator. */
BufferedIterator.prototype._toStringDetails = function () {
  var buffer = this._buffer, length = buffer.length;
  return '{' + (length ? 'next: ' + buffer[0] + ', ' : '') + 'buffer: ' + length + '}';
};




/**
  Creates a new `TransformIterator`.

  This class serves as a base class for other iterators.

  @constructor
  @classdesc An iterator that generates items based on a source iterator.
  @param {AsyncIterator|Readable} [source] The source this iterator generates items from
  @param {object} [options] Settings of the iterator
  @param {integer} [options.maxBufferSize=4] The maximum number of items to keep in the buffer
  @param {boolean} [options.autoStart=true] Whether buffering starts directly after construction
  @param {boolean} [options.optional=false] If transforming is optional, the original item is pushed when its transformation yields no items
  @param {boolean} [options.destroySource=true] Whether the source should be destroyed when this transformed iterator is closed or destroyed
  @param {AsyncIterator} [options.source] The source this iterator generates items from
  @extends BufferedIterator
**/
function TransformIterator(source, options) {
  if (!(this instanceof TransformIterator))
    return new TransformIterator(source, options);
  // Shift arguments if the first is not a source
  if (!source || !isFunction(source.read)) {
    if (!options) options = source;
    source = options && options.source;
  }
  BufferedIterator.call(this, options);
  if (source) this.source = source;
  this._optional = !!(options && options.optional);
  this._destroySource = !options || options.destroySource !== false;
}
BufferedIterator.subclass(TransformIterator);

/**
  Gets or sets the source this iterator generates items from.

  @name TransformIterator#source
  @type AsyncIterator
**/
Object.defineProperty(TransformIterator.prototype, 'source', {
  set: function (source) {
    // Validate and set source
    this._validateSource(source);
    this._source = source;
    source._destination = this;

    // Close this iterator if the source has already ended
    if (source.ended)
      this.close();
    // Otherwise, react to source events
    else {
      source.on('end',      destinationCloseWhenDone);
      source.on('readable', destinationFillBuffer);
      source.on('error',    destinationEmitError);
    }
  },
  get: getSource,
  enumerable: true,
});
function getSource() { return this._source; }
function destinationEmitError(error) { this._destination.emit('error', error); }
function destinationCloseWhenDone()  { this._destination._closeWhenDone(); }
function destinationFillBuffer()     { this._destination._fillBuffer(); }

/**
  Validates whether the given iterator can be used as a source.

  @protected
  @param {object} source The source to validate
  @param {boolean} allowDestination Whether the source can already have a destination
**/
TransformIterator.prototype._validateSource = function (source, allowDestination) {
  if (this._source)
    throw new Error('The source cannot be changed after it has been set');
  if (!source || !isFunction(source.read) || !isFunction(source.on))
    throw new Error('Invalid source: ' + source);
  if (!allowDestination && source._destination)
    throw new Error('The source already has a destination');
};

/* Tries to read a transformed item */
TransformIterator.prototype._read = function (count, done) {
  var self = this;
  readAndTransform(self, function next() {
    // Continue transforming until at least `count` items have been pushed
    if (self._pushedCount < count && !self.closed)
      setImmediate(readAndTransform, self, next, done);
    else
      done();
  }, done);
};
function readAndTransform(self, next, done) {
  // If the source exists and still can read items,
  // try to read and transform the next item.
  var source = self._source, item;
  if (source && !source.ended && (item = source.read()) !== null) {
    if (!self._optional)
      self._transform(item, next);
    else
      optionalTransform(self, item, next);
  }
  else
    done();
}
// Tries to transform the item;
// if the transformation yields no items, pushes the original item
function optionalTransform(self, item, done) {
  var pushedCount = self._pushedCount;
  self._transform(item, function () {
    if (pushedCount === self._pushedCount)
      self._push(item);
    done();
  });
}

/**
  Generates items based on the item from the source.

  Implementers should add items through {@link BufferedIterator#_push}.
  The default implementation pushes the source item as-is.

  @protected
  @param {object} item The last read item from the source
  @param {function} done To be called when reading is complete
**/
TransformIterator.prototype._transform = function (item, done) {
  this._push(item), done();
};

/**
  Closes the iterator when pending items are transformed.

  @protected
**/
TransformIterator.prototype._closeWhenDone = function () {
  this.close();
};

/* Cleans up the source iterator and ends. */
TransformIterator.prototype._end = function (destroy) {
  var source = this._source;
  if (source) {
    source.removeListener('end',      destinationCloseWhenDone);
    source.removeListener('error',    destinationEmitError);
    source.removeListener('readable', destinationFillBuffer);
    delete source._destination;
    if (this._destroySource)
      source.destroy();
  }
  BufferedIterator.prototype._end.call(this, destroy);
};

/**
  Creates an iterator that wraps around a given iterator or readable stream.

  Use this to convert an iterator-like object into a full-featured AsyncIterator.

  After this operation, only read the returned iterator instead of the given one.

  @function
  @param {AsyncIterator|Readable} [source] The source this iterator generates items from
  @param {object} [options] Settings of the iterator
  @returns {AsyncIterator} A new iterator with the items from the given iterator
**/
AsyncIterator.wrap = TransformIterator;




/**
  Creates a new `SimpleTransformIterator`.

  @constructor
  @classdesc An iterator that generates items based on a source iterator
             and simple transformation steps passed as arguments.
  @param {AsyncIterator|Readable} [source] The source this iterator generates items from
  @param {object|Function} [options] Settings of the iterator, or the transformation function
  @param {integer} [options.maxbufferSize=4] The maximum number of items to keep in the buffer
  @param {boolean} [options.autoStart=true] Whether buffering starts directly after construction
  @param {AsyncIterator} [options.source] The source this iterator generates items from
  @param {integer} [options.offset] The number of items to skip
  @param {integer} [options.limit] The maximum number of items
  @param {Function} [options.filter] A function to synchronously filter items from the source
  @param {Function} [options.map] A function to synchronously transform items from the source
  @param {Function} [options.transform] A function to asynchronously transform items from the source
  @param {boolean} [options.optional=false] If transforming is optional, the original item is pushed when its mapping yields `null` or its transformation yields no items
  @param {Array|AsyncIterator} [options.prepend] Items to insert before the source items
  @param {Array|AsyncIterator} [options.append]  Items to insert after the source items
  @extends TransformIterator
**/
function SimpleTransformIterator(source, options) {
  if (!(this instanceof SimpleTransformIterator))
    return new SimpleTransformIterator(source, options);
  TransformIterator.call(this, source, options);

  // Set transformation steps from the options
  if (options = options || !isFunction(source && source.read) && source) {
    var limit = options.limit, offset = options.offset,
        filter = options.filter, map = options.map,
        transform = isFunction(options) ? options : options.transform,
        prepend = options.prepend, append = options.append;
    // Don't emit any items when bounds are unreachable
    if (offset === Infinity || limit === -Infinity)
      this._limit = 0;
    else {
      if (isFinite(offset))      this._offset    = Math.max(~~offset, 0);
      if (isFinite(limit))       this._limit     = Math.max(~~limit,  0);
      if (isFunction(filter))    this._filter    = filter;
      if (isFunction(map))       this._map       = map;
      if (isFunction(transform)) this._transform = transform;
    }
    if (prepend) this._prepender = prepend.on ? prepend : new ArrayIterator(prepend);
    if (append)  this._appender  = append.on  ? append  : new ArrayIterator(append);
  }
}
TransformIterator.subclass(SimpleTransformIterator);

// Default settings
SimpleTransformIterator.prototype._offset = 0;
SimpleTransformIterator.prototype._limit = Infinity;
SimpleTransformIterator.prototype._filter = function ()  { return true; };
SimpleTransformIterator.prototype._map = null;
SimpleTransformIterator.prototype._transform = null;

/* Tries to read and transform items */
SimpleTransformIterator.prototype._read = function (count, done) {
  var self = this;
  readAndTransformSimple(self, count, function next() {
    setImmediate(readAndTransformSimple, self, count, next, done);
  }, done);
};
function readAndTransformSimple(self, count, next, done) {
  // Verify we have a readable source
  var source = self._source, item;
  if (!source || source.ended) {
    done();
    return;
  }
  // Verify we are still below the limit
  if (self._limit === 0)
    self.close();

  // Try to read the next item until at least `count` items have been pushed
  while (!self.closed && self._pushedCount < count && (item = source.read()) !== null) {
    // Verify the item passes the filter and we've reached the offset
    if (!self._filter(item) || self._offset !== 0 && self._offset--)
      continue;

    // Synchronously map the item
    var mappedItem = self._map === null ? item : self._map(item);
    // Skip `null` items, pushing the original item if the mapping was optional
    if (mappedItem === null) {
      if (self._optional)
        self._push(item);
    }
    // Skip the asynchronous phase if no transformation was specified
    else if (self._transform === null)
      self._push(mappedItem);
    // Asynchronously transform the item, and wait for `next` to call back
    else {
      if (!self._optional)
        self._transform(mappedItem, next);
      else
        optionalTransform(self, mappedItem, next);
      return;
    }

    // Stop when we've reached the limit
    if (--self._limit === 0)
      self.close();
  }
  done();
}

// Prepends items to the iterator
SimpleTransformIterator.prototype._begin = function (done) {
  this._insert(this._prepender, done);
  delete this._prepender;
};

// Appends items to the iterator
SimpleTransformIterator.prototype._flush = function (done) {
  this._insert(this._appender, done);
  delete this._appender;
};

// Inserts items in the iterator
SimpleTransformIterator.prototype._insert = function (inserter, done) {
  var self = this;
  if (!inserter || inserter.ended)
    done();
  else {
    inserter.on('data', push);
    inserter.on('end',  end);
  }
  function push(item) { self._push(item); }
  function end() {
    inserter.removeListener('data', push);
    inserter.removeListener('end',  end);
    done();
  }
};

/**
  Transforms items from this iterator.

  After this operation, only read the returned iterator instead of the current one.

  @param {object|Function} [options] Settings of the iterator, or the transformation function
  @param {integer} [options.maxbufferSize=4] The maximum number of items to keep in the buffer
  @param {boolean} [options.autoStart=true] Whether buffering starts directly after construction
  @param {integer} [options.offset] The number of items to skip
  @param {integer} [options.limit] The maximum number of items
  @param {Function} [options.filter] A function to synchronously filter items from the source
  @param {Function} [options.map] A function to synchronously transform items from the source
  @param {Function} [options.transform] A function to asynchronously transform items from the source
  @param {boolean} [options.optional=false] If transforming is optional, the original item is pushed when its mapping yields `null` or its transformation yields no items
  @param {Array|AsyncIterator} [options.prepend] Items to insert before the source items
  @param {Array|AsyncIterator} [options.append]  Items to insert after the source items
  @returns {AsyncIterator} A new iterator that maps the items from this iterator
**/
AsyncIterator.prototype.transform = function (options) {
  return new SimpleTransformIterator(this, options);
};

/**
  Maps items from this iterator using the given function.

  After this operation, only read the returned iterator instead of the current one.

  @param {Function} mapper A mapping function to call on this iterator's (remaining) items
  @param {object?} self The `this` pointer for the mapping function
  @returns {AsyncIterator} A new iterator that maps the items from this iterator
**/
AsyncIterator.prototype.map = function (mapper, self) {
  return this.transform({ map: self ? mapper.bind(self) : mapper });
};

/**
  Return items from this iterator that match the filter.

  After this operation, only read the returned iterator instead of the current one.

  @param {Function} filter A filter function to call on this iterator's (remaining) items
  @param {object?} self The `this` pointer for the filter function
  @returns {AsyncIterator} A new iterator that filters items from this iterator
**/
AsyncIterator.prototype.filter = function (filter, self) {
  return this.transform({ filter: self ? filter.bind(self) : filter });
};

/**
  Prepends the items after those of the current iterator.

  After this operation, only read the returned iterator instead of the current one.

  @param {Array|AsyncIterator} items Items to insert before this iterator's (remaining) items
  @returns {AsyncIterator} A new iterator that prepends items to this iterator
**/
AsyncIterator.prototype.prepend = function (items) {
  return this.transform({ prepend: items });
};

/**
  Appends the items after those of the current iterator.

  After this operation, only read the returned iterator instead of the current one.

  @param {Array|AsyncIterator} items Items to insert after this iterator's (remaining) items
  @returns {AsyncIterator} A new iterator that appends items to this iterator
**/
AsyncIterator.prototype.append = function (items) {
  return this.transform({ append: items });
};

/**
  Surrounds items of the current iterator with the given items.

  After this operation, only read the returned iterator instead of the current one.

  @param {Array|AsyncIterator} prepend Items to insert before this iterator's (remaining) items
  @param {Array|AsyncIterator} append Items to insert after this iterator's (remaining) items
  @returns {AsyncIterator} A new iterator that appends and prepends items to this iterator
**/
AsyncIterator.prototype.surround = function (prepend, append) {
  return this.transform({ prepend: prepend, append: append });
};

/**
  Skips the given number of items from the current iterator.

  The current iterator may not be read anymore until the returned iterator ends.

  @param {integer} offset The number of items to skip
  @returns {AsyncIterator} A new iterator that skips the given number of items
**/
AsyncIterator.prototype.skip = function (offset) {
  return this.transform({ offset: offset });
};

/**
  Limits the current iterator to the given number of items.

  The current iterator may not be read anymore until the returned iterator ends.

  @param {integer} limit The maximum number of items
  @returns {AsyncIterator} A new iterator with at most the given number of items
**/
AsyncIterator.prototype.take = function (limit) {
  return this.transform({ limit: limit });
};

/**
  Limits the current iterator to the given range.

  The current iterator may not be read anymore until the returned iterator ends.

  @param {integer} start Index of the first item to return
  @param {integer} end Index of the last item to return
  @returns {AsyncIterator} A new iterator with items in the given range
**/
AsyncIterator.prototype.range = function (start, end) {
  return this.transform({ offset: start, limit: Math.max(end - start + 1, 0) });
};




/**
  Creates a new `MultiTransformIterator`.

  @constructor
  @classdesc An iterator that generates items by transforming each item of a source
             with a different iterator.
  @param {AsyncIterator|Readable} [source] The source this iterator generates items from
  @param {object} [options] Settings of the iterator
  @extends TransformIterator
**/
function MultiTransformIterator(source, options) {
  if (!(this instanceof MultiTransformIterator))
    return new MultiTransformIterator(source, options);
  TransformIterator.call(this, source, options);
  this._transformerQueue = [];
}
TransformIterator.subclass(MultiTransformIterator);

/* Tries to read and transform items */
MultiTransformIterator.prototype._read = function (count, done) {
  // Remove transformers that have ended
  var item, head, transformer, transformerQueue = this._transformerQueue,
      source = this._source, optional = this._optional;
  while ((head = transformerQueue[0]) && head.transformer.ended) {
    // If transforming is optional, push the original item if none was pushed
    if (optional && head.item !== null)
      this._push(head.item), count--;
    // Remove listeners from the transformer
    head = transformerQueue.shift(), transformer = head.transformer;
    transformer.removeListener('end',      destinationFillBuffer);
    transformer.removeListener('readable', destinationFillBuffer);
    transformer.removeListener('error',    destinationEmitError);
  }

  // Create new transformers if there are less than the maximum buffer size
  while (source && !source.ended && transformerQueue.length < this._maxBufferSize) {
    // Read an item to create the next transformer
    item = this._source.read();
    if (item === null)
      break;
    // Create the transformer and listen to its events
    transformer = this._createTransformer(item) || new EmptyIterator();
    transformer._destination = this;
    transformer.on('end',      destinationFillBuffer);
    transformer.on('readable', destinationFillBuffer);
    transformer.on('error',    destinationEmitError);
    transformerQueue.push({ transformer: transformer, item: item });
  }

  // Try to read `count` items from the transformer
  head = transformerQueue[0];
  if (head) {
    transformer = head.transformer;
    while (count-- > 0 && (item = transformer.read()) !== null) {
      this._push(item);
      // If a transformed item was pushed, no need to push the original anymore
      if (optional)
        head.item = null;
    }
  }
  // End the iterator if the source has ended
  else if (source && source.ended)
    this.close();
  done();
};

/**
  Creates a transformer for the given item.

  @param {object} item The last read item from the source
  @returns {AsyncIterator} An iterator that transforms the given item
**/
MultiTransformIterator.prototype._createTransformer = SingletonIterator;

/* Closes the iterator when pending items are transformed. */
MultiTransformIterator.prototype._closeWhenDone = function () {
  // Only close if all transformers are read
  if (!this._transformerQueue.length)
    this.close();
};




/**
  Creates a new `ClonedIterator`.

  @constructor
  @classdesc An iterator that copies items from another iterator.
  @param {AsyncIterator|Readable} [source] The source this iterator copies items from
  @extends TransformIterator
**/
function ClonedIterator(source) {
  if (!(this instanceof ClonedIterator))
    return new ClonedIterator(source);
  // Although ClonedIterator inherits from TransformIterator and hence BufferedIterator,
  // we do not need the buffering because items arrive directly from a history buffer.
  // Therefore, initialize as an AsyncIterator, which does not set up buffering.
  AsyncIterator.call(this);

  this._readPosition = 0;
  if (source) this.source = source;
}
TransformIterator.subclass(ClonedIterator);

// The source this iterator copies items from
Object.defineProperty(ClonedIterator.prototype, 'source', {
  set: function (source) {
    // Validate and set the source
    var history = source && source._destination;
    this._validateSource(source, !history || history instanceof HistoryReader);
    this._source = source;
    // Create a history reader for the source if none already existed
    if (!history)
      history = source._destination = new HistoryReader(source);

    // Close this clone if history is empty and the source has ended
    if (history.endsAt(0))
      this.close();
    else {
      // Subscribe to history events
      history.register(this);
      // If there are already items in history, this clone is readable
      if (history.readAt(0) !== null)
        this.readable = true;
    }

    // Hook pending property callbacks to the source
    var propertyCallbacks = this._propertyCallbacks;
    for (var propertyName in propertyCallbacks) {
      var callbacks = propertyCallbacks[propertyName];
      for (var i = 0; i < callbacks.length; i++)
        getSourceProperty(this, source, propertyName, callbacks[i]);
    }
  },
  get: getSource,
  enumerable: true,
});

// Retrieves the property with the given name from the clone or its source.
ClonedIterator.prototype.getProperty = function (propertyName, callback) {
  var properties = this._properties, source = this._source,
      hasProperty = properties && (propertyName in properties);
  // If no callback was passed, return the property value
  if (!callback)
    return hasProperty ? properties[propertyName] : source && source.getProperty(propertyName);
  // Try to look up the property in this clone
  AsyncIterator.prototype.getProperty.call(this, propertyName, callback);
  // If the property is not set on this clone, it might become set on the source first
  if (source && !hasProperty)
    getSourceProperty(this, source, propertyName, callback);
};
// Retrieves the property with the given name from the source
function getSourceProperty(clone, source, propertyName, callback) {
  source.getProperty(propertyName, function (value) {
    // Only send the source's property if it was not set on the clone in the meantime
    if (!clone._properties || !(propertyName in clone._properties))
      callback(value);
  });
}

// Retrieves all properties of the iterator and its source.
ClonedIterator.prototype.getProperties = function () {
  var base = this._source ? this._source.getProperties() : {}, properties = this._properties;
  for (var name in properties)
    base[name] = properties[name];
  return base;
};

/* Generates details for a textual representation of the iterator. */
ClonedIterator.prototype._toStringDetails = function () {
  var source = this._source;
  return '{source: ' + (source ? source.toString() : 'none') + '}';
};

// Stores the history of a source, so it can be cloned
function HistoryReader(source) {
  var history = [], clones;

  // Tries to read the item at the given history position
  this.readAt = function (pos) {
    var item = null;
    // Retrieve an item from history when available
    if (pos < history.length)
      item = history[pos];
    // Read a new item from the source when possible
    else if (!source.ended && (item = source.read()) !== null)
      history[pos] = item;
    return item;
  };

  // Determines whether the given position is the end of the source
  this.endsAt = function (pos) {
    return pos === history.length && source.ended;
  };

  // Registers a clone for history updates
  this.register = function (clone) { clones && clones.push(clone); };

  // Unregisters a clone for history updates
  this.unregister = function (clone) {
    var cloneIndex;
    if (clones && (cloneIndex = clones.indexOf(clone)) >= 0)
      clones.splice(cloneIndex, 1);
  };

  // Listen to source events to trigger events in subscribed clones
  if (!source.ended) {
    clones = [];
    // When the source becomes readable, make all clones readable
    source.on('readable', clonesMakeReadable);
    function clonesMakeReadable() {
      for (var i = 0; i < clones.length; i++)
        clones[i].readable = true;
    }
    // When the source ends, close all clones that are fully read
    source.on('end', clonesEnd);
    function clonesEnd() {
      for (var i = 0; i < clones.length; i++) {
        if (clones[i]._readPosition === history.length)
          clones[i].close();
      }
      clones = null;
      source.removeListener('end',      clonesEnd);
      source.removeListener('error',    clonesEmitError);
      source.removeListener('readable', clonesMakeReadable);
    }
    // When the source errors, re-emit the error
    source.on('error', clonesEmitError);
    function clonesEmitError(error) {
      for (var i = 0; i < clones.length; i++)
        clones[i].emit('error', error);
    }
  }
}

/* Tries to read an item */
ClonedIterator.prototype.read = function () {
  var source = this._source, item = null;
  if (!this.done && source) {
    // Try to read an item at the current point in history
    var history = source._destination;
    if ((item = history.readAt(this._readPosition)) !== null)
      this._readPosition++;
    else
      this.readable = false;
    // Close the iterator if we are at the end of the source
    if (history.endsAt(this._readPosition))
      this.close();
  }
  return item;
};

/* End the iterator and cleans up. */
ClonedIterator.prototype._end = function (destroy) {
  // Unregister from a possible history reader
  var history = this._source && this._source._destination;
  if (history) history.unregister(this);

  // Don't call TransformIterator#_end,
  // as it would make the source inaccessible for other clones
  BufferedIterator.prototype._end.call(this, destroy);
};

// Disable buffer cleanup
ClonedIterator.prototype.close = AsyncIterator.prototype.close;

/**
  Creates a copy of the current iterator,
  containing all items emitted from this point onward.

  Further copies can be created; they will all start from this same point.
  After this operation, only read the returned copies instead of the original iterator.

  @returns {AsyncIterator} A new iterator that contains all future items of this iterator
**/
AsyncIterator.prototype.clone = function () {
  return new ClonedIterator(this);
};




// Determines whether the given object is a function
function isFunction(object) { return typeof object === 'function'; }

// Export all submodules
module.exports = AsyncIterator;
AsyncIterator.AsyncIterator = AsyncIterator;
AsyncIterator.EmptyIterator = AsyncIterator.empty = EmptyIterator;
AsyncIterator.SingletonIterator = AsyncIterator.single = SingletonIterator;
AsyncIterator.ArrayIterator = AsyncIterator.fromArray = ArrayIterator;
AsyncIterator.IntegerIterator = IntegerIterator;
AsyncIterator.BufferedIterator = BufferedIterator;
AsyncIterator.TransformIterator = TransformIterator;
AsyncIterator.SimpleTransformIterator = SimpleTransformIterator;
AsyncIterator.MultiTransformIterator = MultiTransformIterator;
AsyncIterator.ClonedIterator = ClonedIterator;
