module.exports.getIds = (data) => {
  data = data.data;
  const t = data.map(a => a.id);

  return {data: data.map(a => a.id)};
};
