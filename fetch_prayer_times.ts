const https = require('https');

const methods = [1, 2, 3, 4, 5];
const date = '20-11-2025';
const lat = '21.543333';
const lng = '39.172778';

methods.forEach(method => {
  const url = `https://api.aladhan.com/v1/timings/${date}?latitude=${lat}&longitude=${lng}&method=${method}`;
  https
    .get(url, res => {
      let data = '';
      res.on('data', chunk => {
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
