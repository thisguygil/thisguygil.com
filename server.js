const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const hostname = '127.0.0.1';
const port = 3000;
const secretKey = process.env.RECAPTCHA_SECRET_KEY;

const server = http.createServer((req, res) => {
    console.log(`Request for ${req.url}`);
    if (req.method === 'POST' && req.url === '/submit') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const params = new URLSearchParams(body);

            const recaptchaResponse = params.get('g-recaptcha-response');
            if (!recaptchaResponse) {
                res.json({ success: false });
            }

            verifyRecaptcha(recaptchaResponse, req, res);
        });
        return;
    } else if (req.method === 'POST' && req.url.startsWith("https://formspree.io/f/mqkryedn")) {
        return; // Allow the request to continue
    }

    let filePath = __dirname + req.url;

    // Set default to index.html for the root URL
    if (req.url === '/') {
        filePath = __dirname + '/index.html';
    }

    // Determine the content type based on the file extension
    const extname = path.extname(filePath).toLowerCase();
    let contentType = 'text/html'; // default

    switch (extname) {
        case '.css':
            contentType = 'text/css';
            break;
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
        case '.ico':
            contentType = 'image/x-icon';
            break;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('404 Not Found');
        } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', contentType);
            res.end(data, 'utf-8');
        }
    });
});

function verifyRecaptcha(recaptchaResponse, req, res) {
    const params = new URLSearchParams({
        secret: secretKey,
        response: recaptchaResponse,
        remoteip: req.ip
    });

    fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        body: params
    })
    .then(response => response.json())
    .then(data => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: data.success }));
    })
    .catch(error => {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false }));
        console.error(error);
    });
}

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});