import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {Backend} from '../src/backend/index.js';
import {dispatcherWithBackend} from "../src/backend/webApp.js";

// node backward compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const projectURL = process.env.REACT_APP_FORMIO_PROJECT_URL || "https://protected-island-44773.herokuapp.com";
const skjemapubliseringGHUrl = "https://api.github.com/repos/navikt/skjemapublisering-test/contents/skjema";
const GH_USER = process.env.GITHUB_USER;
const GH_PASS = process.env.GITHUB_PASSWORD;

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/api', dispatcherWithBackend(new Backend(projectURL, skjemapubliseringGHUrl, GH_USER, GH_PASS)));

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
