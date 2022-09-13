function createPostgreSQLJobs (execlib, outerlib) {
  'use strict';

  var lib = execlib.lib;

  require ('./syncexeccreator')(lib, outerlib.jobs);

}
module.exports = createPostgreSQLJobs;
