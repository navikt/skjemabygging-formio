import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {dispatcherWithBackend, Backend} from '../src/backend/index.mjs';

// node backward compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use('/api', dispatcherWithBackend(new Backend()));

const nodeEnv = process.env.NODE_ENV;
if (nodeEnv === 'production') {
  // serve built app in production (served by weback dev server in development)
  app.use(express.static(path.join(__dirname, '..', 'build')));
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname,'..', 'build', 'index.html'))
  })
}

const port = parseInt(process.env.PORT || '8080');
console.log('serving on ', port, nodeEnv);
app.listen(port);