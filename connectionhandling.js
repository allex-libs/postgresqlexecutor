function createConnectionHandling(execlib, pg, mylib, PostgreSQLExecutor) {
  'use strict';

  var lib = execlib.lib,
    q = lib.q,
    ConnectionPool = pg.ConnectionPool;

  PostgreSQLExecutor.prototype.connect = function () {
    return this.getHoldOfResource();
  };
  PostgreSQLExecutor.prototype.acquireResource = function (desc) {
    var client = new pg.Client(desc.connection);
    var ret = client.connect().then(onConnectionSucceeded.bind(null, client), onConnectionFailed.bind(null, desc));
    client = null;
    desc = null;
    return ret;
  };
  PostgreSQLExecutor.prototype.isResourceUsable = function (connection) {
    return mylib.helpers.isConnectionUsable(connection);
  };

  PostgreSQLExecutor.prototype.destroyResource = function (res) {
    return res.end();
  };

  function onConnectionSucceeded (client) {
    return client;
  }
  function onConnectionFailed (/*defer, */desc, reason) {
    console.log('Could not connect to PostgreSQL', desc.connection);
    console.log(reason);
    console.log('Will try again');
  };
}

module.exports = createConnectionHandling;
