const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

let ratings = [];
const generateToken = () => {
    const length = 8;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        token += characters.charAt(randomIndex);
    }
    console.log('Token: ', token);
    return token;
};

const token = generateToken();


function getAllLocalIPs() {
    const interfaces = os.networkInterfaces();
    const ipList = [];

    for (const interfaceName in interfaces) {
        const interface = interfaces[interfaceName];
        for (const iface of interface) {
            if (iface.family === 'IPv4' && !iface.internal) {
                ipList.push(iface.address);
            }
        }
    }

    return ipList;
}


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
        const ip = req.connection.remoteAddress;
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });
        req.on('end', () => {
            const rating = JSON.parse(body);
            rating.username = rating.username + "-" + ip;
            ratings.push(rating);
            res.statusCode = 200;
            res.end(JSON.stringify({ message: 'Rating saved successfully' }));
        });
    }
    else if (req.method === 'GET' && req.url === '/get-ratings') {
        const requestToken = req.headers['x-token'];

        if (requestToken === token) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify(ratings));
        } else {
            res.statusCode = 403;
            res.end('Invalid token');
        }
    } else {
        res.statusCode = 404;
        res.end('404 Not Found');
    }
});

const hostname = '0.0.0.0';
const port = 9001;

server.listen(port, hostname, () => {
    const localIPs = getAllLocalIPs();
    for (const ip of localIPs) {
        console.log(`Server running at http://${ip}:${port}/`);
    }
});


