const https = require('https');

const method = 5;
const date = '20-11-2025';
const lat = '21.543333';
const lng = '39.172778';

const url = `https://api.aladhan.com/v1/timings/${date}?latitude=${lat}&longitude=${lng}&method=${method}`;
console.log('Fetching URL:', url);

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
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
