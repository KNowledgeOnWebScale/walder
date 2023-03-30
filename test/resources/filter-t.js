module.exports.filterT = (data) => {
  let filteredData = [];
  for (const o of data) {
    if (o.id.value.match(/T/)) {
      filteredData.push(o);
    }
  }
  return filteredData;
};

module.exports.filterTSparql = (data) => {
  const filteredData = [];
  for (const quad of data) {
    if (quad.subject.value.match(/T/)) {
      filteredData.push(quad);
    }
  }
  return filteredData;
};
