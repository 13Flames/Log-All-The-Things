const express = require('express');
const fs = require('fs');
const app = express();

const LOG_FILE = 'log.csv';
const LOG_HEADER = 'Agent,Time,Method,Resource,Version,Status';

// log.csv is gitignored, so a fresh deploy starts without it - create it with
// a header row so /logs always has column names to read
if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, LOG_HEADER + '\n');
}

app.use((req, res, next) => {
// write your logging code here
    const logEntry = [
        // browser user agents contain commas, which would break the CSV columns
        (req.headers['user-agent'] || '').replace(/,/g, ';'),
        new Date().toISOString(),
        req.method,
        req.url,
        `HTTP/${req.httpVersion}`,
        res.statusCode
    ].join(',');

    console.log(logEntry);

    fs.appendFile(LOG_FILE, logEntry + '\n', (err) => {
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
    fs.readFile(LOG_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading log file:', err);
            return res.json([]);
        }

        const lines = data.trim().split(/\r?\n/).filter(line => line.trim());
        const headers = lines[0].split(',');
        const logs = lines.slice(1).map((line) => {
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
