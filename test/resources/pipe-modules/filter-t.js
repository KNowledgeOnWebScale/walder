module.exports.filterT = (data) => {
  let filteredData = {data: []};
  for (const o of data.data) {
    if (o.id.match(/T/)) {
      filteredData.data.push(o);
    }
  }
  return filteredData;
};
