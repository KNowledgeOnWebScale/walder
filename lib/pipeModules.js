/**
 * Applies given pipe modules (functions) to the given data.
 *
 * @param fns, list of pipe functions
 * @returns {function(*=): (*)}
 */
const pipe = (fns) => (x) => fns.reduce((v, f) => f(v), x);

module.exports = {
    pipe,
};
