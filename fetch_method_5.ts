import { IncomingMessage } from 'http';
import * as https from 'https';

(function fetchMethod5() {
  const methodId = 5;
  const dateStr = '20-11-2025';
  const latitude = '21.543333';
  const longitude = '39.172778';

  const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=${methodId}`;
  // eslint-disable-next-line no-console
console.log('Fetching URL:', url);

  https.get(url, (res: IncomingMessage) => {
  let data = '';
    res.on('data', (chunk: Buffer) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(`Method ${method}:`);
      console.log(JSON.stringify(json.data.timings, null, 2));
      console.log(JSON.stringify(json.data.meta.method, null, 2));
    } catch (e) {
      console.error(`Error parsing method ${method}:`, e);
    }
  });
}).on('error', (err) => {
  console.error(`Error fetching method ${method}:`, err);
});
