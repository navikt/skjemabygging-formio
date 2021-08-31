import {execute, PusherChannel, PusherEvent, PusherMessage} from "./workflow-message";
import PusherFactory from "./pusher-factory";
import Pusher from "pusher";
import defaultGithubPushEvent, {pushEventWithCommitMessage} from "./__mocks__/default-github-push-event";
import defaultGithubWorkflowDispatchEvent, {workflowDispatchEventWithInputs} from "./__mocks__/default-github-workflow-dispatch-event";
import mockPusherOptions from "./__mocks__/mock-pusher-options";

jest.mock('./pusher-factory');
const PusherInstanceMock = PusherFactory as jest.MockedClass<typeof PusherFactory>;

interface TriggerArgs {
  channel: PusherChannel;
  event: PusherEvent;
  data: PusherMessage;
}

const extractTriggerArgs = (mockCall: any): TriggerArgs => {
  return {
    channel: mockCall[0],
    event: mockCall[1],
    data: mockCall[2],
  }
}

describe('workflow-message', () => {

  let pusherTrigger: jest.MockedFunction<any>;

  beforeEach(() => {
    pusherTrigger = jest.fn();
    PusherInstanceMock.mockClear();
    PusherInstanceMock.createInstance = () => ({trigger: pusherTrigger} as Pusher);
  });

  describe('general push event', () => {

    it('should trigger message to correct channel', () => {
      execute('skjemautfyller-deployed', mockPusherOptions, defaultGithubPushEvent);
      expect(pusherTrigger).toBeCalledTimes(1);

      const triggerArgs = extractTriggerArgs(pusherTrigger.mock.calls[0]);
      expect(triggerArgs.channel).toEqual('skjemautfyller-deployed');
      expect(triggerArgs.event).toEqual('other');
      expect(triggerArgs.data).toBeDefined();
    });

  });

  describe('publication event', () => {

    it('should trigger publication event with correct event type and include commit url', () => {
      const githubEvent = pushEventWithCommitMessage(
        "[publisering] endring i et skjema"
      );
      execute('skjemautfyller-deployed', mockPusherOptions, githubEvent);
      expect(pusherTrigger).toBeCalledTimes(1);

      const triggerArgs = extractTriggerArgs(pusherTrigger.mock.calls[0]);
      expect(triggerArgs.channel).toEqual('skjemautfyller-deployed');
      expect(triggerArgs.event).toEqual('publication');
      expect(triggerArgs.data.skjemapublisering.commitUrl).toEqual(defaultGithubPushEvent.head_commit?.url);
      expect(triggerArgs.data.skjemapublisering.skjematittel).toBeUndefined();
    });

    it('should trigger publication event with skjemanummer as skjematittel', () => {
      const githubEvent = pushEventWithCommitMessage(
        "[publisering] skjema nav123456, monorepo ref: 9876543210"
      );
      execute('skjemautfyller-deployed', mockPusherOptions, githubEvent);
      expect(pusherTrigger).toBeCalledTimes(1);

      const triggerArgs = extractTriggerArgs(pusherTrigger.mock.calls[0]);
      expect(triggerArgs.data.skjemapublisering.skjematittel).toEqual('nav123456');
    });

    it('should trigger publication event with skjematittel', () => {
      const githubEvent = pushEventWithCommitMessage(
        "[publisering] skjema Mitt testskjema, monorepo ref: 9876543210"
      );
      execute('skjemautfyller-deployed', mockPusherOptions, githubEvent);
      expect(pusherTrigger).toBeCalledTimes(1);

      const triggerArgs = extractTriggerArgs(pusherTrigger.mock.calls[0]);
      expect(triggerArgs.data.skjemapublisering.skjematittel).toEqual('Mitt testskjema');
    });

    it('should trigger publication event with skjematittel containing comma', () => {
      const githubEvent = pushEventWithCommitMessage(
        "[publisering] skjema Søknad om tolk til døve, døvblinde og hørselshemmede, monorepo ref: 9876543210"
      );
      execute('skjemautfyller-deployed', mockPusherOptions, githubEvent);
      expect(pusherTrigger).toBeCalledTimes(1);

      const triggerArgs = extractTriggerArgs(pusherTrigger.mock.calls[0]);
      expect(triggerArgs.data.skjemapublisering.skjematittel).toEqual('Søknad om tolk til døve, døvblinde og hørselshemmede');
    });

  });

  describe('workflow dispatch', () => {

    it('should trigger failure to publish-aborted', () => {
      execute('publish-aborted', mockPusherOptions, defaultGithubWorkflowDispatchEvent);
      expect(pusherTrigger).toBeCalledTimes(1);

      const triggerArgs = extractTriggerArgs(pusherTrigger.mock.calls[0]);
      expect(triggerArgs.channel).toEqual('publish-aborted');
      expect(triggerArgs.event).toEqual('failure');
    });

    it('should trigger failed publish', () => {
      const skjemanummer = "nav332211";
      const skjematittel = "Enda et testskjema";
      const githubEvent = workflowDispatchEventWithInputs({
        "formJsonFileTitle": skjemanummer,
        "formDescription": skjematittel,
      })

      execute('publish-aborted', mockPusherOptions, githubEvent);
      expect(pusherTrigger).toBeCalledTimes(1);

      const triggerArgs = extractTriggerArgs(pusherTrigger.mock.calls[0]);
      expect(triggerArgs.data.skjemapublisering.commitUrl).toEqual(skjemanummer);
      expect(triggerArgs.data.skjemapublisering.skjematittel).toEqual(skjematittel);
    });

    it('should trigger failed publish when formDescription is missing', () => {
      const skjemanummer = "nav332211";
      const githubEvent = workflowDispatchEventWithInputs({
        "formJsonFileTitle": skjemanummer,
        "formDescription": "",
      })

      execute('publish-aborted', mockPusherOptions, githubEvent);
      expect(pusherTrigger).toBeCalledTimes(1);

      const triggerArgs = extractTriggerArgs(pusherTrigger.mock.calls[0]);
      expect(triggerArgs.data.skjemapublisering.commitUrl).toEqual(skjemanummer);
      expect(triggerArgs.data.skjemapublisering.skjematittel).toEqual(skjemanummer);
    });

  });

});
