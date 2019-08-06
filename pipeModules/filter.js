function filter(data, regex) {
    let filteredData = [];
    for (const o in data.data) {
        if (o.id.match(regex)) {
            filteredData.push(o);
        }
    }
    return filteredData;
}