module.exports = function(stream) {
  return new Promise(function(resolve, reject) {
    var array = [];
    stream.on('data', function(data) {
      array.push(data);
    });
    stream.on('error', reject);
    stream.on('end', function() {
      resolve(array);
    });
  });
};
