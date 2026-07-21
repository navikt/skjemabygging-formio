import { Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { act, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useOptionalFieldStateStore } from './StateContext';
import { SubmissionStateProvider, useSubmissionState } from './SubmissionStateContext';

const SnapshotHarness = () => {
  const store = useOptionalFieldStateStore();
  const { submission } = useSubmissionState();
  const [secondSnapshot, setSecondSnapshot] = useState('');

  return (
    <>
      <button
        type="button"
        onClick={() => {
          store?.setValue('firstName', 'Ada');
          const nextSubmission = store?.setValue('lastName', 'Lovelace') as Submission | undefined;
          setSecondSnapshot(JSON.stringify(nextSubmission?.data ?? {}));
        }}
      >
        Update twice
      </button>
      <span data-testid="second-snapshot">{secondSnapshot}</span>
      <span data-testid="submission">{JSON.stringify(submission?.data ?? {})}</span>
    </>
  );
};

describe('SubmissionStateContext', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('returns the fully updated submission snapshot across synchronous setValue calls', () => {
    act(() => {
      root.render(
        <SubmissionStateProvider initialSubmission={{ data: {} }}>
          <SnapshotHarness />
        </SubmissionStateProvider>,
      );
    });

    act(() => {
      (container.querySelector('button') as HTMLButtonElement).click();
    });

    expect(container.querySelector('[data-testid="second-snapshot"]')?.textContent).toBe(
      '{"firstName":"Ada","lastName":"Lovelace"}',
    );
    expect(container.querySelector('[data-testid="submission"]')?.textContent).toBe(
      '{"firstName":"Ada","lastName":"Lovelace"}',
    );
  });
});
