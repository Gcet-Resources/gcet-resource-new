import type { IncomingMessage, ServerResponse } from 'node:http';
export default function handler(_request: IncomingMessage, response: ServerResponse) {
  response.writeHead(410, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify({ error: 'This legacy API has been retired. Refresh the application to use the current campus services.' }));
}
