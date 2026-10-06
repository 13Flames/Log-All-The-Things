# Log All The Things

Custom Express middleware that logs every incoming request to a CSV file, plus
an endpoint that reads the log back and returns it as JSON.

**Deployed on Render:** https://log-all-the-things-fkwx.onrender.com/logs
(free tier - the first request after a while idle can take up to a minute,
and the log resets whenever the service restarts)

## What gets logged

Every request is appended to `log.csv` as one line:

| Column   | Example                                  |
| -------- | ---------------------------------------- |
| Agent    | `Mozilla/5.0 (Windows NT 10.0; Win64...)` |
| Time     | `2026-10-06T21:54:06.942Z` (ISO 8601)    |
| Method   | `GET`                                    |
| Resource | `/logs`                                  |
| Version  | `HTTP/1.1`                               |
| Status   | `200`                                    |

The same line is also printed to the console.

## Endpoints

| Method | Route   | Response                                          |
| ------ | ------- | ------------------------------------------------- |
| GET    | `/`     | `ok`                                              |
| GET    | `/logs` | The full log as a JSON array, one object per line |

```json
[
  {
    "Agent": "curl/8.19.0",
    "Time": "2026-10-06T21:54:06.942Z",
    "Method": "GET",
    "Resource": "/logs",
    "Version": "HTTP/1.1",
    "Status": "200"
  }
]
```

## Implementation notes

- **Self-initialising log** - `log.csv` isn't committed (it's in
  `.gitignore`), so on startup the server creates it with a header row if it
  doesn't exist. Without this, a fresh deploy would treat the first request
  as the column names.
- **CSV-safe user agents** - browser user agents contain commas (e.g.
  `(KHTML, like Gecko)`), which would shift every column. Commas in the user
  agent are replaced with semicolons before writing.
- **Non-blocking writes** - log lines are appended asynchronously so logging
  never delays the response.

## Run locally

```bash
npm install
npm start        # http://localhost:3000
npm test         # Mocha + Chai + Sinon tests for log format and endpoints
```

## Built with

Node.js, Express, Mocha, Chai, Sinon
