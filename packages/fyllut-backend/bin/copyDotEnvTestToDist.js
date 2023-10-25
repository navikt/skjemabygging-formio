import fs from 'fs';
fs.copyFile('.env.test', 'dist/.env', (err) => {
  if (err) throw err;
  console.log('.env.test was copied to dist/.env');
});
