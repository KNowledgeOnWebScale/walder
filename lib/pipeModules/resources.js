const PIPE_FUNCTION_NAME = 'pipe';
const PIPE_FUNCTION =
`/**
 * Applies given pipe modules (functions) to the given data.
 *
 * @param fns, list of pipe functions
 * @returns {function(*=): (*)}
 */
const ${PIPE_FUNCTION_NAME} = (fns) => (x) => fns.reduce((v, f) => f(v), x);
`;

const EXPORT_START =
`module.exports = {
    ${PIPE_FUNCTION_NAME},`;
const EXPORT_OBJECT = '\n    {0},';
const EXPORT_END = '\n};';

module.exports = {
    PIPE_FUNCTION,
    EXPORT_START,
    EXPORT_OBJECT,
    EXPORT_END
};

