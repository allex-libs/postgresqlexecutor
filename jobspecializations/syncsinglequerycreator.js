function createSyncSingleQuerySpecialization (execlib, Base){
  'use strict';

  var lib = execlib.lib;

  function SyncSingleQueryJob (executor, query, defer) {
    Base.call(this, executor, query, defer);
  }
  lib.inherit(SyncSingleQueryJob, Base);
  SyncSingleQueryJob.prototype.onResult = function (res) {
    this.resolve(res.rows);
  };

  return SyncSingleQueryJob;
}
module.exports = createSyncSingleQuerySpecialization;