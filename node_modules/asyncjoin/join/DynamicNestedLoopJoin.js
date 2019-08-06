
let AsyncIterator = require('asynciterator');
let MultiTransformIterator = AsyncIterator.MultiTransformIterator;
let SimpleTransformIterator = AsyncIterator.SimpleTransformIterator;

// Nested Loop Join, but the values of the inner loop are determined by each value of the outer loop, possibly reducing the number of necessary checks
class DynamicNestedLoopJoin extends MultiTransformIterator
{
    constructor (left, funRight, funJoin)
    {
        super(left);
        
        this.funRight = funRight;
        this.funJoin = funJoin;
    }
    
    _createTransformer (leftItem)
    {
        return new SimpleTransformIterator(this.funRight(leftItem), { transform: (rightItem, done) =>
        {
            let result = this.funJoin(leftItem, rightItem);
            if (result !== null)
                this._push(result);
            done();
        }});
    }
}

module.exports = DynamicNestedLoopJoin;