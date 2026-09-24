const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const appPath = path.join(__dirname, '..', 'src', 'app.js');
const server = spawn('node', [appPath], { cwd: path.join(__dirname, '..') });

server.stdout.on('data', () => {});
server.stderr.on('data', () => {});

setTimeout(() => {
  http.get('http://localhost:3000/api/clients', (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('STATUS:', res.statusCode);
      console.log('BODY:', data);

      if (res.statusCode !== 200) {
        console.error('Test failed: /api/clients did not return 200');
        process.exit(1);
      }

      server.kill();
      console.log('Test passed');
    });
  }).on('error', (err) => {
    console.error('Request failed:', err.message);
    server.kill();
    process.exit(1);
  });
}, 1000);
