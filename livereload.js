livereload = require('livereload');
server = livereload.createServer();

const PATH_TO_APP = 'src';
server.watch([PATH_TO_APP]);
