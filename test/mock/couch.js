var couchbase = require('couchbase');

var uniqueIdCounter = 0;

function generateUniqueId(prefix) {

  return prefix + (uniqueIdCounter++);

}

module.exports.bucket = new couchbase.Mock.Connection({});

module.exports.uniqueId = generateUniqueId;

module.exports.cbErrors = couchbase.errors;