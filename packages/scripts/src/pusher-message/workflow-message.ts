import { Commit, PushEvent, WorkflowDispatchEvent } from "@octokit/webhooks-types";
import Pusher, { Options } from "pusher";
import PusherFactory from "./pusher-factory";

export interface Skjemapublisering {
  commitUrl?: string;
  skjematittel?: string;
  antall?: number;
}

export interface PusherMessage {
  authorName?: string;
  skjemautfyllerCommit?: Commit | null;
  skjemapublisering: Skjemapublisering;
  monorepoGitHash?: string;
  formJsonFileTitle?: string;
}

export interface PublishFormInputs {
  formJsonFileTitle: string;
  formDescription?: string;
  encodedFormJson: string;
  encodedTranslationJson?: string;
  monorepoGitHash: string;
}

export interface PublishResourceInputs {
  resourceName: string;
  encodedJson: string;
}

export type PusherChannel =
  | "skjemautfyller-deployed"
  | "build-aborted"
  | "publish-aborted"
  | "publish-resource-aborted";
export type PusherEvent = "publication" | "bulk-publication" | "other" | "failure";

const BULK_PUBLISH_COMMIT_REGEXP = /^\[bulk-publisering\].*/;
const BULK_PUBLISH_REGEXP = /^\[bulk-publisering\] (\d+) skjemaer publisert, monorepo ref: (.*)$/;
const PUBLISH_COMMIT_REGEXP = /^\[publisering\].*/;
const UN_PUBLISH_COMMIT_REGEXP = /^\[avpublisering\].*/;
const PUBLISH_REGEXP = /^\[publisering\] skjema \"(.*)\", monorepo ref: (.*)$/;

const getEventType = (message: PushEvent): PusherEvent => {
  const thisCommit = message.head_commit;
  const commitMessage = thisCommit?.message || "";
  if (commitMessage.match(PUBLISH_COMMIT_REGEXP) || commitMessage.match(UN_PUBLISH_COMMIT_REGEXP)) return "publication";
  if (commitMessage.match(BULK_PUBLISH_COMMIT_REGEXP)) return "bulk-publication";
  return "other";
};

const buildTriggerMessage = (message: PushEvent): PusherMessage => {
  const thisCommit = message.head_commit;
  const commitMessage = thisCommit?.message || "";
  const titleRegexp = new RegExp(PUBLISH_REGEXP, "g");
  const titleMatch = titleRegexp.exec(commitMessage);
  const amountRegexp = new RegExp(BULK_PUBLISH_REGEXP, "g");
  const amountMatch = amountRegexp.exec(commitMessage);
  return {
    skjemautfyllerCommit: thisCommit,
    skjemapublisering: {
      commitUrl: thisCommit?.url,
      skjematittel: titleMatch ? titleMatch[1] : undefined,
      antall: amountMatch ? parseInt(amountMatch[1]) : undefined,
    },
  };
};

const sendMessage = (pusher: Pusher, channel: PusherChannel, event: PusherEvent, pusherMessage: PusherMessage) => {
  console.log("sending:", channel, event, pusherMessage);
  pusher.trigger(channel, event, pusherMessage);
};

const run = (channel: PusherChannel, eventMessage: PushEvent, pusherApp: Options) => {
  const pusher = PusherFactory.createInstance(pusherApp);
  const pusherMessage = buildTriggerMessage(eventMessage);
  const event = getEventType(eventMessage);
  sendMessage(pusher, channel, event, pusherMessage);
};

const buildPublishAbortedMessage = (message: WorkflowDispatchEvent): PusherMessage => {
  const inputs: PublishFormInputs = message.inputs as unknown as PublishFormInputs;
  return {
    skjemapublisering: {
      commitUrl: inputs.formJsonFileTitle,
      skjematittel: inputs.formDescription || inputs.formJsonFileTitle,
    },
    monorepoGitHash: inputs.monorepoGitHash,
    formJsonFileTitle: inputs.formJsonFileTitle,
  };
};
const buildPublishResourceAbortedMessage = (message: WorkflowDispatchEvent): PusherMessage => {
  const inputs: PublishResourceInputs = message.inputs as unknown as PublishResourceInputs;
  return {
    skjemapublisering: {
      skjematittel: inputs.resourceName,
    },
  };
};

export const execute = (
  channel: PusherChannel,
  pusherConfig: Options,
  githubEventMessage: PushEvent | WorkflowDispatchEvent
) => {
  if (channel === "publish-aborted") {
    const pusher = PusherFactory.createInstance(pusherConfig);
    const pusherMessage = buildPublishAbortedMessage(githubEventMessage as WorkflowDispatchEvent);
    const event = "failure";
    sendMessage(pusher, channel, event, pusherMessage);
  } else if (channel === "publish-resource-aborted") {
    const pusher = PusherFactory.createInstance(pusherConfig);
    const pusherMessage = buildPublishResourceAbortedMessage(githubEventMessage as WorkflowDispatchEvent);
    const event = "failure";
    sendMessage(pusher, channel, event, pusherMessage);
  } else {
    run(channel, githubEventMessage as PushEvent, pusherConfig);
  }
};
