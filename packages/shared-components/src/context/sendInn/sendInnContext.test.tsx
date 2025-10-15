import { NavFormType, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { http } from '../../index';
import { AppConfigProvider } from '../config/configContext';
import { FormProvider } from '../form/FormContext';
import { SendInnProvider, useSendInn } from './sendInnContext';

const mockHttp = {
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

describe('sendInnContext', () => {
  const TestComponent = ({ submission }) => {
    const { updateMellomlagring, deleteMellomlagring, submitSoknad, innsendingsId } = useSendInn();

    return (
      <>
        <div data-testid={'innsendings-id'}>{innsendingsId}</div>
        <button onClick={() => updateMellomlagring(submission)}>Oppdater mellomlagring</button>
        <button onClick={() => deleteMellomlagring()}>Slett mellomlagring</button>
        <button onClick={() => submitSoknad(submission)}>Send inn søknad</button>
      </>
    );
  };

  const innsendingsId = 'abc-123-456';
  const form = { title: 'TestSkjema', components: [] } as unknown as NavFormType;
  const submission = { data: { question: 'answer' } } as unknown as Submission;
  const submissionMethod = 'digital';
  const headers = {};

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('When mellomlagring is enabled', () => {
    beforeEach(() => {
      mockHttp.post.mockReturnValue({ innsendingsId });
      render(
        <AppConfigProvider
          app={'fyllut'}
          submissionMethod={submissionMethod}
          featureToggles={{}}
          http={mockHttp as unknown as typeof http}
          baseUrl={'http://test.example.no'}
          config={{ isTest: true, loggerConfig: { enabled: false } }}
        >
          <MemoryRouter>
            <FormProvider form={form}>
              <SendInnProvider>
                <TestComponent submission={submission} />
              </SendInnProvider>
            </FormProvider>
          </MemoryRouter>
        </AppConfigProvider>,
      );
    });

    describe('updateMellomlagring', () => {
      it('sends a PUT request to /api/send-inn/soknad', async () => {
        await screen.findByTestId('innsendings-id');
        await userEvent.click(screen.getByRole('button', { name: 'Oppdater mellomlagring' }));
        expect(mockHttp.put).toHaveBeenCalledTimes(1);
        expect(mockHttp.put).toHaveBeenCalledWith(
          'http://test.example.no/api/send-inn/soknad',
          expect.objectContaining({
            form,
            submission,
            submissionMethod,
            innsendingsId,
          }),
        );
      });
    });

    describe('deleteMellomlagring', () => {
      it('sends a DELETE request to /api/send-inn/soknad', async () => {
        await screen.findByTestId('innsendings-id');
        await userEvent.click(screen.getByRole('button', { name: 'Slett mellomlagring' }));
        expect(mockHttp.delete).toHaveBeenCalledTimes(1);
        expect(mockHttp.delete).toHaveBeenCalledWith(`http://test.example.no/api/send-inn/soknad/${innsendingsId}`);
      });
    });

    describe('submitSoknad', () => {
      it('sends a PUT request to /api/send-inn/utfyltsoknad', async () => {
        await screen.findByTestId('innsendings-id');
        await userEvent.click(screen.getByRole('button', { name: 'Send inn søknad' }));
        expect(mockHttp.put).toHaveBeenCalledTimes(1);
        expect(mockHttp.put).toHaveBeenCalledWith(
          'http://test.example.no/api/send-inn/utfyltsoknad',
          expect.objectContaining({
            form,
            submission,
            submissionMethod,
            innsendingsId,
          }),
          headers,
          expect.objectContaining({
            setRedirectLocation: expect.any(Function),
          }),
        );
      });
    });
  });
});
