const https = require('https');

const method = 5;
const dates = ['20-11-2025', '21-11-2025'];
const lat = '21.543333';
const lng = '39.172778';

dates.forEach(date => {
  const url = `https://api.aladhan.com/v1/timings/${date}?latitude=${lat}&longitude=${lng}&method=${method}`;
  https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
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
