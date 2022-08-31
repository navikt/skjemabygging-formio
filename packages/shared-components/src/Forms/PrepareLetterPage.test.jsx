import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import fetchMock from "jest-fetch-mock";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import pdf from "../util/pdf";
import { PrepareLetterPage } from "./PrepareLetterPage";
import forstesideMock from "./testdata/forsteside-mock";

jest.mock("../context/languages", () => ({
  useLanguages: () => ({ translate: (text) => text }),
}));

jest.mock("../util/pdf");

const DEFAULT_TRANSLATIONS = {};
const RESPONSE_HEADERS = {
  headers: {
    "content-type": "application/json",
  },
};

const enhetWithUnsupportedEnhetNr = {
  enhetId: 0,
  navn: "NAV-ENHET Ekskluderes pga enhetNr",
  type: "KO",
  enhetNr: "0000",
};
const enhetWithUnsupportedEnhetstype = {
  enhetId: 1000,
  navn: "NAV-ENHET Ekskluderes pga type",
  type: "IKKE_STOTTET_ENHETSTYPE",
  enhetNr: "1000",
};
const mockEnhetsListe = [
  { enhetId: 1, navn: "NAV-ENHET YTA", type: "YTA", enhetNr: "001" },
  { enhetId: 2, navn: "NAV-ENHET LOKAL", type: "LOKAL", enhetNr: "002" },
  { enhetId: 3, navn: "NAV-ENHET ARK", type: "ARK", enhetNr: "003" },
  { enhetId: 4, navn: "NAV-ENHET FPY", type: "FPY", enhetNr: "004" },
  { enhetId: 5, navn: "NAV-ENHET INTRO", type: "INTRO", enhetNr: "005" },
  { enhetId: 6, navn: "NAV-ENHET FORVALTNING", type: "FORVALTNING", enhetNr: "006" },
  { enhetId: 7, navn: "NAV-ENHET ALS", type: "ALS", enhetNr: "007" },
  enhetWithUnsupportedEnhetNr,
  enhetWithUnsupportedEnhetstype,
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
          inputType: "text",
          input: true,
        },
      ],
    },
  ],
  properties: {},
};
const defaultSubmission = {
  data: {
    fornavn: "Mie",
  },
};
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
  translations = DEFAULT_TRANSLATIONS
) {
  render(
    <MemoryRouter>
      <PrepareLetterPage form={form} submission={submission} translations={translations} />
    </MemoryRouter>
  );
}

describe("PrepareLetterPage", () => {
  beforeEach(() => {
    fetchMock.mockImplementation((url) => {
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
    });
  });

  afterEach(() => {
    fetchMock.mockClear();
  });

  describe("Førsteside-knapp", () => {
    let pdfDownloads = [];
    beforeEach(() => {
      pdfDownloads = [];

      pdf.lastNedFilBase64.mockImplementation((base64, tittel, filtype) => {
        pdfDownloads.push({ base64, tittel, filtype });
      });
    });

    it("Laster ned pdf for førsteside", async () => {
      renderPrepareLetterPage();

      userEvent.click(screen.getByRole("button", { name: "Last ned førsteside" }));
      await waitFor(() => expect(pdf.lastNedFilBase64).toHaveBeenCalledTimes(1));
      expect(pdfDownloads).toHaveLength(1);
      expect(pdfDownloads[0].tittel).toEqual("Førstesideark");
      expect(pdfDownloads[0].filtype).toEqual("pdf");
    });

    it("Laster ikke ned pdf dersom enhet ikke er valgt, og viser feilmelding i stedet", async () => {
      const form = formWithProperties({
        enhetMaVelgesVedPapirInnsending: true,
      });
      renderPrepareLetterPage(form);

      userEvent.click(await screen.findByRole("button", { name: "Last ned førsteside" }));
      expect(await screen.findByText(TEXTS.statiske.prepareLetterPage.entityNotSelectedError));
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
        expect(options).toEqual(["NAV-ENHET ALS", "NAV-ENHET ARK", "NAV-ENHET LOKAL"]);
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
        expect(screen.queryByText(enhetWithUnsupportedEnhetNr.navn)).toBeNull();
        expect(screen.queryByText(enhetWithUnsupportedEnhetstype.navn)).toBeNull();
      }
    );
  });
});
