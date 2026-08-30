import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { StateStoreProvider } from '../../context/state/StateContext';
import TextArea from './TextArea';

describe('TextArea', () => {
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

  it('keeps raw input while typing and stores the trimmed submission value', () => {
    let submissionValue: unknown;

    act(() => {
      root.render(
        <StateStoreProvider
          store={{
            getValue: () => undefined,
            setValue: (_statePath, value) => {
              submissionValue = value;
              return { data: { description: value } };
            },
          }}
        >
          <TextArea statePath="description" label="Description" />
        </StateStoreProvider>,
      );
    });

    const textArea = container.querySelector('textarea') as HTMLTextAreaElement;
    const setNativeValue = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;

    act(() => {
      textArea.focus();
      setNativeValue?.call(textArea, '  Some text  ');
      textArea.dispatchEvent(new Event('input', { bubbles: true }));
    });

    expect(textArea.value).toBe('  Some text  ');
    expect(submissionValue).toBe('Some text');

    act(() => {
      textArea.blur();
    });

    expect(textArea.value).toBe('Some text');
    expect(submissionValue).toBe('Some text');
  });

  it('keeps raw input while sending a normalized value to controlled consumers', () => {
    let controlledValue: string | undefined;

    act(() => {
      root.render(
        <TextArea
          statePath="description"
          label="Description"
          value=""
          onChange={(value) => {
            controlledValue = value;
          }}
        />,
      );
    });

    const textArea = container.querySelector('textarea') as HTMLTextAreaElement;
    const setNativeValue = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;

    act(() => {
      textArea.focus();
      setNativeValue?.call(textArea, '  Some text  ');
      textArea.dispatchEvent(new Event('input', { bubbles: true }));
    });

    expect(textArea.value).toBe('  Some text  ');
    expect(controlledValue).toBe('Some text');
  });
});
