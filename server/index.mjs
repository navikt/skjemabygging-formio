import express from 'express';
const app = express();

import {dispatcherWithBackend, Backend} from '../src/backend/index.mjs';

// app.get('/api/hey', (req, res) => res.json({message: 'ho'}));

app.use('/api', dispatcherWithBackend(new Backend()));

const nodeEnv = process.env.NODE_ENV;
if (nodeEnv === 'production') {
  // serve built app in production (served by weback dev server in development)
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
  })
}

const port = parseInt(process.env.PORT || '8080');
console.log('serving on ', port, nodeEnv);
app.listen(port);