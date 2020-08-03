module.exports.filterT_withParameters = (data, extraLetters) => {
    let filteredData = {data: []};
    for (const o of data.data) {
        if (o.id.match(/T/)) {
            if (extraLetters) {
                if (o.id.match(/A/)){
                    filteredData.data.push(o);
                }
            } else {
                filteredData.data.push(o);
            }
        }
    }
    return filteredData;
};
