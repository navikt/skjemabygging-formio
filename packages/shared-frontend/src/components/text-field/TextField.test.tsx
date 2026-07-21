import { act, useMemo, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { StateStoreProvider } from '../../context/state/StateContext';
import TextField from './TextField';

const createStore = (
  values: Record<string, unknown>,
  setValues: (updater: (prev: Record<string, unknown>) => Record<string, unknown>) => void,
) => ({
  getValue: (statePath: string) => values[statePath],
  setValue: (statePath: string, value: unknown) => {
    let nextValues = values;
    setValues((previousValues) => {
      nextValues = { ...previousValues, [statePath]: value };
      return nextValues;
    });
    return { data: nextValues };
  },
});

const TestHarness = () => {
  const [statePath, setStatePath] = useState('grid[0].name');
  const [values, setValues] = useState<Record<string, unknown>>({
    'grid[0].name': 'Hund',
    'grid[1].name': 'Katt',
  });
  const store = useMemo(() => createStore(values, setValues), [values]);

  return (
    <StateStoreProvider store={store}>
      <button type="button" onClick={() => setStatePath('grid[1].name')}>
        Switch row
      </button>
      <TextField statePath={statePath} label="Name" />
    </StateStoreProvider>
  );
};

describe('TextField', () => {
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

  it('syncs its display value when the bound state path changes', () => {
    act(() => {
      root.render(<TestHarness />);
    });

    const input = container.querySelector('input');
    const switchButton = container.querySelector('button');

    expect(input).not.toBeNull();
    expect(switchButton).not.toBeNull();
    expect((input as HTMLInputElement).value).toBe('Hund');

    act(() => {
      (switchButton as HTMLButtonElement).click();
    });

    expect((container.querySelector('input') as HTMLInputElement).value).toBe('Katt');
  });
});
