
let AsyncIterator = require('asynciterator');

// merges the contents of multiple streams
class MergeIterator extends AsyncIterator
{
    constructor (streams)
    {
        super();
        
        if (!Array.isArray(streams))
            streams = Array.prototype.slice.call(arguments);
        
        this.streams = streams;
        
        for (let stream of streams)
        {
            stream.on('readable', () => this.emit('readable'));
            stream.on('end', () => this._removeStream(stream));
        }
        
        if (this.streams.length === 0)
            this.close();
        
        this.idx = this.streams.length-1;
    }
    
    _removeStream (stream)
    {
        let idx = this.streams.indexOf(stream);
        if (idx < 0)
            return;
        
        this.streams.splice(idx, 1);
        if (this.idx >= this.streams.length)
            --this.idx;
        
        if (this.streams.length === 0)
            this._end();
    }
    
    close ()
    {
        super.close();
        for (let stream of this.streams)
            stream.close();
    }
    
    read ()
    {
        for (let attempts = 0; attempts < this.streams.length; ++attempts)
        {
            this.idx = (this.idx + 1) % this.streams.length;
            let item = this.streams[this.idx].read();
            if (item !== null)
                return item;
        }
        
        return null;
    }
}

module.exports = MergeIterator;