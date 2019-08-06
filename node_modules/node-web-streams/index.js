'use strict';
const nodeStream = require('stream');
const isNodeStream = require('is-stream');
const conversions = require('./lib/conversions');

module.exports = require('web-streams-polyfill');

/**
 * Convert Web streams to Node streams. Until WritableStream / TransformStream
 * is finalized, only ReadableStream is supported.
 *
 * @param {ReadableStream} stream, a web stream.
 * @return {stream.Readable}, a Node Readable stream.
 */
module.exports.toNodeReadable = function(stream) {
    if (stream instanceof module.exports.ReadableStream
        || stream && typeof stream.getReader === 'function') {
        return conversions.readable.webToNode(stream);
    } else {
        throw new TypeError("Expected a ReadableStream.");
    }
};

/**
 * Convert Node Readable streams, an Array, Buffer or String to a Web
 * ReadableStream.
 *
 * @param {Readable|Array|Buffer|String} stream, a Node Readable stream,
 * Array, Buffer or String.
 * @return {ReadableStream}, a web ReadableStream.
 */
module.exports.toWebReadableStream = function(stream) {
    if (isNodeStream(stream) && stream.readable) {
        return conversions.readable.nodeToWeb(stream);
    } else if (Array.isArray(stream)) {
        return conversions.readable.arrayToWeb(stream);
    } else if (Buffer.isBuffer(stream) || typeof stream === 'string') {
        return conversions.readable.arrayToWeb([stream]);
    } else {
        throw new TypeError("Expected a Node streams.Readable, an Array, Buffer or String.");
    }
};
