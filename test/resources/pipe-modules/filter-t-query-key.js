module.exports.filterT = (data, queryKey) => {
  if (queryKey === 'movies') {
    let filteredData = [];

    for (const o of data) {
      if (o.id.match(/T/)) {
        filteredData.push(o);
      }
    }

    return filteredData;
  } else {
    throw new Error('Only movies are supported this by this pipe module.');
  }
};
