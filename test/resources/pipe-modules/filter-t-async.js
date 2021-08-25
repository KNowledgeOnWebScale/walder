module.exports.filterT = (data) => {
  return new Promise(resolve => {
    let filteredData = {data: []};

    for (const o of data.data) {
      if (o.id.match(/T/)) {
        filteredData.data.push(o);
      }
    }

    resolve(filteredData);
  });
};
