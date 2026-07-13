const express = require('express');
const fs = require('fs');
const app = express();

app.use((req, res, next) => {
// write your logging code here
    const logEntry = [
        req.headers['user-agent'],
        new Date().toISOString(),
        req.method,
        req.url,
        `HTTP/${req.httpVersion}`,
        res.statusCode
    ].join(',');

    console.log(logEntry);

    fs.appendFile('log.csv', logEntry + '\n', (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        }
    });

    next();

});

app.get('/', (req, res) => {
// write your code to respond "ok" here
    res.send('ok');

});

app.get('/logs', (req, res) => {
// write your code to return a json object containing the log data here
    fs.readFile('log.csv', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading log file:', err);
            return res.json([]);
        }

        const lines = data.trim().split(/\r?\n/).filter(line => line.trim());
        const headers = lines[0].split(',');
        const logs = lines.map((line) => {
            const values = line.split(',');
            return headers.reduce((entry, header, i) => {
                entry[header] = values[i];
                return entry;
            }, {});
        });

        res.json(logs);
    });

});

module.exports = app;
