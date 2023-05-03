import { AppConfigProvider } from "@navikt/skjemadigitalisering-shared-components";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import fetchMock from "jest-fetch-mock";
import { MemoryRouter } from "react-router-dom";
import featureToggles from "../../test/featureToggles";
import FeedbackProvider from "../context/notifications/FeedbackContext";
import mockMottaksadresser from "../mottaksadresser/testdata/mottaksadresser";
import NewFormPage from "./NewFormPage";

const RESPONSE_HEADERS = {
  headers: {
    "content-type": "application/json",
  },
};

const mockTemaKoder = { ABC: "Tema 1", XYZ: "Tema 3", DEF: "Tema 2" };

describe("NewFormPage", () => {
  beforeEach(() => {
    fetchMock.mockImplementation((url) => {
      if (url.endsWith("/mottaksadresse/submission")) {
        return Promise.resolve(new Response(JSON.stringify(mockMottaksadresser), RESPONSE_HEADERS));
      }
      if (url.endsWith("/temakoder")) {
        return Promise.resolve(new Response(JSON.stringify(mockTemaKoder), RESPONSE_HEADERS));
      }
      throw new Error(`Manglende testoppsett: Ukjent url ${url}`);
    });
  });
  it("should create a new form with correct path, title and name", async () => {
    const saveForm = jest.fn(() => Promise.resolve(new Response(JSON.stringify({}))));
    const onLogout = jest.fn();
    render(
      <MemoryRouter>
        <AppConfigProvider featureToggles={featureToggles}>
          <NewFormPage formio={{ saveForm }} onLogout={onLogout} />
        </AppConfigProvider>
      </MemoryRouter>
    );
    await waitFor(() => screen.getByText("Opprett nytt skjema"));

    userEvent.type(screen.getByLabelText("Skjemanummer"), "NAV 10-20.30 ");
    userEvent.type(screen.getByLabelText("Tittel"), "Et testskjema");
    userEvent.selectOptions(screen.getByLabelText("Tema"), "ABC");
    userEvent.selectOptions(screen.getByLabelText("Ettersending"), "KUN_DIGITAL");
    userEvent.click(screen.getByRole("button", { name: "Opprett" }));

    expect(saveForm).toHaveBeenCalledTimes(1);
    const savedForm = saveForm.mock.calls[0][0];
    expect(savedForm).toMatchObject({
      type: "form",
      path: "nav102030",
      display: "wizard",
      name: "nav102030",
      title: "Et testskjema",
      tags: ["nav-skjema", ""],
      properties: {
        skjemanummer: "NAV 10-20.30",
        tema: "ABC",
        innsending: "PAPIR_OG_DIGITAL",
        ettersending: "KUN_DIGITAL",
      },
    });
  });
  it("should handle exception from saveForm, with message to user", async () => {
    const saveForm = jest.fn(() => Promise.reject(new Error("Form.io feil")));
    const onLogout = jest.fn();
    console.error = jest.fn();
    render(
      <FeedbackProvider>
        <MemoryRouter>
          <AppConfigProvider featureToggles={featureToggles}>
            <NewFormPage formio={{ saveForm }} onLogout={onLogout} />
          </AppConfigProvider>
        </MemoryRouter>
      </FeedbackProvider>
    );
    await screen.findByText("Opprett nytt skjema");

    userEvent.type(screen.getByLabelText("Skjemanummer"), "NAV 10-20.30 ");
    userEvent.type(screen.getByLabelText("Tittel"), "Et testskjema");
    userEvent.selectOptions(screen.getByLabelText("Tema"), "ABC");
    userEvent.click(screen.getByRole("button", { name: "Opprett" }));

    expect(saveForm).toHaveBeenCalledTimes(1);

    await waitFor(() => expect(console.error).toHaveBeenCalledTimes(1));

    expect(await screen.findByText("Det valgte skjema-nummeret er allerede i bruk.")).toBeInTheDocument();
  });
});
