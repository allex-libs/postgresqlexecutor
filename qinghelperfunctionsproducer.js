function createQueueingHelperFunctions (lib) {
  'use strict';

  function columnsproducer (res, col, index) {
    res[col.name] = {
      name: col.name,
      index: index
    };
    return res;
  }

  function singleRecordsetProducer (finalres, res) {
    var rs;
    if (!(res && lib.isNonEmptyString(res.command))) {
      return finalres;
    }
    rs = res.rows;
    rs.columns = res.fields.reduce(columnsproducer, {});
    finalres.push(rs);

    return finalres;
  }
  
  function recordsetFormatProducer (res) {
    var ret;
    if (lib.isArray(res)) {
      return {
        recordsets: res.reduce(singleRecordsetProducer, [])
      };
    }
    ret = [];
    singleRecordsetProducer(ret, res);
    return {recordsets: ret};
  }

  return {
    recordsetFormatProducer: recordsetFormatProducer
  };
}
module.exports = createQueueingHelperFunctions;