module.exports.filterT = (data) => {
  const filteredData = [];
  for (const quad of data) {
    if (quad.subject.id.match(/T/)) {
      filteredData.push(quad);
    }
  }
  return filteredData;
};
