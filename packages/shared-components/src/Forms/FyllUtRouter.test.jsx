import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { setupNavFormio } from "../../test/navform-render";
import { languagesInOriginalLanguage } from "../components/FyllUtLanguageSelector";
import { AppConfigProvider } from "../configContext";
import FyllUtRouter from "./FyllUtRouter";
import { form, translationsForNavForm } from "./testdata/skjema-med-oversettelser";

const mockFormPath = `/${form.path}`;
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useRouteMatch: () => ({ path: mockFormPath }),
}));

const labelNorskBokmal = languagesInOriginalLanguage["nb-NO"];

describe("FyllUtRouter", () => {
  beforeAll(setupNavFormio);

  const renderFyllUtRouter = ({ form, translationsForNavForm }, appConfigProps) => {
    const config = {
      featureToggles: { enableTranslations: true },
      ...appConfigProps,
    };
    render(
      <AppConfigProvider {...config}>
        <MemoryRouter initialEntries={[{ pathname: mockFormPath }]}>
          <FyllUtRouter form={form} translations={translationsForNavForm} />
        </MemoryRouter>
      </AppConfigProvider>
    );
  };

  describe("Knapp for å velge språk", () => {
    it("Rendres ikke når feature toggle er false", () => {
      renderFyllUtRouter({ form, translationsForNavForm }, { featureToggles: { enableTranslations: false } });
      expect(screen.queryByRole("button", { name: labelNorskBokmal })).toBeNull();
    });

    it("Rendres når feature toggle er true", () => {
      renderFyllUtRouter({ form, translationsForNavForm }, { featureToggles: { enableTranslations: true } });
      expect(screen.queryByRole("button", { name: labelNorskBokmal })).not.toBeNull();
    });
  });

  describe("Endring av språk", () => {
    it("Skjema oversettes fra norsk til engelsk", async () => {
      const norskTittel = form.title;
      const engelskTittel = translationsForNavForm["en"][`${form.title}`];
      renderFyllUtRouter({ form, translationsForNavForm }, {});

      expect(screen.queryByRole("heading", { name: norskTittel })).toBeTruthy();
      expect(screen.queryByRole("heading", { name: engelskTittel })).toBeNull();

      const velgSprakButton = screen.getByRole("button", { name: labelNorskBokmal });
      userEvent.click(velgSprakButton);

      const englishOption = screen.getByRole("link", { name: "English" });
      userEvent.click(englishOption);

      expect(await screen.findByRole("heading", { name: engelskTittel })).toBeTruthy();
      expect(screen.queryByRole("heading", { name: norskTittel })).toBeNull();

      // FIXME Vanskelig å teste formio-koden:
      // Av en eller annen grunn blir aldri instance.ready resolve't i testen (se NavForm linje 72),
      // og derfor får vi ikke satt language på formio-instansen (linje 136).
      // await waitFor(() => expect(screen.queryByText("Guidance")).toBeTruthy());
      // expect(screen.queryByText("Veiledning")).toBeNull();
    });
  });

  describe("Submission method", () => {
    it("Renders vedleggspanel when submission method is undefined", () => {
      renderFyllUtRouter({ form, translationsForNavForm }, { submissionMethod: undefined });
      expect(screen.queryByRole("heading", { name: form.title })).toBeInTheDocument();
      screen.debug();
      expect(screen.queryByRole("button", { name: "Vedleggsliste" })).toBeInTheDocument();
    });
    it("Renders vedleggspanel when submission method is paper", () => {
      renderFyllUtRouter({ form, translationsForNavForm }, { submissionMethod: "paper" });
      expect(screen.queryByRole("heading", { name: form.title })).toBeTruthy();
      expect(screen.queryByRole("button", { name: "Vedleggsliste" })).toBeInTheDocument();
    });
    it("Does not render vedleggspanel when submission method is digital", () => {
      renderFyllUtRouter({ form, translationsForNavForm }, { submissionMethod: "digital" });
      expect(screen.queryByRole("heading", { name: form.title })).toBeTruthy();
      expect(screen.queryByRole("button", { name: "Vedleggsliste" })).not.toBeInTheDocument();
    });
  });
});
