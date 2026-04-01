import { Enhetstype, FormPropertiesType, NavFormType, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import forstesideMock from '../../../test/test-data/forsteside/forsteside-mock';
import { AppConfigProvider } from '../../context/config/configContext';
import { FormProvider } from '../../context/form/FormContext';
import { PrepareLetterPage } from './PrepareLetterPage';

vi.mock('../../context/languages', () => ({
  useLanguages: () => ({ translate: (text) => text }),
}));

vi.mock('../../components/letter/ux-signals/LetterUXSignals', () => {
  return {
    default: ({ id, demo }) => (
      <section data-testid="uxsignals">
        <div data-testid="uxsignals-id">{id}</div>
        <div data-testid="uxsignals-demo">{demo ? 'true' : 'false'}</div>
      </section>
    ),
  };
});

const RESPONSE_HEADERS = {
  headers: {
    'content-type': 'application/json',
  },
  status: 200,
};
const RESPONSE_HEADERS_PLAIN_TEXT = {
  headers: {
    'content-type': 'text/plain',
  },
  status: 200,
};
const RESPONSE_HEADERS_PDF = {
  headers: {
    'content-type': 'application/pdf',
  },
  status: 200,
};
const RESPONSE_HEADERS_ERROR = {
  headers: {
    'content-type': 'application/json',
  },
  status: 500,
};

const mockEnhetsListe = [
  { enhetId: 1, navn: 'Nav-ENHET YTA', type: 'YTA', enhetNr: '001' },
  { enhetId: 2, navn: 'Nav-ENHET LOKAL', type: 'LOKAL', enhetNr: '002' },
  { enhetId: 3, navn: 'Nav-ENHET ARK', type: 'ARK', enhetNr: '003' },
  { enhetId: 4, navn: 'Nav-ENHET FPY', type: 'FPY', enhetNr: '004' },
  { enhetId: 5, navn: 'Nav-ENHET INTRO', type: 'INTRO', enhetNr: '005' },
  { enhetId: 6, navn: 'Nav-ENHET ALS', type: 'ALS', enhetNr: '006' },
];

const defaultForm = {
  title: 'Testskjema',
  components: [
    {
      label: 'Page 1',
      key: 'page1',
      type: 'panel',
      components: [
        {
          label: 'Fornavn',
          type: 'textfield',
          key: 'fornavn',
        },
      ],
    },
  ],
  properties: {} as FormPropertiesType,
} as NavFormType;

const formWithProperties = (props: Partial<FormPropertiesType>) => {
  return {
    ...defaultForm,
    properties: {
      ...defaultForm.properties,
      ...props,
    },
  };
};

const defaultConfig = {
  NAIS_CLUSTER_NAME: 'dev-gcp',
};

function renderPrepareLetterPage(form = defaultForm, config = defaultConfig, fyllutBaseURL?: string) {
  render(
    <MemoryRouter>
      <AppConfigProvider config={config} fyllutBaseURL={fyllutBaseURL}>
        <FormProvider form={form}>
          <PrepareLetterPage />
        </FormProvider>
      </AppConfigProvider>
    </MemoryRouter>,
  );
}

describe('PrepareLetterPage', () => {
  beforeEach(() => {
    fetchMock.mockImplementation((url) => {
      const urlString = url as string;
      if (urlString.endsWith('/recipients')) {
        return Promise.resolve(new Response(JSON.stringify([]), RESPONSE_HEADERS));
      }
      if (urlString.endsWith('/api/foersteside')) {
        return Promise.resolve(new Response(JSON.stringify(forstesideMock), RESPONSE_HEADERS));
      }
      if (urlString.endsWith('/api/enhetsliste')) {
        return Promise.resolve(new Response(JSON.stringify(mockEnhetsListe), RESPONSE_HEADERS));
      }
      if (urlString.endsWith('/api/documents/cover-page-and-application')) {
        return Promise.resolve(new Response(undefined, RESPONSE_HEADERS_PDF));
      }

      console.error(`Manglende testoppsett: Ukjent url ${urlString}`);
      return Promise.reject<Response>();
    });
  });

  afterEach(() => {
    fetchMock.mockClear();
  });

  describe('Download button', () => {
    it('Download cover page and application', async () => {
      const fyllutBaseURL = 'http://127.0.0.1/fyllut';

      renderPrepareLetterPage(undefined, undefined, fyllutBaseURL);

      await userEvent.click(screen.getByRole('button', { name: TEXTS.grensesnitt.downloadApplication }));

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('Laster ikke ned førsteside pdf dersom enhet ikke er valgt, og viser feilmelding i stedet', async () => {
      const form = formWithProperties({
        enhetMaVelgesVedPapirInnsending: true,
      });
      renderPrepareLetterPage(form);

      await userEvent.click(screen.getByRole('button', { name: TEXTS.grensesnitt.downloadApplication }));

      expect(await screen.findByText(TEXTS.statiske.prepareLetterPage.entityNotSelectedError)).toBeInTheDocument();
    });
  });

  describe("When form property 'enhetMaVelgesVedPapirInnsending' is false", () => {
    it('does not fetch EnhetsListe', () => {
      expect(fetchMock).not.toHaveBeenCalledWith('/api/enhetsliste');
    });
  });

  describe("When form property 'enhetMaVelgesVedPapirInnsending' is true", () => {
    const DOWN_ARROW = { keyCode: 40 };
    const enhetstyper: Enhetstype[] = ['ALS', 'ARK', 'LOKAL'];

    describe("When form property 'enhetstyper' is provided", () => {
      beforeEach(async () => {
        renderPrepareLetterPage(formWithProperties({ enhetMaVelgesVedPapirInnsending: true, enhetstyper }));
      });

      it('fetches Enhetsliste', async () => {
        await waitFor(() => fetchMock.mock.calls.length > 0);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith('/api/enhetsliste');
      });

      it("EnhetSelector only lists Enhet if their type is present in 'enhetstyper'", async () => {
        await waitFor(() => fetchMock.mock.calls.length > 0);
        const enhetSelector = screen.getByText(TEXTS.statiske.prepareLetterPage.selectEntityDefault);
        fireEvent.keyDown(enhetSelector, DOWN_ARROW);

        const options = screen.getAllByText(/^Nav-ENHET/).map((element) => element.textContent);
        expect(options).toHaveLength(3);
        expect(options).toEqual(['Nav-ENHET ALS', 'Nav-ENHET ARK', 'Nav-ENHET LOKAL']);
      });
    });

    describe("When fetched enhetstype-list does not include any matching form property 'enhetstyper'", () => {
      const SKJEMANUMMER = 'NAV 12.34-56';

      beforeEach(async () => {
        fetchMock.mockImplementation((url) => {
          const urlString = url as string;
          if (urlString.endsWith('/api/enhetsliste')) {
            return Promise.resolve(new Response(JSON.stringify(mockEnhetsListe), RESPONSE_HEADERS));
          }
          if (urlString.endsWith('/api/log/error')) {
            return Promise.resolve(new Response('OK', RESPONSE_HEADERS_PLAIN_TEXT));
          }
          console.error(`Manglende testoppsett: Ukjent url ${urlString}`);
          return Promise.reject<Response>();
        });
        const GAMMEL_TYPE = 'GAMMEL_TYPE' as Enhetstype;
        renderPrepareLetterPage(
          formWithProperties({
            enhetMaVelgesVedPapirInnsending: true,
            enhetstyper: [GAMMEL_TYPE],
            skjemanummer: SKJEMANUMMER,
          }),
        );
      });

      it('defaults to rendering complete enhetsliste', async () => {
        await waitFor(() => fetchMock.mock.calls.length > 0);
        expect(fetchMock.mock.calls[0][0]).toBe('/api/enhetsliste');

        const enhetSelector = screen.getByText(TEXTS.statiske.prepareLetterPage.selectEntityDefault);
        fireEvent.keyDown(enhetSelector, DOWN_ARROW);

        const enhetSelectList = screen.queryAllByText(/^Nav-ENHET/);
        expect(enhetSelectList).toHaveLength(6);
      });

      it('fetch error message is not rendered', async () => {
        await waitFor(() => fetchMock.mock.calls.length > 0);
        const errorMessage = screen.queryByText(TEXTS.statiske.prepareLetterPage.entityFetchError);
        expect(errorMessage).not.toBeInTheDocument();
      });

      it('reports error to backend', async () => {
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
        expect(fetchMock.mock.calls[1][0]).toBe('/api/log/error');
        const request = {
          path: fetchMock.mock.calls[1][0],
          body: JSON.parse(fetchMock.mock.calls[1][1]?.body as string),
        };
        expect(request.path).toBe('/api/log/error');
        expect(request.body.message).toBe('Ingen relevante enheter funnet');
        expect(request.body.metadata.skjemanummer).toEqual(SKJEMANUMMER);
      });
    });

    describe('When fetching of enhetsliste fails', () => {
      beforeEach(async () => {
        fetchMock.mockImplementation((url) => {
          const urlString = url as string;
          if (urlString.endsWith('/api/enhetsliste')) {
            return Promise.resolve(new Response(JSON.stringify({}), RESPONSE_HEADERS_ERROR));
          }
          console.error(`Manglende testoppsett: Ukjent url ${url}`);
          return Promise.reject<Response>();
        });
        renderPrepareLetterPage(formWithProperties({ enhetMaVelgesVedPapirInnsending: true, enhetstyper }));
      });

      it('select list is not renderes', async () => {
        await waitFor(() => fetchMock.mock.calls.length > 0);
        const enhetSelectList = screen.queryAllByText(/^Nav-ENHET/);
        expect(enhetSelectList).toHaveLength(0);
      });

      it('fetch error message is rendered', async () => {
        await waitFor(() => fetchMock.mock.calls.length > 0);
        const errorMessage = screen.getByText(TEXTS.statiske.prepareLetterPage.entityFetchError);
        expect(errorMessage).toBeInTheDocument();
      });
    });

    it.each([[], undefined])(
      "renders EnhetSelector with all supported Enhet items, when 'enhetstyper' is empty/undefined",
      async (enhetstyper) => {
        renderPrepareLetterPage(formWithProperties({ enhetMaVelgesVedPapirInnsending: true, enhetstyper }));
        await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/enhetsliste'));

        const enhetSelector = screen.getByText(TEXTS.statiske.prepareLetterPage.selectEntityDefault);
        expect(enhetSelector).toBeDefined();
        fireEvent.keyDown(enhetSelector, DOWN_ARROW);

        const enhetSelectList = screen.getAllByText(/^Nav-ENHET/);
        expect(enhetSelectList).toHaveLength(6);
      },
    );
  });

  describe('UX signals', () => {
    const UX_SIGNALS_ID = 'abc-123';
    const DEV_CONFIG = {
      NAIS_CLUSTER_NAME: 'dev-gcp',
    };
    const PROD_CONFIG = {
      NAIS_CLUSTER_NAME: 'prod-gcp',
    };

    it('does not render when ux signals id is missing', () => {
      renderPrepareLetterPage(
        formWithProperties({
          uxSignalsId: undefined,
        }),
        DEV_CONFIG,
      );
      const uxSignalsSection = screen.queryByTestId('uxsignals');
      expect(uxSignalsSection).not.toBeInTheDocument();
    });

    it('renders in demo mode', async () => {
      const config = {
        NAIS_CLUSTER_NAME: 'dev-gcp',
      };
      renderPrepareLetterPage(
        formWithProperties({
          uxSignalsId: UX_SIGNALS_ID,
          uxSignalsSubmissionTypes: ['PAPER', 'DIGITAL'],
        }),
        config,
      );
      const id = screen.queryByTestId('uxsignals-id');
      expect(id).toBeInTheDocument();
      expect(id).toHaveTextContent(UX_SIGNALS_ID);
      const demo = screen.queryByTestId('uxsignals-demo');
      expect(demo).toBeInTheDocument();
      expect(demo).toHaveTextContent('true');
    });

    it('renders in production mode', () => {
      renderPrepareLetterPage(
        formWithProperties({
          uxSignalsId: UX_SIGNALS_ID,
          uxSignalsSubmissionTypes: ['PAPER', 'DIGITAL'],
        }),
        PROD_CONFIG,
      );
      const demo = screen.queryByTestId('uxsignals-demo');
      expect(demo).toBeInTheDocument();
      expect(demo).toHaveTextContent('false');
    });

    describe('innsendingstype', () => {
      it('renders when ux innsendingstype is KUN_PAPIR', () => {
        renderPrepareLetterPage(
          formWithProperties({
            uxSignalsId: UX_SIGNALS_ID,
            uxSignalsSubmissionTypes: ['PAPER'],
          }),
          DEV_CONFIG,
        );
        const uxSignalsSection = screen.queryByTestId('uxsignals');
        expect(uxSignalsSection).toBeInTheDocument();
      });

      it('renders when ux innsendingstype is PAPIR_OG_DIGITAL', () => {
        renderPrepareLetterPage(
          formWithProperties({
            uxSignalsId: UX_SIGNALS_ID,
            uxSignalsSubmissionTypes: ['PAPER', 'DIGITAL'],
          }),
          DEV_CONFIG,
        );
        const uxSignalsSection = screen.queryByTestId('uxsignals');
        expect(uxSignalsSection).toBeInTheDocument();
      });

      it('does not render when ux innsendingstype is KUN_DIGITAL', () => {
        renderPrepareLetterPage(
          formWithProperties({
            uxSignalsId: UX_SIGNALS_ID,
            uxSignalsSubmissionTypes: ['DIGITAL'],
          }),
          DEV_CONFIG,
        );
        const uxSignalsSection = screen.queryByTestId('uxsignals');
        expect(uxSignalsSection).not.toBeInTheDocument();
      });
    });
  });
});
