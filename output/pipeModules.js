pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);

const filter = function filter(data, regex) {
    let filteredData = [];
    for (const o in data.data) {
        if (o.id.match(regex)) {
            filteredData.push(o);
        }
    }
    return filteredData;
 };

module.exports = {
    pipe,
    filter,
};
