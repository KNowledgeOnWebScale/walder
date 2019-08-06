
let AsyncIterator = require('asynciterator');
let MultiTransformIterator = AsyncIterator.MultiTransformIterator;
let SimpleTransformIterator = AsyncIterator.SimpleTransformIterator;

// https://en.wikipedia.org/wiki/Nested_loop_join
class NestedLoopJoin extends MultiTransformIterator
{
    constructor (left, right, funJoin)
    {
        super(left);
        
        this.right = right;
        this.funJoin = funJoin; // function that joins 2 elements or returns null if join is not possible
        this.on('end', () => this.right.close());
    }
    
    close ()
    {
        super.close();
        this.right.close();
    }
    
    _createTransformer (leftItem)
    {
        return new SimpleTransformIterator(this.right.clone(), { transform: (rightItem, done) =>
        {
            let result = this.funJoin(leftItem, rightItem);
            if (result !== null)
                this._push(result);
            done();
        }});
    }
}

module.exports = NestedLoopJoin;