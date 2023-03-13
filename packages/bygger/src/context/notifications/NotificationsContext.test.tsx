import { AppConfigProvider } from "@navikt/skjemadigitalisering-shared-components";
import { act } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import PusherNotificationsProvider, { usePusherNotifications } from "./NotificationsContext";

let channelSubscriptions = {};
jest.mock("pusher-js", () => {
  return function () {
    return {
      subscribe: (channel) => {
        channelSubscriptions[channel] = {};
        return {
          bind: (eventName, callback) => {
            channelSubscriptions[channel][eventName] = callback;
          },
          unbind: (eventName) => {
            channelSubscriptions[channel][eventName] = undefined;
          },
        };
      },
    };
  };
});

const wrapper = ({ children }) => (
  <AppConfigProvider config={{ pusherKey: "pusher", pusherCluster: "eu" }}>
    <PusherNotificationsProvider>{children}</PusherNotificationsProvider>
  </AppConfigProvider>
);

describe("NotificationsContext", () => {
  describe("usePusherNotifications", () => {
    it("initially returns no messages", () => {
      const { result } = renderHook(() => usePusherNotifications(), { wrapper });
      expect(result.current).toHaveLength(0);
    });

    it("returns a success message when pusher emits a success event", () => {
      const { result } = renderHook(() => usePusherNotifications(), { wrapper });
      act(() => channelSubscriptions["fyllut-deployment"]["success"]({ title: "Title", message: "success message" }));
      expect(result.current).toHaveLength(1);
      expect(result.current[0].type).toBe("success");
    });

    it("returns an error message when pusher emits a failure event", () => {
      const { result } = renderHook(() => usePusherNotifications(), { wrapper });
      act(() => channelSubscriptions["fyllut-deployment"]["failure"]({ title: "Title", message: "error message" }));
      expect(result.current).toHaveLength(1);
      expect(result.current[0].type).toBe("error");
    });

    it("returns messages for all emitted success and failure events", () => {
      const { result } = renderHook(() => usePusherNotifications(), { wrapper });
      act(() => channelSubscriptions["fyllut-deployment"]["success"]({ title: "Title", message: "error message" }));
      act(() => channelSubscriptions["fyllut-deployment"]["failure"]({ title: "Title", message: "error message" }));
      act(() => channelSubscriptions["fyllut-deployment"]["success"]({ title: "Title", message: "error message" }));
      expect(result.current).toHaveLength(3);
    });
  });
});
