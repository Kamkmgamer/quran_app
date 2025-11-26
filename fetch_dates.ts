import { IncomingMessage } from 'http';
import * as https from 'https';

(function fetchDates() {
  const methodId = 5;
  const datesList = ['20-11-2025', '21-11-2025'];
  const latitude = '21.543333';
  const longitude = '39.172778';

  datesList.forEach((dateStr) => {
    const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=${methodId}`;
    https.get(url, (res: IncomingMessage) => {
      let data = '';
      res.on('data', (chunk: Buffer) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          // eslint-disable-next-line no-console
          console.log(`Date ${dateStr}:`);
          // eslint-disable-next-line no-console
          console.log(`Fajr: ${json.data.timings.Fajr}`);
          // eslint-disable-next-line no-console
          console.log(`Sunrise: ${json.data.timings.Sunrise}`);
          // eslint-disable-next-line no-console
          console.log(`Dhuhr: ${json.data.timings.Dhuhr}`);
          // eslint-disable-next-line no-console
          console.log(`Asr: ${json.data.timings.Asr}`);
          // eslint-disable-next-line no-console
          console.log(`Maghrib: ${json.data.timings.Maghrib}`);
          // eslint-disable-next-line no-console
          console.log(`Isha: ${json.data.timings.Isha}`);
          // eslint-disable-next-line no-console
          console.log('---');
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(`Error parsing date ${dateStr}:`, e);
        }
      });
    });
  });
})();
