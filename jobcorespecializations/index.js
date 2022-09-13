function createJobCoreSpecializations (execlib, outerlib) {
  var helpers = outerlib.helpers;
  var ret = {
    txnwrapped: require('./txnwrappedcreator').bind(null, outerlib)
  };
  outerlib = null;
  helpers = null;
  return ret;
}
module.exports = createJobCoreSpecializations;