module.exports.filterT = (data) => {
  let filteredData = [];
  for (const o of data) {
    if (o.id.match(/T/)) {
      filteredData.push(o);
    }
  }
  return filteredData;
};
