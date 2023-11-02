import { act, renderHook } from '@testing-library/react';
import useMessageQueue from './useMessageQueue';

describe('useMessageQueue', () => {
  it('pushes messages on the queue', () => {
    const { result } = renderHook(() => useMessageQueue());
    const [messages, queue] = result.current;
    expect(messages).toHaveLength(0);

    act(() => queue.push({ message: 'success', type: 'success' }));
    act(() => queue.push({ message: 'error', type: 'error' }));
    const [updatedMessages] = result.current;
    expect(updatedMessages).toHaveLength(2);
  });

  it('removes cleared messages from the queue', () => {
    const { result } = renderHook(() => useMessageQueue());
    const [, queue] = result.current;

    act(() => queue.push({ message: 'success', type: 'success' }));
    act(() => queue.push({ message: 'warning', type: 'warning' }));
    act(() => queue.push({ message: 'error', type: 'error' }));
    let [updatedMessages] = result.current;
    expect(updatedMessages).toHaveLength(3);

    const toBeRemoved = updatedMessages[1];
    act(() => toBeRemoved.clear());
    [updatedMessages] = result.current;
    expect(updatedMessages).toHaveLength(2);
    expect(updatedMessages).not.toContain(toBeRemoved);
  });
});
