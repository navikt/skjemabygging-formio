import { AppConfigProvider } from '@navikt/skjemadigitalisering-shared-components';
import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import Pusher, { Channel } from 'pusher-js';
import PusherNotificationsProvider, { CHANNEL, EVENT, usePusherNotifications } from './NotificationsContext';

const channelSubscriptions = {};

vi.spyOn(Pusher.prototype, 'subscribe').mockImplementation((channel) => {
  return {
    bind: (eventName, callback) => {
      if (!channelSubscriptions[channel]) channelSubscriptions[channel] = {};
      channelSubscriptions[channel][eventName] = callback;
    },
    unbind: (eventName) => {
      channelSubscriptions[channel][eventName] = undefined;
    },
  } as Channel;
});

const wrapper = ({ children }) => (
  <AppConfigProvider config={{ pusherKey: 'pusher', pusherCluster: 'eu' }}>
    <PusherNotificationsProvider>{children}</PusherNotificationsProvider>
  </AppConfigProvider>
);

describe('NotificationsContext', () => {
  describe('usePusherNotifications', () => {
    it('initially returns no messages', () => {
      const { result } = renderHook(() => usePusherNotifications(), { wrapper });
      expect(result.current.messages).toHaveLength(0);
    });

    it('returns a success message when pusher emits a success event', () => {
      const { result } = renderHook(() => usePusherNotifications(), { wrapper });
      act(() => channelSubscriptions[CHANNEL][EVENT.success]({ title: 'Title', message: 'success message' }));
      const { messages } = result.current;
      expect(messages).toHaveLength(1);
      expect(messages[0].type).toBe('success');
    });

    it('returns an error message when pusher emits a failure event', () => {
      const { result } = renderHook(() => usePusherNotifications(), { wrapper });
      act(() => channelSubscriptions[CHANNEL][EVENT.failure]({ title: 'Title', message: 'error message' }));
      const { messages } = result.current;
      expect(messages).toHaveLength(1);
      expect(messages[0].type).toBe('error');
    });

    describe('When several messages are emitted', () => {
      let result;

      beforeEach(() => {
        const hookResult = renderHook(() => usePusherNotifications(), { wrapper });
        result = hookResult.result;
        act(() => channelSubscriptions[CHANNEL][EVENT.success]({ title: 'Title', message: 'success message' }));
        act(() => channelSubscriptions[CHANNEL][EVENT.failure]({ title: 'Title', message: 'error message' }));
        act(() => channelSubscriptions[CHANNEL][EVENT.success]({ title: 'Title', message: 'success message' }));
      });

      it('returns messages for all emitted success and failure events', () => {
        expect(result.current.messages).toHaveLength(3);
      });

      it('clears all messages', () => {
        act(() => result.current.clearAll());
        expect(result.current.messages).toHaveLength(0);
      });
    });
  });
});
