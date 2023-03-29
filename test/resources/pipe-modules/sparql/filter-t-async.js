module.exports.filterT = (data) => {
  return new Promise(resolve => {
    let filteredData = [];

    for (const o of data) {
      if (o.subject.id.match(/T/)) {
        filteredData.push(o);
      }
    }

    resolve(filteredData);
  });
};
