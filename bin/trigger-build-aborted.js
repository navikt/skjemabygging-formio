#!/usr/bin/env node

import Pusher from 'pusher';
import fs from 'fs';

console.log('got here');

function pusherAppValue(name) {
  return process.env[`PUSHER_APP_${name.toUpperCase()}`]
}

const pusherApp = {
  appId: pusherAppValue('id'),
  key: pusherAppValue('key'),
  secret: pusherAppValue('secret'),
  cluster: pusherAppValue('cluster')
}

const pusher = new Pusher({
  ...pusherApp,
  useTLS: true
});

const jsonString = fs.readFileSync(0, 'utf-8');
const message = JSON.parse(jsonString);

console.log('sending the following message', message);

pusher.trigger('build-aborted', 'event', message);

