/**
 * Applies given pipe modules (functions) to the given data.
 *
 * @param fns, list of pipe functions
 * @returns {function(*=): (*)}
 */
const pipe = (fns) => (x) => fns.reduce((v, f) => f(v), x);

module.exports = {
    pipe,
    filterA,
    filterB,
};
function filterB(data) {
    let filteredData = { data: [] };
    for (const o of data.data) {
        if (o.id.match(/B/)) {
            filteredData.data.push(o);
        }
    }
    return filteredData;
}
function filterA(data) {
    let filteredData = { data: [] };
    for (const o of data.data) {
        if (o.id.match(/A/)) {
            filteredData.data.push(o);
        }
    }
    return filteredData;
}