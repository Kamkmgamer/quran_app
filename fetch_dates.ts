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
        console.log(`Date ${date}:`);
        console.log(`Fajr: ${json.data.timings.Fajr}`);
        console.log(`Sunrise: ${json.data.timings.Sunrise}`);
        console.log(`Dhuhr: ${json.data.timings.Dhuhr}`);
        console.log(`Asr: ${json.data.timings.Asr}`);
        console.log(`Maghrib: ${json.data.timings.Maghrib}`);
        console.log(`Isha: ${json.data.timings.Isha}`);
        console.log('---');
      } catch (e) {
        console.error(`Error parsing date ${date}:`, e);
      }
    });
  });
});
