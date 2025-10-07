import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router';
import { http } from '../../index';
import { AppConfigProvider } from '../config/configContext';
import { FormProvider, useForm } from './FormContext';

const mockHttp = {
  get: vi.fn(),
};

describe('prefillDataContext', () => {
  const TestComponent = () => {
    const { prefillData } = useForm();

    return (
      <>
        {prefillData?.sokerFornavn && (
          <>
            <p data-testid={'fornavn'}>{prefillData?.sokerFornavn}</p>
            <p>{prefillData?.sokerEtternavn}</p>
          </>
        )}
      </>
    );
  };

  const formWithPrefillKeys = {
    title: 'TestSkjema',
    components: [
      { type: 'textfield', prefillKey: 'sokerFornavn' },
      { type: 'textfield', prefillKey: 'sokerEtternavn' },
    ],
  } as unknown as NavFormType;

  const formWithoutPrefillKeys = {
    title: 'TestSkjema',
    components: [],
  } as unknown as NavFormType;

  const submissionMethod = 'digital';

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Form with prefillKey', () => {
    beforeEach(async () => {
      mockHttp.get.mockReturnValue({ sokerFornavn: 'Ola', sokerEtternavn: 'Nordmann' });
      await act(async () => {
        render(
          <AppConfigProvider
            app={'fyllut'}
            submissionMethod={submissionMethod}
            featureToggles={{}}
            http={mockHttp as unknown as typeof http}
            baseUrl={'http://test.example.no'}
            config={{ isTest: true }}
          >
            <MemoryRouter>
              <FormProvider form={formWithPrefillKeys}>
                <TestComponent />
              </FormProvider>
            </MemoryRouter>
          </AppConfigProvider>,
        );
      });
    });

    it('should send send a GET request to /api/send-inn/prefill-data if form has prefillKey', async () => {
      await screen.findByTestId('fornavn');
      expect(mockHttp.get).toHaveBeenCalledTimes(1);
      expect(mockHttp.get).toHaveBeenCalledWith(
        'http://test.example.no/api/send-inn/prefill-data?properties=sokerFornavn,sokerEtternavn',
      );
    });

    it('should render prefill data', async () => {
      await screen.findByTestId('fornavn');
      expect(screen.getByText('Ola')).toBeInTheDocument();
      expect(screen.getByText('Nordmann')).toBeInTheDocument();
    });
  });

  describe('Form without prefillKey', () => {
    beforeEach(async () => {
      await act(async () => {
        render(
          <AppConfigProvider
            app={'fyllut'}
            submissionMethod={submissionMethod}
            featureToggles={{}}
            http={mockHttp as unknown as typeof http}
            baseUrl={'http://test.example.no'}
            config={{ isTest: true }}
          >
            <MemoryRouter>
              <FormProvider form={formWithoutPrefillKeys}>
                <TestComponent />
              </FormProvider>
            </MemoryRouter>
          </AppConfigProvider>,
        );
      });
    });

    it('should not send send a GET request to /api/send-inn/prefill-data if form does not have prefillKey', async () => {
      expect(mockHttp.get).not.toHaveBeenCalled();
    });

    it('should not render prefill data', async () => {
      expect(screen.queryByText('Ola')).not.toBeInTheDocument();
      expect(screen.queryByText('Nordmann')).not.toBeInTheDocument();
    });
  });
});
