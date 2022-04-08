module.exports.filterT_withParameters = (data, extraLetters) => {
    let filteredData = [];
    for (const o of data) {
        if (o.id.match(/T/)) {
            if (extraLetters) {
                if (o.id.match(/A/)){
                    filteredData.push(o);
                }
            } else {
                filteredData.push(o);
            }
        }
    }
    return filteredData;
};
