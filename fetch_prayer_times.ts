import { IncomingMessage } from 'http';
import * as https from 'https';

(function fetchPrayerTimes() {
  const methodsList = [1, 2, 3, 4, 5];
  const dateStr = '20-11-2025';
  const latitude = '21.543333';
  const longitude = '39.172778';

  methodsList.forEach((methodId) => {
    const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=${methodId}`;
  https
      .get(url, (res: IncomingMessage) => {
      let data = '';
        res.on('data', (chunk: Buffer) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`Method ${method}:`);
          console.log(JSON.stringify(json.data.timings, null, 2));
          console.log(JSON.stringify(json.data.meta.method, null, 2));
          console.log('---');
        } catch (e) {
          console.error(`Error parsing method ${method}:`, e);
        }
      });
    })
    .on('error', err => {
      console.error(`Error fetching method ${method}:`, err);
    });
});
