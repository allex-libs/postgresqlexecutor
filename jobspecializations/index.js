function createJobSpecializations () {

  
  function rowsAffected (sqlresult) {
    return (sqlresult && lib.isNumber(sqlresult.rowCount))
    ?
    sqlresult.rowCount
    :
    0;
  }

  function readeranalyzer (readresult) {
    return readresult && lib.isArray(readresult.rows) && readresult.rows.length>0;
  }

  function wereRecordsRead (sqlresult) {
    if (!lib.isArray(sqlresult)){
      throw new lib.Error('NO_RECORDSETS', 'No recordsets were found in SQL result');
    }
    return sqlresult.map(readeranalyzer);
  }

  function execresultanalyzer (recordsread, res, result, index) {
    var read;
    if (result && result.rowCount>0) {
      read = recordsread[index];
      res[read ? 'updated' : 'inserted'] ++;
    }
    return res;
  };

  function updatedInserted (sqlresult, recordsread) {
    var ret;
    ret = (lib.isArray(sqlresult) &&
      sqlresult.length>0)
      ?
      sqlresult.reduce(execresultanalyzer.bind(null, recordsread), {updated: 0, inserted:0})
      :
      {updated: 0, inserted: 0}
    recordsread = null;
    return ret;
  }

  var mylib = {
    async: require('./asynccreator'),
    asyncquery: require('./asyncquerycreator'),
    indexlister: require('./indexlistercreator'),
    syncsinglequery: require('./syncsinglequerycreator'),
    rowsAffected: rowsAffected,
    wereRecordsRead: wereRecordsRead,
    updatedInserted: updatedInserted
  };

  return mylib;
}
module.exports = createJobSpecializations;