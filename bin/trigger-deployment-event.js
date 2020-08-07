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
  secret: pusherAppValue('secret')
}

const pusher = new Pusher({
  ...pusherApp,
  cluster: 'mt1',
  useTLS: true
});

const jsonString = fs.readFileSync(0, 'utf-8');
const message = JSON.parse(jsonString);

console.log('sending the following message', message.deployment_status);

pusher.trigger('my-channel', 'my-event', {
  'message': message.deployment_status,
});