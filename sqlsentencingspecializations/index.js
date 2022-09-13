function createSqlSentencingSpecializations (execlib) {
  'use strict';

  var lib = execlib.lib;

  function indexColumnsQueryForTable (tablename) {
    return [
      "select i.indisprimary, i.indcolordinal, ic.relname as indexname, a.attname as colname from (",
      "select",
        "generate_series(1, array_length(indkey, 1)) as indcolordinal,",
        "unnest(indkey) as colordinal,",
        "indexrelid,",
        "indrelid,",
        "indisprimary",
      "from pg_index",
        "where indrelid in (select oid from pg_class where relname = '"+tablename+"')",
      ")i",
      "join pg_class ic on i.indexrelid = ic.oid",
      "join pg_attribute a on a.attrelid = i.indrelid and a.attnum = i.colordinal",
      "order by indexname, indcolordinal"
    ].join(' ')
  }

  function readFieldType(flddesc) {
    return flddesc.postgresqltype || flddesc.sqltype || flddesc.type
  }

  function createTableCreator (fieldmapper) {
    return function createTable(tabledesc) {
      var ret;
      if (!tabledesc) {
        throw new lib.Error('NO_TABLECREATION_DESCRIPTOR', 'Cannot create a CREATE TABLE sentence without a descriptor');
      }
      if (!lib.isString(tabledesc.name)) {
        throw new lib.Error('NAME_NOT_A_STRING', 'Name of the table to create must be a String');
      }
      if (!lib.isArray(tabledesc.fields)) {
        throw new lib.Error('FIELDS_NOT_AN_ARRAY', 'The fields of the table to create must be an array');
      }
      ret = [
        "CREATE"+(tabledesc.temp ? ' TEMP ' : ' ')+"TABLE IF NOT EXISTS "+tabledesc.name+" (",
        tabledesc.fields.map(fieldmapper).join(','),
        ")"
      ].join(' ');
      return ret;
    };
  }

  return {
    indexColumnsQueryForTable: indexColumnsQueryForTable,
    readFieldType: readFieldType,
    createTableCreator: createTableCreator
  };
}
module.exports = createSqlSentencingSpecializations;