#!/usr/bin/env node
import {Options} from "pusher";
import fs from "fs";
import {execute, PusherChannel} from "./workflow-message";

const pusherAppValue = (name: string) => {
  const key = `PUSHER_APP_${name.toUpperCase()}`;
  const appValue = process.env[key];
  if (!appValue) {
    throw new Error(`Must specify env var ${key}`);
  }
  return appValue;
}

const args = process.argv.slice(2);
const channel: PusherChannel = args[0] as PusherChannel;

const usageMessage = "Usage: trigger-workflow-message.mjs <channel>";
if (!channel) {
  throw new Error(usageMessage);
}
const stdinContent = fs.readFileSync(0, "utf-8");
const githubEventMessage = JSON.parse(stdinContent);

const pusherConfig: Options = {
  appId: pusherAppValue("id"),
  key: pusherAppValue("key"),
  secret: pusherAppValue("secret"),
  cluster: pusherAppValue("cluster"),
};

execute(channel, pusherConfig, githubEventMessage);
