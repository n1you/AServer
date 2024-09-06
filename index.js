const http = require('http');

const h = http.createServer((req, res) => {

    console.log(req);
    // console.log(res);
    console.log('node - http server');

    res.writeHead(200, { 'Content-Type': 'text/plain' });

    res.sendDate = ({ 123: 321 })
    res.end()

    res.on()

})


h.listen('8998', () => {
    console.log('server listen 8998 ==========>');

})