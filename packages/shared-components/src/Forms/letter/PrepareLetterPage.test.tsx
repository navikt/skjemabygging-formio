import {
  FormPropertiesType,
  NavFormType,
  Submission,
  SubmissionData,
  TEXTS,
} from "@navikt/skjemadigitalisering-shared-domain";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AppConfigProvider } from "../../configContext";
import pdf from "../../util/pdf";
import forstesideMock from "../testdata/forsteside-mock";
import { PrepareLetterPage } from "./PrepareLetterPage";

vi.mock("../../context/languages", () => ({
  useLanguages: () => ({ translate: (text) => text }),
}));

vi.mock("../../util/pdf");

const DEFAULT_TRANSLATIONS = {};
const RESPONSE_HEADERS = {
  headers: {
    "content-type": "application/json",
  },
  status: 200,
};
const RESPONSE_HEADERS_PLAIN_TEXT = {
  headers: {
    "content-type": "text/plain",
  },
  status: 200,
};
const RESPONSE_HEADERS_ERROR = {
  headers: {
    "content-type": "application/json",
  },
  status: 500,
};

const mockEnhetsListe = [
  { enhetId: 1, navn: "NAV-ENHET YTA", type: "YTA", enhetNr: "001" },
  { enhetId: 2, navn: "NAV-ENHET LOKAL", type: "LOKAL", enhetNr: "002" },
  { enhetId: 3, navn: "NAV-ENHET ARK", type: "ARK", enhetNr: "003" },
  { enhetId: 4, navn: "NAV-ENHET FPY", type: "FPY", enhetNr: "004" },
  { enhetId: 5, navn: "NAV-ENHET INTRO", type: "INTRO", enhetNr: "005" },
  { enhetId: 6, navn: "NAV-ENHET ALS", type: "ALS", enhetNr: "006" },
];

const defaultForm = {
  title: "Testskjema",
  components: [
    {
      label: "Page 1",
      key: "page1",
      type: "panel",
      components: [
        {
          label: "Fornavn",
          type: "textfield",
          key: "fornavn",
        },
      ],
    },
  ],
  properties: {} as FormPropertiesType,
} as NavFormType;

const defaultSubmission = {
  data: {
    fornavn: "Mie",
  } as SubmissionData,
} as Submission;
const formWithProperties = (props) => {
  return {
    ...defaultForm,
    properties: {
      ...defaultForm.properties,
      ...props,
    },
  };
};

function renderPrepareLetterPage(
  form = defaultForm,
  submission = defaultSubmission,
  translations = DEFAULT_TRANSLATIONS,
) {
  render(
    <MemoryRouter>
      <AppConfigProvider enableFrontendLogger>
        <PrepareLetterPage form={form} submission={submission} translations={translations} formUrl="/" />
      </AppConfigProvider>
    </MemoryRouter>,
  );
}

describe("PrepareLetterPage", () => {
  beforeEach(() => {
    fetchMock.mockImplementation((url) => {
      url = url as string;
      if (url.endsWith("/mottaksadresser")) {
        return Promise.resolve(new Response(JSON.stringify([]), RESPONSE_HEADERS));
      }
      if (url.endsWith("/api/foersteside")) {
        return Promise.resolve(new Response(JSON.stringify(forstesideMock), RESPONSE_HEADERS));
      }
      if (url.endsWith("/api/enhetsliste")) {
        return Promise.resolve(new Response(JSON.stringify(mockEnhetsListe), RESPONSE_HEADERS));
      }

      console.error(`Manglende testoppsett: Ukjent url ${url}`);
      return Promise.reject<Response>();
    });
  });

  afterEach(() => {
    fetchMock.mockClear();
  });

  describe("Førsteside-knapp", () => {
    let pdfDownloads: any[] = [];
    beforeEach(() => {
      pdfDownloads = [];

      // @ts-ignore
      pdf.lastNedFilBase64.mockImplementation((base64, tittel, filtype) => {
        pdfDownloads.push({ base64, tittel, filtype });
      });
    });

    it("Laster ned pdf for førsteside", async () => {
      renderPrepareLetterPage();

      await userEvent.click(screen.getByRole("button", { name: "Last ned førsteside" }));
      await waitFor(() => expect(pdf.lastNedFilBase64).toHaveBeenCalledTimes(1));
      expect(pdfDownloads).toHaveLength(1);
      expect(pdfDownloads[0].tittel).toBe("Førstesideark");
      expect(pdfDownloads[0].filtype).toBe("pdf");
    });

    it("Laster ikke ned pdf dersom enhet ikke er valgt, og viser feilmelding i stedet", async () => {
      const form = formWithProperties({
        enhetMaVelgesVedPapirInnsending: true,
      });
      renderPrepareLetterPage(form);

      await userEvent.click(await screen.findByRole("button", { name: "Last ned førsteside" }));
      expect(await screen.findByText(TEXTS.statiske.prepareLetterPage.entityNotSelectedError)).toBeInTheDocument();
      expect(pdfDownloads).toHaveLength(0);
    });
  });

  describe("When form property 'enhetMaVelgesVedPapirInnsending' is false", () => {
    it("does not fetch EnhetsListe", () => {
      expect(fetchMock).not.toHaveBeenCalledWith("/api/enhetsliste");
    });
  });

  describe("When form property 'enhetMaVelgesVedPapirInnsending' is true", () => {
    const DOWN_ARROW = { keyCode: 40 };
    const enhetstyper = ["ALS", "ARK", "LOKAL"];

    describe("When form property 'enhetstyper' is provided", () => {
      beforeEach(async () => {
        renderPrepareLetterPage(formWithProperties({ enhetMaVelgesVedPapirInnsending: true, enhetstyper }));
        await waitFor(() => expect(fetchMock).toHaveBeenCalled());
      });

      it("fetches Enhetsliste", () => {
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith("/api/enhetsliste");
      });

      it("EnhetSelector only lists Enhet if their type is present in 'enhetstyper'", () => {
        const enhetSelector = screen.getByText(TEXTS.statiske.prepareLetterPage.selectEntityDefault);
        fireEvent.keyDown(enhetSelector, DOWN_ARROW);

        const options = screen.getAllByText(/^NAV-ENHET/).map((element) => element.textContent);
        expect(options).toHaveLength(3);
        expect(options).toEqual(["NAV-ENHET ALS", "NAV-ENHET ARK", "NAV-ENHET LOKAL"]);
      });
    });

    describe("When fetched enhetstype-list does not include any matching form property 'enhetstyper'", () => {
      const SKJEMANUMMER = "NAV 12.34-56";

      beforeEach(async () => {
        fetchMock.mockImplementation((url) => {
          url = url as string;
          if (url.endsWith("/api/enhetsliste")) {
            return Promise.resolve(new Response(JSON.stringify(mockEnhetsListe), RESPONSE_HEADERS));
          }
          if (url.endsWith("/api/log/error")) {
            return Promise.resolve(new Response("OK", RESPONSE_HEADERS_PLAIN_TEXT));
          }
          console.error(`Manglende testoppsett: Ukjent url ${url}`);
          return Promise.reject<Response>();
        });
        renderPrepareLetterPage(
          formWithProperties({
            enhetMaVelgesVedPapirInnsending: true,
            enhetstyper: ["GAMMEL_TYPE"],
            skjemanummer: SKJEMANUMMER,
          }),
        );
        await waitFor(() => expect(fetchMock).toHaveBeenCalled());
      });

      it("defaults to rendering complete enhetsliste", () => {
        expect(fetchMock.mock.calls[0][0]).toBe("/api/enhetsliste");

        const enhetSelector = screen.getByText(TEXTS.statiske.prepareLetterPage.selectEntityDefault);
        fireEvent.keyDown(enhetSelector, DOWN_ARROW);

        const enhetSelectList = screen.queryAllByText(/^NAV-ENHET/);
        expect(enhetSelectList).toHaveLength(6);
      });

      it("fetch error message is not rendered", () => {
        const errorMessage = screen.queryByText(TEXTS.statiske.prepareLetterPage.entityFetchError);
        expect(errorMessage).not.toBeInTheDocument();
      });

      it("reports error to backend", async () => {
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
        expect(fetchMock.mock.calls[1][0]).toBe("/api/log/error");
        const request = {
          path: fetchMock.mock.calls[1][0],
          // @ts-ignore
          body: JSON.parse(fetchMock.mock.calls[1][1].body),
        };
        expect(request.path).toBe("/api/log/error");
        expect(request.body.message).toBe("Ingen relevante enheter funnet");
        expect(request.body.metadata.skjemanummer).toEqual(SKJEMANUMMER);
      });
    });

    describe("When fetching of enhetsliste fails", () => {
      beforeEach(async () => {
        fetchMock.mockImplementation((url) => {
          url = url as string;
          if (url.endsWith("/api/enhetsliste")) {
            return Promise.resolve(new Response(JSON.stringify({}), RESPONSE_HEADERS_ERROR));
          }
          console.error(`Manglende testoppsett: Ukjent url ${url}`);
          return Promise.reject<Response>();
        });
        renderPrepareLetterPage(formWithProperties({ enhetMaVelgesVedPapirInnsending: true, enhetstyper }));
        await waitFor(() => expect(fetchMock).toHaveBeenCalled());
      });

      it("select list is not renderes", () => {
        const enhetSelectList = screen.queryAllByText(/^NAV-ENHET/);
        expect(enhetSelectList).toHaveLength(0);
      });

      it("fetch error message is rendered", () => {
        const errorMessage = screen.getByText(TEXTS.statiske.prepareLetterPage.entityFetchError);
        expect(errorMessage).toBeInTheDocument();
      });
    });

    it.each([[], undefined])(
      "renders EnhetSelector with all supported Enhet items, when 'enhetstyper' is empty/undefined",
      async (enhetstyper) => {
        renderPrepareLetterPage(formWithProperties({ enhetMaVelgesVedPapirInnsending: true, enhetstyper }));
        await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/enhetsliste"));

        const enhetSelector = screen.getByText(TEXTS.statiske.prepareLetterPage.selectEntityDefault);
        expect(enhetSelector).toBeDefined();
        fireEvent.keyDown(enhetSelector, DOWN_ARROW);

        const enhetSelectList = screen.getAllByText(/^NAV-ENHET/);
        expect(enhetSelectList).toHaveLength(6);
      },
    );
  });
});
