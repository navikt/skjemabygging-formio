import { NavFormType, Submission, SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';
import { http } from '../../index';
import { AppConfigProvider } from '../config/configContext';
import { FormProvider } from '../form/FormContext';
import { SendInnProvider, useSendInn } from './sendInnContext';

vi.mock('../../context/languages', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    useLanguages: () => ({ translate: (text) => text }),
  };
});

const mockHttp = {
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

describe('sendInnContext', () => {
  const TestComponent = ({ submission }) => {
    const { updateMellomlagring, deleteMellomlagring, submitSoknad, innsendingsId, setCaptchaValue, getUploadToken } =
      useSendInn();
    const [uploadToken, setUploadToken] = useState<string | undefined>();

    return (
      <>
        <div data-testid={'innsendings-id'}>{innsendingsId}</div>
        <div data-testid={'upload-token'}>{uploadToken}</div>
        <button onClick={() => updateMellomlagring(submission)}>Oppdater mellomlagring</button>
        <button onClick={() => deleteMellomlagring()}>Slett mellomlagring</button>
        <button onClick={() => submitSoknad(submission)}>Send inn søknad</button>
        <button onClick={() => setCaptchaValue({ firstName: 'Roar' })}>Sett captcha</button>
        <button
          onClick={async () => {
            const token = await getUploadToken();
            setUploadToken(token);
          }}
        >
          Hent opplastings-token
        </button>
      </>
    );
  };

  const innsendingsId = 'abc-123-456';
  const form = { title: 'TestSkjema', components: [], properties: { signatures: [] } } as unknown as NavFormType;
  const submission = { data: { question: 'answer' } } as unknown as Submission;
  const submissionMethod = 'digital';
  const headers = {};
  const createValidToken = () => `e30.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))}.signature`;
  const renderTestComponent = (method: SubmissionMethod = submissionMethod) => {
    render(
      <AppConfigProvider
        app={'fyllut'}
        submissionMethod={method}
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
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('When mellomlagring is enabled', () => {
    beforeEach(() => {
      mockHttp.post.mockReturnValue({ innsendingsId });
      renderTestComponent();
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

  describe('captcha-backed upload token', () => {
    it('submits captcha and stores the returned token for digitalnologin', async () => {
      const validToken = createValidToken();
      mockHttp.post.mockResolvedValue({ success: true, access_token: validToken });
      renderTestComponent('digitalnologin');

      await userEvent.click(screen.getByRole('button', { name: 'Sett captcha' }));
      await userEvent.click(screen.getByRole('button', { name: 'Hent opplastings-token' }));

      expect(mockHttp.post).toHaveBeenCalledWith('/fyllut/api/captcha', { firstName: 'Roar', data_33: 'ja' });
      await waitFor(() => expect(screen.getByTestId('upload-token')).toHaveTextContent(validToken));
    });

    it('reuses the existing token without re-submitting captcha', async () => {
      const validToken = createValidToken();
      mockHttp.post.mockResolvedValue({ success: true, access_token: validToken });
      renderTestComponent('digitalnologin');

      await userEvent.click(screen.getByRole('button', { name: 'Hent opplastings-token' }));
      await waitFor(() => expect(screen.getByTestId('upload-token')).toHaveTextContent(validToken));
      mockHttp.post.mockClear();
      await userEvent.click(screen.getByRole('button', { name: 'Hent opplastings-token' }));

      expect(mockHttp.post).not.toHaveBeenCalled();
      await waitFor(() => expect(screen.getByTestId('upload-token')).toHaveTextContent(validToken));
    });
  });
});
