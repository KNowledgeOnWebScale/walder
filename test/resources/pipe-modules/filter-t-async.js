module.exports.filterT = (data) => {
  return new Promise(resolve => {
    let filteredData = [];

    for (const o of data) {
      if (o.id.match(/T/)) {
        filteredData.push(o);
      }
    }

    resolve(filteredData);
  });
};
