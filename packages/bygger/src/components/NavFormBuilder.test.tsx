import { NavFormioJs } from '@navikt/skjemadigitalisering-shared-components';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import createMockImplementation, { DEFAULT_PROJECT_URL } from '../../test/backendMockImplementation';
import NavFormBuilder from './NavFormBuilder';
import testform from './testdata/conditional-multiple-dependencies';

const findClosestWithAttribute = (element: HTMLElement, { name, value }: { name: string; value: string }) => {
  if (element.getAttribute(name) === value) {
    return element;
  }
  if (!element.parentElement) {
    return null;
  }
  return findClosestWithAttribute(element.parentElement, { name, value });
};

const getBuilderComponent = (element: HTMLElement) => {
  return findClosestWithAttribute(element, BUILDER_COMP_TESTID_ATTR) as HTMLElement;
};

const mockConfirm = (result: boolean) => vi.spyOn(window, 'confirm').mockImplementation(() => result);

const BUILDER_COMP_TESTID_ATTR = { name: 'data-testid', value: 'builder-component' };

const DEFAULT_FORM_BUILDER_OPTIONS = {
  formConfig: {},
};

describe('NavFormBuilder', () => {
  beforeAll(() => {
    new NavFormioJs.Formio(DEFAULT_PROJECT_URL);
  });

  beforeEach(() => {
    vi.spyOn(NavFormioJs.Formio, 'fetch').mockImplementation(createMockImplementation() as never);
  });

  afterEach(async () => {
    fetchMock.resetMocks();
    vi.restoreAllMocks();
    cleanup();
    await waitFor(() => Object.keys((NavFormioJs.Formio as any).forms).length === 0);
  });

  describe('mounting', () => {
    it('destroys webforms on unmount', async () => {
      const onChangeMock = vi.fn();
      const { unmount } = render(
        <NavFormBuilder form={testform} onChange={onChangeMock} formBuilderOptions={DEFAULT_FORM_BUILDER_OPTIONS} />,
      );
      await waitFor(() => Object.keys((NavFormioJs.Formio as any).forms).length > 0);
      unmount();
      await waitFor(() => Object.keys((NavFormioJs.Formio as any).forms).length === 0);
    });
  });

  describe('A form with conditional dependencies', () => {
    let onChangeMock: any;
    let onReadyMock: any;
    let rerender: any;

    beforeEach(async () => {
      onChangeMock = vi.fn();
      onReadyMock = vi.fn();
      const { rerender: outRerender } = render(
        <NavFormBuilder
          form={testform}
          onChange={onChangeMock}
          onReady={onReadyMock}
          formBuilderOptions={DEFAULT_FORM_BUILDER_OPTIONS}
        />,
      );
      rerender = outRerender;
      await waitFor(() => {
        if (onReadyMock.mock.calls.length !== 1) {
          throw new Error('NavFormBuilder not ready yet');
        }
      });
      onChangeMock.mockReset();
    });

    it('renders link for the first page in form definition', async () => {
      expect(await screen.findByRole('link', { name: 'Dine opplysninger' })).toBeInTheDocument();
    });

    it('adds another page', async () => {
      const leggTilNyttStegKnapp = await screen.findByRole('button', { name: 'Legg til nytt steg' });
      await userEvent.click(leggTilNyttStegKnapp);
      expect(await screen.findByRole('link', { name: 'Page 3' })).toBeTruthy();
      await waitFor(() => expect(onChangeMock.mock.calls).toHaveLength(1));
    }, 10000);

    describe('remove button', () => {
      it('removes a component which no other component depends on', async () => {
        const checkbox = await screen.findByLabelText('Oppgi din favorittfarge');
        expect(checkbox).toBeInTheDocument();

        const removeComponentButton = await within(getBuilderComponent(checkbox)).findByTitle('Slett');
        await userEvent.click(removeComponentButton);

        expect(screen.queryByLabelText('Oppgi din favorittfarge')).not.toBeInTheDocument();
        await waitFor(() => expect(onChangeMock.mock.calls).toHaveLength(1));
      });

      it('prompts user when removing a component which other components depends on', async () => {
        mockConfirm(true);
        const fieldset = await screen.findByRole('group', { name: /Your favorite time of the year/ });
        expect(fieldset).toBeInTheDocument();

        const removeComponentButton = await within(getBuilderComponent(fieldset)).findByTitle('Slett');
        await userEvent.click(removeComponentButton);

        expect(screen.queryByRole('group', { name: /Your favorite time of the year/ })).not.toBeInTheDocument();
        await waitFor(() => expect(onChangeMock.mock.calls).toHaveLength(1));
      });

      it('does not remove component if user declines prompt', async () => {
        const confirmMock = mockConfirm(false);
        const fieldset = await screen.findByRole('group', { name: /Your favorite time of the year/ });
        expect(fieldset).toBeInTheDocument();

        const removeComponentButton = await within(getBuilderComponent(fieldset)).findByTitle('Slett');
        await userEvent.click(removeComponentButton);

        expect(await screen.findByRole('group', { name: /Your favorite time of the year/ })).toBeInTheDocument();
        expect(onChangeMock.mock.calls).toHaveLength(0);

        expect(confirmMock.mock.calls).toHaveLength(1);
        expect(confirmMock.mock.calls[0][0]).toBe(
          'En eller flere andre komponenter har avhengighet til denne. Vil du fremdeles slette den?',
        );
      });

      it('prompts user when removing component containing component which other components depends on', async () => {
        const confirmMock = mockConfirm(true);
        const panel = await screen.findByText('Tilbakemelding');
        expect(panel).toBeInTheDocument();

        const builderComponent = getBuilderComponent(panel);
        const fieldset = await within(builderComponent).findByRole('group', { name: /Your favorite time of the year/ });
        expect(fieldset).toBeInTheDocument();

        const removeComponentButtons = await within(builderComponent).findAllByTitle('Slett');
        await userEvent.click(removeComponentButtons[0]);

        expect(screen.queryByText('Tilbakemelding')).not.toBeInTheDocument();
        expect(screen.queryByRole('group', { name: /Your favorite time of the year/ })).not.toBeInTheDocument();
        await waitFor(() => expect(onChangeMock.mock.calls).toHaveLength(1));

        expect(confirmMock.mock.calls).toHaveLength(1);
        expect(confirmMock.mock.calls[0][0]).toBe(
          'En eller flere andre komponenter har avhengighet til denne. Vil du fremdeles slette den?',
        );
      });

      it('prompts user when removing attachment panel', async () => {
        const confirmMock = mockConfirm(true);
        onReadyMock.mockReset();
        rerender(
          <NavFormBuilder
            form={{ ...testform, display: 'skjema' } as any}
            onChange={onChangeMock}
            onReady={onReadyMock}
            formBuilderOptions={DEFAULT_FORM_BUILDER_OPTIONS}
          />,
        );
        await waitFor(() => expect(onReadyMock.mock.calls).toHaveLength(1));

        const attachmentPanel = await screen.findByRole('button', { name: 'Vedlegg' });
        expect(attachmentPanel).toBeInTheDocument();
        const removeComponentButtons = await within(getBuilderComponent(attachmentPanel)).findAllByTitle('Slett');
        await userEvent.click(removeComponentButtons[0]);

        expect(confirmMock.mock.calls).toHaveLength(1);
        expect(confirmMock.mock.calls[0][0]).toBe(
          'Du forsøker nå å slette vedleggspanelet. For å gjenopprette må et predefinert vedleggspanel trekkes inn. Vil du fremdeles slette panelet?',
        );

        const attachmentPanelAfterNoDelete = screen.queryByRole('button', { name: 'Vedlegg' });
        expect(attachmentPanelAfterNoDelete).not.toBeInTheDocument();
      });

      it('does not remove attachment panel if user declines prompt', async () => {
        const confirmMock = mockConfirm(false);
        onReadyMock.mockReset();
        rerender(
          <NavFormBuilder
            form={{ ...testform, display: 'skjema' } as any}
            onChange={onChangeMock}
            onReady={onReadyMock}
            formBuilderOptions={DEFAULT_FORM_BUILDER_OPTIONS}
          />,
        );
        await waitFor(() => expect(onReadyMock.mock.calls).toHaveLength(1));

        const attachmentPanel = await screen.findByRole('button', { name: 'Vedlegg' });
        expect(attachmentPanel).toBeInTheDocument();
        const removeComponentButtons = await within(getBuilderComponent(attachmentPanel)).findAllByTitle('Slett');
        await userEvent.click(removeComponentButtons[0]);

        expect(confirmMock.mock.calls).toHaveLength(1);
        expect(confirmMock.mock.calls[0][0]).toBe(
          'Du forsøker nå å slette vedleggspanelet. For å gjenopprette må et predefinert vedleggspanel trekkes inn. Vil du fremdeles slette panelet?',
        );

        const attachmentPanelAfterNoDelete = await screen.findByRole('button', { name: 'Vedlegg' });
        expect(attachmentPanelAfterNoDelete).toBeInTheDocument();
      });
    });

    describe('conditional alert message in edit component', () => {
      it('is visible when component is depended upon by other components', async () => {
        const fieldset = await screen.findByRole('group', { name: /Your favorite time of the year/ });
        expect(fieldset).toBeInTheDocument();

        const editComponentButton = await within(getBuilderComponent(fieldset)).findByTitle('Rediger');
        await userEvent.click(editComponentButton);

        const conditionalAlert = await screen.findByRole('list', {
          name: 'Følgende komponenter har avhengighet til denne:',
        });
        expect(conditionalAlert).toBeInTheDocument();
        const dependentComponents = within(conditionalAlert).getAllByRole('listitem');
        expect(dependentComponents).toHaveLength(2);
      });

      it('is not visible when component is not depended upon by other components', async () => {
        const textInput = await screen.findByLabelText('Oppgi din favorittfarge');
        expect(textInput).toBeInTheDocument();

        const editComponentButton = await within(getBuilderComponent(textInput)).findByTitle('Rediger');
        await userEvent.click(editComponentButton);

        const conditionalAlert = screen.queryByRole('list', {
          name: 'Følgende komponenter har avhengighet til denne:',
        });
        expect(conditionalAlert).not.toBeInTheDocument();
      });
    });
  });
});
