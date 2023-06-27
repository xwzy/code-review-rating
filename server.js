const http = require('http');
const fs = require('fs');
const path = require('path');

let ratings = [];


const server = http.createServer((req, res) => {
    const url = req.url;

    if (url === '/') {
        const filePath = path.join(__dirname, 'index.html');
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.end('Internal Server Error');
            } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html');
                res.end(data);
            }
        });
    } else if (req.method === 'POST' && req.url === '/save-rating') {
        res.setHeader('Content-Type', 'application/json');
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });
        req.on('end', () => {
            const rating = JSON.parse(body);
            ratings.push(rating);
            res.statusCode = 200;
            res.end(JSON.stringify({ message: 'Rating saved successfully' }));
        });
    }
    else if (req.method === 'GET' && req.url === '/get-ratings') {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(JSON.stringify(ratings));
    } else {
        res.statusCode = 404;
        res.end('404 Not Found');
    }
});

const hostname = '0.0.0.0';
const port = 9001;

server.listen(port, hostname, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
