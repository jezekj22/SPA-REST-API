const http = require('http');
const backend = require('./backend');

http.createServer(backend).listen(8080, () => {
    console.log('Server runs on: http://localhost:8080');
});
