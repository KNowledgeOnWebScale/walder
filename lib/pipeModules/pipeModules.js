module.exports = {
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