function filterT(data) {
  let filteredData = {data: []};
  for (const o of data.data) {
    console.log(o);
    if (o.id.match(/T/)) {
      filteredData.data.push(o);
    }
  }
  return filteredData;
}