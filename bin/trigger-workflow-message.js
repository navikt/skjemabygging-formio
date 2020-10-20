#!/usr/bin/env node

import Pusher from 'pusher';
import fs from 'fs';

function computeEvent(message) {
  const thisCommit = message.head_commit;
  const commitMessage = thisCommit.message;
  const publishCommitRe = /^Bump skjemapublisering dependency to navikt\/skjemapublisering.git#(?<gitHash>[0-9a-f]+)$/;
  const publishMessageResult = commitMessage.match(publishCommitRe);
  let event = 'other';
  if (publishMessageResult) {
    event = 'publication';
  }
  return event;
}

function buildTriggerMessage(message, packageJson) {
  const thisCommit = message.head_commit;
  const skjemapubliseringsCommitUrl = packageJson.dependencies.skjemapublisering;
  const skjemapubliseringsUrlRe = /navikt\/skjemapublisering.git#(?<gitHash>[0-9a-f]+)$/
  const skjemapubliseringsCommitResult = skjemapubliseringsCommitUrl.match(skjemapubliseringsUrlRe);
  const pusherMessage = {
    'skjemautfyllerCommit': thisCommit,
    'skjemapublisering': {
      'commitUrl': skjemapubliseringsCommitUrl,
      'commitHash': skjemapubliseringsCommitResult.groups.gitHash
    },
  };
  return pusherMessage;
}

function pusherAppValue(name) {
  const key = `PUSHER_APP_${name.toUpperCase()}`;
  const appValue = process.env[key];
  if (!appValue) {
    throw new Error(`Must specify env var ${key}`);
  }
  return appValue
}

function sendMessage(pusher, channel, event, pusherMessage) {
  console.log('sending:', channel, event, pusherMessage);
  pusher.trigger(channel, event, pusherMessage);
}

function run(channel, message, packageJson, pusherApp) {
  const pusher = new Pusher({
    ...pusherApp,
    useTLS: true
  });
  const pusherMessage = buildTriggerMessage(message, packageJson);
  const event = computeEvent(message);
  sendMessage(pusher, channel, event, pusherMessage);
}


const args = process.argv.slice(2);
const channel = args[0];

const usageMessage = "Usage: trigger-workflow-message.js <channel>";
if (!channel) {
  throw new Error(usageMessage);
}
const stdinContent = fs.readFileSync(0, 'utf-8');
const githubEventMessage = JSON.parse(stdinContent);

const packageJsonString = fs.readFileSync('package.json', 'utf-8');
const packageJson = JSON.parse(packageJsonString);

const pusherApp = {
  appId: pusherAppValue('id'),
  key: pusherAppValue('key'),
  secret: pusherAppValue('secret'),
  cluster: pusherAppValue('cluster')
}
run(channel, githubEventMessage, packageJson, pusherApp);
