import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { render, screen, waitFor } from "@testing-library/react";
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
const mockEnhetsListe = [
  { enhet: { enhetId: 1, navn: "NAV abc", type: "ARK" } },
  { enhet: { enhetId: 2, navn: "NAV def", type: "ARK" } },
  { enhet: { enhetId: 3, navn: "NAV ghi", type: "ARK" } },
  { enhet: { enhetId: 4, navn: "NAV jkl", type: "ARK" } },
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

describe("PrepareLetterPage", () => {
  describe("Førsteside-knapp", () => {
    let pdfDownloads = [];
    beforeEach(() => {
      pdfDownloads = [];
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
      pdf.lastNedFilBase64.mockImplementation((base64, tittel, filtype) => {
        pdfDownloads.push({ base64, tittel, filtype });
      });
    });

    it("Laster ned pdf for førsteside", async () => {
      render(
        <MemoryRouter>
          <PrepareLetterPage form={defaultForm} submission={defaultSubmission} translations={DEFAULT_TRANSLATIONS} />
        </MemoryRouter>
      );

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
      render(
        <MemoryRouter>
          <PrepareLetterPage form={form} submission={defaultSubmission} translations={DEFAULT_TRANSLATIONS} />
        </MemoryRouter>
      );

      userEvent.click(await screen.findByRole("button", { name: "Last ned førsteside" }));
      expect(await screen.findByText(TEXTS.statiske.prepareLetterPage.entityNotSelectedError));
      expect(pdfDownloads).toHaveLength(0);
    });
  });
});
