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


const thisCommit = message.head_commit;
const commitMessage = thisCommit.message;
console.log('commit message', commitMessage);
const publishCommitRe = /^Bump skjemapublisering dependency to navikt\/skjemapublisering-test.git#(?<gitHash>[0-9a-f]+)$/;
const publishMessageResult = commitMessage.match(publishCommitRe);

const packageJsonString = fs.readFileSync('package.json', 'utf-8');
const packageJson = JSON.parse(packageJsonString);
const skjemapubliseringsCommitUrl = packageJson.dependencies.skjemapublisering;

const skjemapubliseringsUrlRe = /navikt\/skjemapublisering-test.git#(?<gitHash>[0-9a-f]+)$/
const skjemapubliseringsCommitResult = skjemapubliseringsCommitUrl.match(skjemapubliseringsUrlRe);
console.log('package json stuffs', skjemapubliseringsCommitResult);

let event = 'other';
if (publishMessageResult) {
  event = 'publication';
}


const pusherMessage = {
  'skjemautfyllerCommit': thisCommit,
  'skjemapublisering': {
    'commitUrl': skjemapubliseringsCommitUrl,
    'commitHash': skjemapubliseringsCommitResult.groups.gitHash
  },
};
console.log('sending the following message', pusherMessage);
pusher.trigger('build-aborted', event, pusherMessage);
