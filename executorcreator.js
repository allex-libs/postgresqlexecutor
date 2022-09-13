var pg = require('pg');

function createExecutor (execlib, SQLExecutor, mylib) {
  'use strict';

  var lib = execlib.lib;

  function PostgreSQLExecutor (options) {
    SQLExecutor.call(this, options);
  }
  lib.inherit(PostgreSQLExecutor, SQLExecutor);
  PostgreSQLExecutor.prototype.destroy = function () {
    SQLExecutor.prototype.destroy.call(this);
  };
  PostgreSQLExecutor.prototype.activateConnection = function (connection) {
    return connection;
  };

  require('./connectionhandling')(execlib, pg, mylib, PostgreSQLExecutor);

  mylib.Executor = PostgreSQLExecutor;
}
module.exports = createExecutor;
