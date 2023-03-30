module.exports.combine = (data) => {
  if (data.movies1 && data.movies2) {
    data.movies3 = [{id: 'http://example.com/my-movie'}]

    return data;
  } else {
    throw new Error('Not all query results are provided to this pipe module.');
  }
};
