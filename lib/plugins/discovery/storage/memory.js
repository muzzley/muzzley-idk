var discoveries = {};

function get (context, callback) {
  if (typeof callback !== 'function') { callback = function () {}; }
  if (!context) {
    return callback(new Error('No context provided'));
  }
  return callback(null, discoveries[context]);
}

function set (discovery, callback) {
  if (typeof callback !== 'function') { callback = function () {}; }
  if (!discovery || !discovery.context) {
    return callback(new Error('No discovery object provided or no context defined'));
  }
  discoveries[discovery.context] = discovery;
  return callback();
}

exports = module.exports = {
  get: get,
  set: set
};
