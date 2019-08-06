
let AsyncIterator = require('asynciterator');

// https://en.wikipedia.org/wiki/Hash_join
class HashJoin extends AsyncIterator
{
    constructor (left, right, funHash, funJoin)
    {
        super(right);
        
        this.left = left;
        this.right = right;
        this.funHash = funHash;
        this.funJoin = funJoin;
        
        this.leftMap = new Map();
    
        this.match    = null;
        this.matches  = [];
        this.matchIdx = 0;
        
        
        this.readable = false;
        
        this.left.on('end', allowJoining.bind(this));
        this.left.on('data', addItem.bind(this));
        
        function addItem (item)
        {
            let hash = this.funHash(item);
            if (!this.leftMap.has(hash))
                this.leftMap.set(hash, []);
            let arr = this.leftMap.get(hash);
            arr.push(item);
        }
        function allowJoining ()
        {
            if (this.leftMap.size <= 0)
                return this.close();
            this.readable = true;
            this.right.on('readable', () => this.readable = true);
            this.right.on('end', () => { if (!this.hasResults()) this._end(); });
        }
    }
    
    hasResults ()
    {
        return !this.right.ended || this.matchIdx < this.matches.length;
    }
    
    close ()
    {
        super.close();
        this.left.close();
        this.right.close();
    }
    
    read ()
    {
        if (this.ended || !this.readable)
            return null;
    
        while (this.matchIdx < this.matches.length)
        {
            let item = this.matches[this.matchIdx++];
            let result = this.funJoin(item, this.match);
            if (result !== null)
                return result;
        }
    
        if (!this.hasResults())
            this._end();
    
        this.match = this.right.read();
    
        if (this.match === null)
        {
            this.readable = false;
            return null;
        }
    
        let hash = this.funHash(this.match);
        this.matches = this.leftMap.get(hash) || [];
        this.matchIdx = 0;
    
        // array is filled again so recursive call can have results
        return this.read();
    }
}

module.exports = HashJoin;