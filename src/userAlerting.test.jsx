import {renderHook, act, cleanup} from "@testing-library/react-hooks";
import {useUserAlerting} from "./userAlerting";
import React from 'react';

let hookResult;
beforeEach(() => {
  jest.useFakeTimers();
  hookResult = runHook();
});

afterEach(() => {
  hookResult.unmount();
  jest.useRealTimers();
});

function runHook() {
  const fakePusher = {subscribe: jest.fn(() => ({bind: jest.fn(), unbind: jest.fn()}))};
  return renderHook(() =>
    useUserAlerting(fakePusher)
  );
}

it("removes the flash message after 5 seconds", async () => {
  expect(hookResult.result.current.alertComponent).toBeNull();
  act(() => hookResult.result.current.userAlerter.flashSuccessMessage("Påske"));
  await hookResult.waitFor(() => hookResult.result.current.alertComponent);
  expect(hookResult.result.current.alertComponent).not.toBeNull();
  act(() => jest.advanceTimersByTime(5000));
  expect(hookResult.result.current.alertComponent).toBeNull();
});

it('keeps the error message until dismissed', async () => {
  act(() => hookResult.result.current.userAlerter.setErrorMessage('flump flodhest'));
  await hookResult.waitFor(() => hookResult.result.current.alertComponent);
  expect(hookResult.result.current.alertComponent).not.toBeNull();
  act(() => jest.advanceTimersByTime(5000 * 5000));
  expect(hookResult.result.current.alertComponent).not.toBeNull();
  act(() => hookResult.result.current.userAlerter.popAlert());
  expect(hookResult.result.current.alertComponent).toBeNull();
});
