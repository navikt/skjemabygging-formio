import {PushEvent, Commit, WorkflowDispatchEvent} from "@octokit/webhooks-types";
import Pusher, {Options} from "pusher";
import PusherFactory from "./pusher-factory";

export interface Skjemapublisering {
  commitUrl?: string;
  skjematittel?: string;
}

export interface PusherMessage {
  authorName?: string;
  skjemautfyllerCommit?: Commit | null;
  skjemapublisering: Skjemapublisering;
  monorepoGitHash?: string;
  formJsonFileTitle?: string;
}

export interface WorkflowDispatchInputs {
  formJsonFileTitle: string,
  formDescription?: string,
  encodedFormJson: string,
  encodedTranslationJson?: string,
  monorepoGitHash: string
}

export type PusherChannel = 'skjemautfyller-deployed' | 'build-aborted' | 'publish-aborted';
export type PusherEvent = 'publication' | 'other' | 'failure';

const PUBLISH_COMMIT_REGEXP = /^\[publisering\].*/;
const PUBLISH_REGEXP = /^\[publisering\] skjema (.*), monorepo ref: (.*)$/;

const isPublication = (message: PushEvent) => {
  const thisCommit = message.head_commit;
  const commitMessage = thisCommit?.message || '';
  return commitMessage.match(PUBLISH_COMMIT_REGEXP);
}

const buildTriggerMessage = (message: PushEvent): PusherMessage => {
  const thisCommit = message.head_commit;
  const commitMessage = thisCommit?.message || '';
  const myRegexp = new RegExp(PUBLISH_REGEXP, "g");
  const match = myRegexp.exec(commitMessage);
  return {
    skjemautfyllerCommit: thisCommit,
    skjemapublisering: {
      commitUrl: thisCommit?.url,
      skjematittel: match ? match[1] : undefined,
    },
  };
}

const sendMessage = (pusher: Pusher, channel: PusherChannel, event: PusherEvent, pusherMessage: PusherMessage) => {
  console.log("sending:", channel, event, pusherMessage);
  pusher.trigger(channel, event, pusherMessage);
}

const run = (channel: PusherChannel, eventMessage: PushEvent, pusherApp: Options) => {
  const pusher = PusherFactory.createInstance(pusherApp);
  const pusherMessage = buildTriggerMessage(eventMessage);
  const event = isPublication(eventMessage) ? "publication" : "other";
  sendMessage(pusher, channel, event, pusherMessage);
}

const buildPublishAbortedMessage = (message: WorkflowDispatchEvent): PusherMessage => {
  const inputs: WorkflowDispatchInputs = message.inputs as unknown as WorkflowDispatchInputs;
  return {
    skjemapublisering: {
      commitUrl: inputs.formJsonFileTitle,
      skjematittel: inputs.formDescription || inputs.formJsonFileTitle,
    },
    monorepoGitHash: inputs.monorepoGitHash,
    formJsonFileTitle: inputs.formJsonFileTitle,
  };
}

export const execute = (channel: PusherChannel, pusherConfig: Options, githubEventMessage: PushEvent | WorkflowDispatchEvent) => {
  if (channel === "publish-aborted") {
    const pusher = PusherFactory.createInstance(pusherConfig);
    const pusherMessage = buildPublishAbortedMessage(githubEventMessage as WorkflowDispatchEvent);
    const event = "failure";
    sendMessage(pusher, channel, event, pusherMessage);
  } else {
    run(channel, githubEventMessage as PushEvent, pusherConfig);
  }
}
