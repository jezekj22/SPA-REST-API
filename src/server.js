const http = require('http');
const backend = require('./backend');


http.createServer(backend).listen(3000, () => {
    console.log('Server runs on: http://localhost:3000');
});

