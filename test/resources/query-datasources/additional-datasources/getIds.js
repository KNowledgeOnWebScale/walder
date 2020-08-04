module.exports.getIds = (data) => {
  data = data.data;

  return {data: data.map(a => a.id)};
};
