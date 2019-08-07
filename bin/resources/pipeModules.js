const PIPE_FUNCTION_NAME =
    `pipe`;
const PIPE_FUNCTION_DOC =
    `/**
 * Applies given pipe modules (functions) to the given data.
 *
 * @param fns, list of pipe functions
 * @returns {function(*=): (*)}
 */`;
const PIPE_FUNCTION =
    `${PIPE_FUNCTION_DOC}
const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);`;

const PIPE_MODULE =
    `const {0} = {1};\n`;

const PIPE_START =
    `        // Apply pipe modules to query result
        const pipeResult = PipeModules.${PIPE_FUNCTION_NAME}(\n`;
const PIPE_OBJECT =
    `            PipeModules.{0},\n`;
const PIPE_END =
    `        )({0});\n`;

module.exports = {
    PIPE_FUNCTION_NAME,
    PIPE_FUNCTION,
    PIPE_MODULE,
    PIPE_START,
    PIPE_OBJECT,
    PIPE_END,
};