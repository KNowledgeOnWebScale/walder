'use strict';

const Readable = require('stream').Readable;
const ReadableStream = require('web-streams-polyfill').ReadableStream;

/**
 * Web / node stream conversion functions
 */

function readableNodeToWeb(nodeStream) {
    return new ReadableStream({
        start(controller) {
            nodeStream.pause();
            nodeStream.on('data', chunk => {
                controller.enqueue(chunk);
                nodeStream.pause();
            });
            nodeStream.on('end', () => controller.close());
            nodeStream.on('error', (e) => controller.error(e));
        },
        pull(controller) {
            nodeStream.resume();
        },
        cancel(reason) {
            nodeStream.pause();
        }
    });
}

/**
 * ReadableStream wrapping an array.
 *
 * @param {Array} arr, the array to wrap into a stream.
 * @return {ReadableStream}
 */
function arrayToWeb(arr) {
    return new ReadableStream({
        start(controller) {
            for (var i = 0; i < arr.length; i++) {
                controller.enqueue(arr[i]);
            }
            controller.close();
        }
    });
}


class NodeReadable extends Readable {
    constructor(webStream, options) {
        super(options);
        this._webStream = webStream;
        this._reader = webStream.getReader();
        this._reading = false;
    }

    _read(size) {
        if (this._reading) {
            return;
        }
        this._reading = true;
        const doRead = () => {
            this._reader.read()
                .then(res => {
                    if (res.done) {
                        this.push(null);
                        return;
                    }
                    if (this.push(res.value)) {
                        return doRead(size);
                    } else {
                        this._reading = false;
                    }
                });
        };
        doRead();
    }
}

function readableWebToNode(webStream) {
    return new NodeReadable(webStream);
}

module.exports = {
    readable: {
        nodeToWeb: readableNodeToWeb,
        arrayToWeb: arrayToWeb,
        webToNode: readableWebToNode,
    },
};

// Simple round-trip test.
// let nodeReader = require('fs').createReadStream('/tmp/test.txt');
// let webReader = readableNodeToWeb(nodeReader);
// let roundTrippedReader = readableWebToNode(webReader);
// roundTrippedReader.pipe(process.stdout);
