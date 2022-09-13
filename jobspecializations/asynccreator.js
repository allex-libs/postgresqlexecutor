function createAsyncJobSpecialization (execlib, AsyncJobBase) {
  'use strict';

  var lib = execlib.lib,
    q = lib.q,
    qlib = lib.qlib;

  /*
   * AsyncJob
   * Uses the request Object in a certain way, according to the ancestor class' useTheRequest method,
   * but always finishes when the request emits 'done'
   * If the request during its lifetime produced error(s), concat of all errors occured will be the rejection Error's message
   * If the request did not produce errors, AsyncJob will resolve with affectedRows
   * During request's lifetime, 2 notification types will occur:
   * 1. notify({request: request, columns: columns}) - this notification occurs at the beggining of execution,
   *   telling that the request has these columns in a certain recordset (multiple recordsets seem to be ambiguous)
   * 2. notify({request: request, row: row}) - this notification occurs for each row in a particular redordset (yes, multiple ambiguous)
   */

  function AsyncJob (executor, cbs, defer) {
    AsyncJobBase.call(this, executor, cbs, defer);
    this.cursor = null;
    this.rowCount = 0;
  }
  lib.inherit(AsyncJob, AsyncJobBase);
  AsyncJob.prototype.destroy = function () {
    this.rowCount = 0;
    disposeOfCursor.call(this);
    AsyncJobBase.prototype.destroy.call(this);
  };
  AsyncJob.prototype.goForSure = function () {
    try {
      this.cursor = this.useTheRequest();
      this.readOne();
    }
    catch (e) {
      this.reject(e);
    }
  };
  AsyncJob.prototype.readOne = function () {
    if (!this.okToProceed()) {
      return;
    }
    if (!this.cursor) {
      this.resolve(null);
      return;
    }
    this.cursor.read(1, this.onReadOne.bind(this));
  };
  AsyncJob.prototype.onReadOne = function (err, rows) {
    var recret;
    if (!this.okToProceed()) {
      return;
    }
    if (err) {
      this.reject(err);
      return;
    }
    if (!lib.isArray(rows)) {
      this.resolve(null);
      return;
    }
    if (rows.length>1) {
      this.reject(new lib.Error('INTERNAL_CURSOR_HANDLING_ERROR', 'Expected 1 row in Cursor.read, but got '+rows.length));
      return;
    }
    if (rows.length<1) {
      this.resolve(this.rowCount);
      return;
    }
    try {
      this.rowCount++;
      recret = this.cbs.record(rows[0]);
      if (lib.defined(recret)) {
        this.resolve(recret);
        return;
      }
      this.readOne();
    }
    catch (e) {
      this.reject(e);
    }
  }
  AsyncJob.prototype.onColumns = function (columns) {
    if (!this.okToProceed()) {
      return;
    }
    try {
      this.cbs.columns(columns);
    }
    catch (e) {
      this.reject(e);
    }
  };


  AsyncJob.prototype.useTheRequest = function (request) {
    throw new lib.Error('NOT_IMPLEMENTED', this.constructor.name+' has to implement useTheRequest');
  };

  //static, this is AsyncJob
  function disposeOfCursor () {
    if (!this.cursor) {
      return;
    }
    return this.cursor.close();
  }

  return AsyncJob;
}
module.exports = createAsyncJobSpecialization;