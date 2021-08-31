import { renderHook, act } from "@testing-library/react-hooks";
import { useUserAlerting } from "./userAlerting";
import React from "react";

describe("userAlerting", () => {
  let hookResult;
  let channelSubscriptions = {};
  beforeEach(() => {
    jest.useFakeTimers();
    channelSubscriptions = {};
    hookResult = runHook();
  });

  afterEach(() => {
    hookResult.unmount();
    jest.useRealTimers();
  });

  const pusherSubscribe = (channel) => {
    channelSubscriptions[channel] = {};
    return {
      bind: (eventName, callback) => {
        channelSubscriptions[channel][eventName] = callback;
      },
      unbind: (eventName) => {
        channelSubscriptions[channel][eventName] = undefined;
      },
    };
  };

  function runHook() {
    const fakePusher = { subscribe: pusherSubscribe };
    return renderHook(() => useUserAlerting(fakePusher));
  }

  describe("general alerts", () => {
    it("removes the flash message after 5 seconds", async () => {
      expect(hookResult.result.current.alertComponent()).toBeNull();
      act(() => hookResult.result.current.flashSuccessMessage("Påske"));
      await hookResult.waitFor(() => hookResult.result.current.alertComponent());
      expect(hookResult.result.current.alertComponent()).not.toBeNull();
      act(() => jest.advanceTimersByTime(5000));
      expect(hookResult.result.current.alertComponent()).toBeNull();
    });

    it("keeps the error message until dismissed", async () => {
      act(() => hookResult.result.current.setErrorMessage("flump flodhest"));
      await hookResult.waitFor(() => hookResult.result.current.alertComponent());
      expect(hookResult.result.current.alertComponent()).not.toBeNull();
      act(() => jest.advanceTimersByTime(5000 * 5000));
      expect(hookResult.result.current.alertComponent()).not.toBeNull();
      act(() => hookResult.result.current.popAlert());
      expect(hookResult.result.current.alertComponent()).toBeNull();
    });

    it("correctly adds and removes alertComponents", async () => {
      // use add and remove and alertContainer directly here
      expect(hookResult.result.current.alertComponent()).toBeNull();
      let key;
      act(() => {
        key = hookResult.result.current.addAlertComponent(() => <div>Fjamsemams</div>);
      });
      expect(hookResult.result.current.alertComponent()).not.toBeNull();
      act(() => hookResult.result.current.removeAlertComponent(key));
      expect(hookResult.result.current.alertComponent()).toBeNull();
    });
  });

  describe("pusher messages", () => {
    const pusherMessage = {
      skjemapublisering: {
        commitUrl: "nav123456",
        skjematittel: "Et testskjema",
      },
    };

    it("subscribes on mount", () => {
      expect(Object.keys(channelSubscriptions)).toEqual([
        "skjemautfyller-deployed",
        "build-aborted",
        "publish-aborted",
      ]);
    });

    it("renders pusher message skjemaufyller-deployed", () => {
      expect(hookResult.result.current.alertComponent()).toBeNull();
      channelSubscriptions["skjemautfyller-deployed"]["publication"](pusherMessage);
      expect(hookResult.result.current.alertComponent()).not.toBeNull();
    });

    it("renders pusher message build-aborted", () => {
      expect(hookResult.result.current.alertComponent()).toBeNull();
      channelSubscriptions["build-aborted"]["publication"](pusherMessage);
      expect(hookResult.result.current.alertComponent()).not.toBeNull();
    });
  });
});
