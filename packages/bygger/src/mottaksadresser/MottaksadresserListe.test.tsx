import { Mottaksadresse } from "@navikt/skjemadigitalisering-shared-domain";
import { render, screen, waitFor, waitForElementToBeRemoved, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Formiojs from "formiojs/Formio";
import fetchMock from "jest-fetch-mock";
import React from "react";
import MottaksadresserListe from "./MottaksadresserListe";
import mockMottaksadresseForm from "./testdata/mottaksadresse-form";
import mockMottaksadresser from "./testdata/mottaksadresser";

const FORMIO_PROJECT_URL = "http://unittest.nav.no/formio";

const RESPONSE_HEADERS = {
  headers: {
    "content-type": "application/json",
  },
};

const SUBMISSION_PUT_REGEX = /http:\/\/.*\/mottaksadresse\/submission\/(.*)$/;

describe("MottaksadresseListe", () => {
  beforeAll(() => {
    Formiojs.setProjectUrl(FORMIO_PROJECT_URL);
  });

  let savedMottaksadresseRequests: Mottaksadresse[] = [];
  let deletedMottaksadresseIds: string[] = [];

  beforeEach(() => {
    savedMottaksadresseRequests = [];
    deletedMottaksadresseIds = [];
    fetchMock.mockImplementation((urlParam, options) => {
      const url = urlParam as string;
      if (url === `${FORMIO_PROJECT_URL}/mottaksadresse/submission`) {
        if (options?.method === "GET") {
          return Promise.resolve(new Response(JSON.stringify(mockMottaksadresser), RESPONSE_HEADERS));
        }
        if (options?.method === "POST") {
          savedMottaksadresseRequests.push(JSON.parse(options?.body as string) as Mottaksadresse);
          return Promise.resolve(new Response(JSON.stringify({}), RESPONSE_HEADERS));
        }
      }
      if (SUBMISSION_PUT_REGEX.test(url)) {
        if (options?.method === "PUT") {
          savedMottaksadresseRequests.push(JSON.parse(options?.body as string) as Mottaksadresse);
          return Promise.resolve(new Response(JSON.stringify([]), RESPONSE_HEADERS));
        }
        if (options?.method === "DELETE") {
          const id = SUBMISSION_PUT_REGEX.exec(url)?.[1];
          if (!id) {
            return Promise.reject(new Error("Mangler mottaksadresse-id ved DELETE"));
          }
          deletedMottaksadresseIds.push(id);
          return Promise.resolve(new Response(JSON.stringify([]), RESPONSE_HEADERS));
        }
      }
      if (url === `${FORMIO_PROJECT_URL}/mottaksadresse`) {
        return Promise.resolve(new Response(JSON.stringify(mockMottaksadresseForm), RESPONSE_HEADERS));
      }
      if (url.includes("/form?type=form&tags=nav-skjema&limit=1000&properties.mottaksadresseId=")) {
        return Promise.resolve(new Response(JSON.stringify([]), RESPONSE_HEADERS));
      }
      fail(`Manglende testoppsett: Ukjent url ${url}, options = ${JSON.stringify(options)}`);
    });
  });

  const renderMottaksadresseListe = async () => {
    render(<MottaksadresserListe />);
    await waitForElementToBeRemoved(() => screen.queryByText("Laster mottaksadresser..."));
  };

  it("Rendrer alle mottaksadresser", async () => {
    await renderMottaksadresseListe();
    mockMottaksadresser.forEach((adresse) => {
      expect(screen.queryByRole("heading", { name: adresse.data.adresselinje1 })).toBeTruthy();
    });
  });

  it("Lagrer endring av postnummer", async () => {
    await renderMottaksadresseListe();
    const adresse = mockMottaksadresser[1];
    const panel = screen.getByTestId(`mottaksadressepanel-${adresse._id}`);
    const endreKnapp = await within(panel).getByRole("button", { name: "Endre" });
    expect(endreKnapp).toBeTruthy();
    userEvent.click(endreKnapp);

    const postnummerInput = await screen.findByLabelText("Postnummer");
    expect(postnummerInput).toBeTruthy();
    userEvent.clear(postnummerInput);
    userEvent.type(postnummerInput, "1234");

    userEvent.click(await within(panel).findByRole("button", { name: "Lagre" }));

    await waitFor(() => expect(savedMottaksadresseRequests).toHaveLength(1));

    expect(savedMottaksadresseRequests).toHaveLength(1);
    expect(savedMottaksadresseRequests[0].data.postnummer).toEqual("1234");
    expect(await within(panel).findByRole("button", { name: "Endre" })).toBeTruthy();
  });

  it("Lagrer ny mottaksadresse", async () => {
    await renderMottaksadresseListe();
    const leggTilNyKnapp = screen.getByRole("button", { name: "Legg til ny" });
    expect(leggTilNyKnapp).toBeTruthy();
    userEvent.click(leggTilNyKnapp);

    const panel = await screen.findByTestId("mottaksadressepanel-new");

    userEvent.type(screen.getByLabelText("Adresselinje1"), "TEST skanning");
    userEvent.type(screen.getByLabelText("Adresselinje2"), "Postboks 3");
    userEvent.type(screen.getByLabelText("Postnummer"), "1500");
    userEvent.type(screen.getByLabelText("Poststed"), "Dalen");

    userEvent.click(await within(panel).findByRole("button", { name: "Lagre" }));

    await waitFor(() => expect(savedMottaksadresseRequests).toHaveLength(1));
    expect(savedMottaksadresseRequests[0].data.adresselinje1).toEqual("TEST skanning");
    expect(savedMottaksadresseRequests[0].data.adresselinje2).toEqual("Postboks 3");
    expect(savedMottaksadresseRequests[0].data.postnummer).toEqual("1500");
    expect(savedMottaksadresseRequests[0].data.poststed).toEqual("Dalen");
  });

  it("Lagrer ikke ny mottaksadresse når poststed ikke er oppgitt", async () => {
    await renderMottaksadresseListe();
    userEvent.click(screen.getByRole("button", { name: "Legg til ny" }));

    const panel = await screen.findByTestId("mottaksadressepanel-new");

    userEvent.type(screen.getByLabelText("Adresselinje1"), "TEST skanning");
    userEvent.type(screen.getByLabelText("Adresselinje2"), "Postboks 3");
    userEvent.type(screen.getByLabelText("Postnummer"), "1500");

    // Ignore console.log from formio that logs the components when error.
    jest.spyOn(console, "log").mockImplementation(() => {});
    userEvent.click(await within(panel).findByRole("button", { name: "Lagre" }));
    expect(await screen.findByText("Du må fylle ut: Poststed")).toBeTruthy();
    jest.restoreAllMocks();

    expect(savedMottaksadresseRequests).toHaveLength(0);
  });

  it("Avbryter endring av mottaksadresser", async () => {
    await renderMottaksadresseListe();
    const adresse = mockMottaksadresser[1];
    const panel = screen.getByTestId(`mottaksadressepanel-${adresse._id}`);
    userEvent.click(await within(panel).getByRole("button", { name: "Endre" }));

    const adresselinje1Input = await screen.findByLabelText("Adresselinje1");
    expect(adresselinje1Input).toBeTruthy();
    userEvent.clear(adresselinje1Input);
    userEvent.type(adresselinje1Input, "Skogen");
    userEvent.click(await within(panel).findByRole("button", { name: "Avbryt" }));

    expect(await within(panel).findByRole("button", { name: "Endre" })).toBeTruthy();
    expect(await within(panel).findByRole("heading", { name: adresse.data.adresselinje1 })).toBeTruthy();
    expect(savedMottaksadresseRequests).toHaveLength(0);
  });

  it("Sletter mottaksadresse", async () => {
    await renderMottaksadresseListe();
    const adresse = mockMottaksadresser[0];
    const panel = screen.getByTestId(`mottaksadressepanel-${adresse._id}`);
    userEvent.click(await within(panel).findByRole("button", { name: "Endre" }));

    const slettKnapp = await within(panel).findByRole("button", { name: "Slett" });
    userEvent.click(slettKnapp);

    await waitFor(() => expect(deletedMottaksadresseIds).toHaveLength(1));
    expect(deletedMottaksadresseIds.includes(adresse._id)).toBe(true);
  });
});
