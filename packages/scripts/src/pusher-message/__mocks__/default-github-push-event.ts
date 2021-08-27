import {PushEvent} from "@octokit/webhooks-types";

const defaultGithubPushEvent = {
  "head_commit": {
    "author": {
      "email": "homer.simpson@mail.com",
      "name": "Homer Simpson",
      "username": "hsimpson"
    },
    "committer": {
      "email": "noreply@github.com",
      "name": "GitHub",
      "username": "web-flow"
    },
    "distinct": true,
    "id": "87324lkasjho384nalno3wiuoaw93",
    "message": "Tjo-hoo!",
    "timestamp": "2021-08-23T10:46:12+02:00",
    "tree_id": "a3aowo34ja3a3whlhaw3lhlaw3lawleøcra93uma",
    "url": "https://github.com/hsimpson/funny-repo/commit/05207b66223e524267161b099bddbf9be4b312f0"
  }
};
const pushEventWithCommitMessage = (commitMessage: string): PushEvent =>  {
  return {
    ...defaultGithubPushEvent,
    head_commit: {
      ...defaultGithubPushEvent.head_commit,
      message: commitMessage
    }
  } as PushEvent
};

export {pushEventWithCommitMessage};
export default defaultGithubPushEvent as PushEvent;
