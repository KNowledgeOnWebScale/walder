module.exports.getIds = (data) => {
  return data.map(a => a.subject.id);
};
