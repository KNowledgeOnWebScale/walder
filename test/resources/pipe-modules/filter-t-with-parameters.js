module.exports.filterT_withParameters = (data, extraLetters) => {
    let filteredData = [];
    for (const o of data) {
        if (o.id.value.match(/T/)) {
            if (extraLetters) {
                if (o.id.value.match(/A/)){
                    filteredData.push(o);
                }
            } else {
                filteredData.push(o);
            }
        }
    }
    return filteredData;
};
