import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { act, ReactNode } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useOptionalFieldStateStore } from '../state/StateContext';
import { SubmissionStateProvider } from '../state/SubmissionStateContext';
import { FormDefinitionProvider, useFormDefinitionForm, useFormDefinitionPanels } from './FormDefinitionContext';

const form = {
  title: 'Test form',
  path: 'test-form',
  properties: {},
  components: [
    {
      type: 'panel',
      key: 'page',
      navId: 'page',
      title: 'Page',
      components: [
        {
          type: 'checkbox',
          key: 'showExtra',
          navId: 'show-extra',
          label: 'Show extra field',
          input: true,
        },
        {
          type: 'textfield',
          key: 'extra',
          navId: 'extra',
          label: 'Extra field',
          input: true,
          customConditional: 'show = data.showExtra === true;',
        },
      ],
    },
  ],
} as unknown as Form;

const UpdateButton = ({ statePath, value, children }: { statePath: string; value: unknown; children: ReactNode }) => {
  const store = useOptionalFieldStateStore();
  return (
    <button type="button" onClick={() => store?.setValue(statePath, value)}>
      {children}
    </button>
  );
};

const FormObserver = ({ onRender }: { onRender: () => void }) => {
  const currentForm = useFormDefinitionForm();
  onRender();
  return <span data-testid="form">{currentForm.path}</span>;
};

const PanelsObserver = ({ onRender }: { onRender: () => void }) => {
  const panels = useFormDefinitionPanels();
  onRender();
  return <span data-testid="component-count">{panels[0]?.components?.length}</span>;
};

describe('FormDefinitionContext', () => {
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

  it('rerenders only selectors whose form-definition value changed', () => {
    const onFormRender = vi.fn();
    const onPanelsRender = vi.fn();

    act(() => {
      root.render(
        <SubmissionStateProvider initialSubmission={{ data: {} }}>
          <FormDefinitionProvider form={form}>
            <UpdateButton statePath="unrelated" value="value">
              Update unrelated field
            </UpdateButton>
            <UpdateButton statePath="showExtra" value>
              Show extra field
            </UpdateButton>
            <FormObserver onRender={onFormRender} />
            <PanelsObserver onRender={onPanelsRender} />
          </FormDefinitionProvider>
        </SubmissionStateProvider>,
      );
    });

    const initialFormRenders = onFormRender.mock.calls.length;
    const initialPanelsRenders = onPanelsRender.mock.calls.length;

    act(() => {
      (container.querySelectorAll('button')[0] as HTMLButtonElement).click();
    });

    expect(onFormRender).toHaveBeenCalledTimes(initialFormRenders);
    expect(onPanelsRender).toHaveBeenCalledTimes(initialPanelsRenders);

    act(() => {
      (container.querySelectorAll('button')[1] as HTMLButtonElement).click();
    });

    expect(container.querySelector('[data-testid="component-count"]')?.textContent).toBe('2');
    expect(onFormRender).toHaveBeenCalledTimes(initialFormRenders);
    expect(onPanelsRender.mock.calls.length).toBeGreaterThan(initialPanelsRenders);
  });
});
