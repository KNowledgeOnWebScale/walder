/**
 * Applies given pipe modules (functions) to the given data.
 *
 * @param fns, list of pipe functions
 * @returns {function(*=): (*)}
 */
const pipe = (fns) => (x) => fns.reduce((v, f) => f(v), x);

/**
 * Throw an error without stack trace.
 * @param msg
 */
const throwError = (msg) => {
  console.error('\n' + msg + '\n');
  process.exit(1);
};

module.exports = {
  pipe,
  throwError
};
