var Cursor = require('pg-cursor');
function createAsyncQueryJobSpecialization (execlib, Base) {
  'use strict';

  var lib = execlib.lib;

  function AsyncQueryJob (executor, query, cbs, defer) {
    Base.call(this, executor, query, cbs, defer);
    this.query = query;
  }
  lib.inherit(AsyncQueryJob, Base);
  AsyncQueryJob.prototype.useTheRequest = function () {
    return this.destroyable.resource.query(new Cursor(this.query));
  };

  return AsyncQueryJob;
}
module.exports = createAsyncQueryJobSpecialization;