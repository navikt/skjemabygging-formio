import { AppConfigProvider } from "@navikt/skjemadigitalisering-shared-components";
import { NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import mockMottaksadresser from "../../example_data/mottaksadresser.json";
import featureToggles from "../../test/featureToggles";
import FeedbackProvider from "../context/notifications/FeedbackContext";
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
      const stringUrl = url as string;
      if (stringUrl.endsWith("/mottaksadresse/submission")) {
        return Promise.resolve(new Response(JSON.stringify(mockMottaksadresser), RESPONSE_HEADERS));
      }
      if (stringUrl.endsWith("/temakoder")) {
        return Promise.resolve(new Response(JSON.stringify(mockTemaKoder), RESPONSE_HEADERS));
      }
      throw new Error(`Manglende testoppsett: Ukjent url ${url}`);
    });
  });
  it("should create a new form with correct path, title and name", async () => {
    const saveForm = vi.fn(() => Promise.resolve(new Response(JSON.stringify({}))));
    render(
      <MemoryRouter>
        <AppConfigProvider featureToggles={featureToggles}>
          <NewFormPage formio={{ saveForm }} />
        </AppConfigProvider>
      </MemoryRouter>,
    );
    await waitFor(() => screen.getByText("Opprett nytt skjema"));

    await userEvent.type(screen.getByLabelText("Skjemanummer"), "NAV 10-20.30 ");
    await userEvent.type(screen.getByLabelText("Tittel"), "Et testskjema");
    await userEvent.selectOptions(screen.getByLabelText("Tema"), "ABC");
    await userEvent.click(screen.getByRole("button", { name: "Opprett" }));

    expect(saveForm).toHaveBeenCalledTimes(1);
    // @ts-ignore
    const savedForm = saveForm.mock.calls[0][0] as NavFormType;
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
      },
    });
  });
  it("should handle exception from saveForm, with message to user", async () => {
    const saveForm = vi.fn(() => Promise.reject(new Error("Form.io feil")));
    console.error = vi.fn();
    render(
      <FeedbackProvider>
        <MemoryRouter>
          <AppConfigProvider featureToggles={featureToggles}>
            <NewFormPage formio={{ saveForm }} />
          </AppConfigProvider>
        </MemoryRouter>
      </FeedbackProvider>,
    );
    await screen.findByText("Opprett nytt skjema");

    await userEvent.type(screen.getByLabelText("Skjemanummer"), "NAV 10-20.30 ");
    await userEvent.type(screen.getByLabelText("Tittel"), "Et testskjema");
    await userEvent.selectOptions(screen.getByLabelText("Tema"), "ABC");
    await userEvent.click(screen.getByRole("button", { name: "Opprett" }));

    expect(saveForm).toHaveBeenCalledTimes(1);

    await waitFor(() => expect(console.error).toHaveBeenCalledTimes(1));

    expect(await screen.findByText("Det valgte skjema-nummeret er allerede i bruk.")).toBeInTheDocument();
  });
});