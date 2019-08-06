const Readable = require('stream').Readable;
const util     = require('util');

function Streamify(str, options) {

  if (! (this instanceof Streamify)) {
    return new Streamify(str, options);
  }

  Readable.call(this, options);
  this.str = str;
}

util.inherits(Streamify, Readable);

Streamify.prototype._read = function (size) {

  var chunk = this.str.slice(0, size);

  if (chunk) {
    this.str = this.str.slice(size);
    this.push(chunk);
  }

  else {
    this.push(null);
  }

};

module.exports = Streamify;
