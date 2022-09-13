function createTxnWrappedSpecialization (outerlib, execlib, Base) {
  'use strict';

  var lib = execlib.lib;

  function TxnWrappedJobCore (executor, jobproducerfunc) {
    Base.call(this, executor, jobproducerfunc);
  }
  lib.inherit(TxnWrappedJobCore, Base);

  TxnWrappedJobCore.prototype.shouldContinue = function () {
    var ret = Base.prototype.shouldContinue.call(this);
    if (ret) {
      return ret;
    }
    if (this.pool) {
      if (!this.pool.healthy) {
        return new lib.Error('ACQUIRED_POOL_IS_NOT_HEALTHY');
      }
      if (!this.pool.connected) {
        return new lib.Error('ACQUIRED_POOL_IS_NOT_CONNECTED');
      }
    }
    if (this.txn) {
      if (!this.txn.connected) {
        return new lib.Error('INTERNAL_TRANSACTION_IS_NOT_CONNECTED');
      }
    }
    if (this.txnExecutor) {
      if (!this.txnExecutor.txn) {
        return new lib.Error('INTERNAL_TRANSACTIONED_EXECUTOR_DESTROYED');
      }
    }
  };
  TxnWrappedJobCore.prototype.onConnected = function (pool) {
  };
  TxnWrappedJobCore.prototype.beginTransaction = function () {
    return (new outerlib.jobs.SyncSingleQuery(
      this.executor,
      'BEGIN'
    )).go();
  };
  TxnWrappedJobCore.prototype.createWrapped = function () {
    return this.jobProducerFunc(this.executor);
  };
  TxnWrappedJobCore.prototype.finalizeTxn = function () {
    this.txnUnderWay = false;
    if (!this.result.fail) {
      return (new outerlib.jobs.SyncSingleQuery(
        this.executor,
        'COMMIT'
      )).go();
    }
    return (new outerlib.jobs.SyncSingleQuery(
      this.executor,
      'ROLLBACK'
    )).go();
  };

  return TxnWrappedJobCore;
}
module.exports = createTxnWrappedSpecialization;