import { AppConfigProvider } from '@navikt/skjemadigitalisering-shared-components';
import { act, cleanup, renderHook } from '@testing-library/react';
import Pusher, { Channel } from 'pusher-js';
import { Mock } from 'vitest';
import PusherNotificationsProvider, { CHANNEL, EVENT, usePusherNotifications } from './NotificationsContext';

const DEFAULT_CONFIG = { pusherKey: 'pusher', pusherCluster: 'eu' };
const wrapper = ({ children }) => (
  <AppConfigProvider config={DEFAULT_CONFIG}>
    <PusherNotificationsProvider>{children}</PusherNotificationsProvider>
  </AppConfigProvider>
);

describe('NotificationsContext', () => {
  let channelSubscriptions = {};
  let mockUnsubscribe: Mock;
  let mockDisconnect: Mock;
  let mockSubscribe: Mock;

  beforeEach(() => {
    mockUnsubscribe = vi.fn();
    mockDisconnect = vi.fn();
    mockSubscribe = vi.fn();
    vi.spyOn(Pusher.prototype, 'unsubscribe').mockImplementation(mockUnsubscribe);
    vi.spyOn(Pusher.prototype, 'disconnect').mockImplementation(mockDisconnect);
    vi.spyOn(Pusher.prototype, 'subscribe').mockImplementation((channel) => {
      mockSubscribe(channel);
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
  });
  afterEach(() => {
    channelSubscriptions = {};
  });
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

    it('unsubscribes and disconnects on unmount', () => {
      renderHook(() => usePusherNotifications(), { wrapper });
      cleanup();
      expect(mockUnsubscribe).toHaveBeenCalledWith('fyllut-deployment');
      expect(mockDisconnect).toHaveBeenCalledTimes(1);
    });

    it('does not reconnect on rerender', () => {
      const { rerender } = renderHook(() => usePusherNotifications(), { wrapper });
      rerender();
      cleanup();
      expect(mockSubscribe).toHaveBeenCalledTimes(1);
      expect(mockUnsubscribe).toHaveBeenCalledWith('fyllut-deployment');
      expect(mockDisconnect).toHaveBeenCalledTimes(1);
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
