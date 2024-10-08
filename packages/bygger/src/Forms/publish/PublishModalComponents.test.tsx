import { MockedComponentObjectForTest } from '@navikt/skjemadigitalisering-shared-domain';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PublishModalComponents from './PublishModalComponents';

const { createDummyAttachment, createFormObject, createPanelObject } = MockedComponentObjectForTest;

const ERROR_MESSAGE_MISSING_KODE_OR_TITTEL =
  'Du må fylle ut vedleggskode og vedleggstittel for alle vedlegg før skjemaet kan publiseres.';

describe('PublishModalComponents', () => {
  let mockedCloseModal;
  const renderPublishSettingsModal = (form) => {
    mockedCloseModal = vi.fn();
    render(
      <PublishModalComponents
        openPublishSettingModal={true}
        setOpenPublishSettingModal={mockedCloseModal}
        form={form}
      />,
    );
  };

  const createFormWithAttachment = (attachmentProps) =>
    createFormObject(
      [createPanelObject('Personinformasjon', [createDummyAttachment('Bekreftelse fra skole', attachmentProps)])],
      'Veiledning',
    );

  describe('When attachment definition is complete', () => {
    beforeEach(() => {
      const form = createFormWithAttachment({
        vedleggstittel: 'Bekreftelse fra skole',
        vedleggskode: 'B1',
      });
      renderPublishSettingsModal(form);
    });

    it('the publish button is visible', () => {
      const publishButton = screen.queryByRole('button', { name: 'Publiser' });
      expect(publishButton).toBeInTheDocument();
    });

    it("confirm modal is shown when clicking 'Publiser' button", async () => {
      const publishButton = screen.queryByRole('button', { name: 'Publiser' });
      expect(publishButton).toBeInTheDocument();
      await userEvent.click(publishButton!);

      expect(screen.queryByText('Er du sikker på at dette skjemaet skal publiseres?')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Ja, publiser skjemaet' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Nei, ikke publiser skjemaet' })).toBeInTheDocument();
    });

    it('no error message is rendered', () => {
      const feilmelding = screen.queryByText(ERROR_MESSAGE_MISSING_KODE_OR_TITTEL);
      expect(feilmelding).not.toBeVisible();
    });
  });

  describe('When vedleggskode is missing in attachment definition', () => {
    beforeEach(() => {
      const form = createFormWithAttachment({
        vedleggstittel: 'Bekreftelse fra skole',
        vedleggskode: '',
      });
      renderPublishSettingsModal(form);
    });

    it('the publish button is not visible', () => {
      const publishButton = screen.queryByRole('button', { name: 'Publiser' });
      expect(publishButton).not.toBeInTheDocument();
    });

    it('an error message is rendered', () => {
      const feilmelding = screen.queryByText(ERROR_MESSAGE_MISSING_KODE_OR_TITTEL);
      expect(feilmelding).toBeInTheDocument();
    });
  });

  describe('When vedleggstittel is missing in attachment definition', () => {
    beforeEach(() => {
      const form = createFormWithAttachment({
        vedleggstittel: '',
        vedleggskode: 'B1',
      });
      renderPublishSettingsModal(form);
    });

    it('the publish button is not visible', () => {
      const publishButton = screen.queryByRole('button', { name: 'Publiser' });
      expect(publishButton).not.toBeInTheDocument();
    });

    it('an error message is rendered', () => {
      const feilmelding = screen.queryByText(ERROR_MESSAGE_MISSING_KODE_OR_TITTEL);
      expect(feilmelding).toBeInTheDocument();
    });
  });

  describe('When both vedleggskode and vedleggstittel is missing in attachment definition', () => {
    beforeEach(() => {
      const form = createFormWithAttachment({
        vedleggstittel: '',
        vedleggskode: '',
      });
      renderPublishSettingsModal(form);
    });

    it('the publish button is not visible', () => {
      const publishButton = screen.queryByRole('button', { name: 'Publiser' });
      expect(publishButton).not.toBeInTheDocument();
    });

    it('an error message is rendered', () => {
      const feilmelding = screen.queryByText(ERROR_MESSAGE_MISSING_KODE_OR_TITTEL);
      expect(feilmelding).toBeInTheDocument();
    });
  });
});
