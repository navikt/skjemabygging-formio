import { NavFormioJs } from "@navikt/skjemadigitalisering-shared-components";
import { render, screen, waitFor, waitForElementToBeRemoved, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import mockMottaksadresser from "../../example_data/mottaksadresser.json";
import createMockImplementation, { DEFAULT_PROJECT_URL } from "../../test/backendMockImplementation";
import MottaksadresserListe from "./MottaksadresserListe";

describe("MottaksadresseListe", () => {
  let windowSpy, formioSpy, globalFetchSpy;

  beforeAll(() => {
    NavFormioJs.Formio.setProjectUrl(DEFAULT_PROJECT_URL);
    windowSpy = vi.spyOn(window, "scrollTo");
    formioSpy = vi.spyOn(NavFormioJs.Formio, "fetch");
    formioSpy.mockImplementation(createMockImplementation());
    globalFetchSpy = vi.spyOn(global, "fetch");
    globalFetchSpy.mockImplementation(createMockImplementation());
  });

  afterAll(() => {
    windowSpy.mockRestore();
  });

  afterEach(() => {
    formioSpy.mockClear();
    globalFetchSpy.mockClear();
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
    const adresse = mockMottaksadresser[0];
    const panel = screen.getByTestId(`mottaksadressepanel-${adresse._id}`);
    const endreKnapp = await within(panel).getByRole("button", { name: "Endre" });
    expect(endreKnapp).toBeTruthy();
    await userEvent.click(endreKnapp);

    const postnummerInput = await screen.findByLabelText("Postnummer");
    expect(postnummerInput).toBeTruthy();
    await userEvent.clear(postnummerInput);
    await userEvent.type(postnummerInput, "1234");

    const saveButton = await within(panel).findByRole("button", { name: "Lagre" });
    await waitFor(() => userEvent.click(saveButton));

    expect(formioSpy).toHaveBeenCalledTimes(2);
    expect(formioSpy).toHaveBeenNthCalledWith(
      2,
      `${DEFAULT_PROJECT_URL}/mottaksadresse/submission/${adresse._id}`,
      expect.objectContaining({ method: "PUT" }),
    );

    expect(await within(panel).findByRole("button", { name: "Endre" })).toBeTruthy();
  });

  it.skip("Lagrer ny mottaksadresse", async () => {
    await renderMottaksadresseListe();
    const leggTilNyKnapp = screen.getByRole("button", { name: "Legg til ny" });
    expect(leggTilNyKnapp).toBeTruthy();
    await userEvent.click(leggTilNyKnapp);

    const panel = await screen.findByTestId("mottaksadressepanel-new");

    await userEvent.type(screen.getByLabelText("Adresselinje1"), "TEST skanning");
    await userEvent.type(screen.getByLabelText("Adresselinje2"), "Postboks 3");
    await userEvent.type(screen.getByLabelText("Postnummer"), "1500");
    await userEvent.type(screen.getByLabelText("Poststed"), "Dalen");

    const saveButton = await within(panel).findByRole("button", { name: "Lagre" });
    await waitFor(() => userEvent.click(saveButton));

    expect(formioSpy).toHaveBeenCalledTimes(2);
    expect(formioSpy).toHaveBeenNthCalledWith(
      2,
      `${DEFAULT_PROJECT_URL}/mottaksadresse/submission`,
      expect.objectContaining({ method: "POST" }),
    );

    const data = JSON.parse(formioSpy.mock.calls[1][1].body).data;
    expect(data.adresselinje1).toEqual("TEST skanning");
    expect(data.adresselinje2).toEqual("Postboks 3");
    expect(data.postnummer).toEqual("1500");
    expect(data.poststed).toEqual("Dalen");
  });

  it.skip("Lagrer ikke ny mottaksadresse når poststed ikke er oppgitt", async () => {
    await renderMottaksadresseListe();
    await userEvent.click(screen.getByRole("button", { name: "Legg til ny" }));

    const panel = await screen.findByTestId("mottaksadressepanel-new");

    await userEvent.type(screen.getByLabelText("Adresselinje1"), "TEST skanning");
    await userEvent.type(screen.getByLabelText("Adresselinje2"), "Postboks 3");
    await userEvent.type(screen.getByLabelText("Postnummer"), "1500");

    // Ignore console.log from formio that logs the components when error.
    vi.spyOn(console, "log").mockImplementation(() => {});
    await userEvent.click(await within(panel).findByRole("button", { name: "Lagre" }));
    expect(await screen.findByText("Du må fylle ut: Poststed")).toBeTruthy();
  });

  it("Avbryter endring av mottaksadresser", async () => {
    await renderMottaksadresseListe();
    const adresse = mockMottaksadresser[1];
    const panel = screen.getByTestId(`mottaksadressepanel-${adresse._id}`);
    await userEvent.click(await within(panel).getByRole("button", { name: "Endre" }));

    const adresselinje1Input = await screen.findByLabelText("Adresselinje1");
    expect(adresselinje1Input).toBeTruthy();
    await userEvent.clear(adresselinje1Input);
    await userEvent.type(adresselinje1Input, "Skogen");
    await userEvent.click(await within(panel).findByRole("button", { name: "Avbryt" }));

    expect(await within(panel).findByRole("button", { name: "Endre" })).toBeTruthy();
    expect(await within(panel).findByRole("heading", { name: adresse.data.adresselinje1 })).toBeTruthy();
  });

  it("Sletter mottaksadresse", async () => {
    await renderMottaksadresseListe();
    const adresse = mockMottaksadresser[2];
    const panel = screen.getByTestId(`mottaksadressepanel-${adresse._id}`);
    await userEvent.click(await within(panel).findByRole("button", { name: "Endre" }));

    const slettKnapp = await within(panel).findByRole("button", { name: "Slett" });
    await waitFor(() => userEvent.click(slettKnapp));

    expect(globalFetchSpy).toHaveBeenCalledTimes(4);
    expect(globalFetchSpy).toHaveBeenNthCalledWith(
      3,
      `${DEFAULT_PROJECT_URL}/mottaksadresse/submission/${adresse._id}`,
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
