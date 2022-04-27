module.exports.filterT = (data) => {
  return new Promise(resolve => {
    let filteredData = [];

    for (const o of data) {
      if (o.id.value.match(/T/)) {
        filteredData.push(o);
      }
    }

    resolve(filteredData);
  });
};
