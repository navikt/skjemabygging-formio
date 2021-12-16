import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import FyllUtRouter from "./FyllUtRouter";
import { AppConfigProvider } from "../configContext";
import { form, translationsForNavForm } from "./testdata/skjema-med-oversettelser";
import { languagesInOriginalLanguage } from "../components/FyllUtLanguageSelector";
import {setupNavFormio} from "../../test/navform-render";

const mockFormPath = `/forms/${form.path}/view`;
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useRouteMatch: () => ({ path: mockFormPath }),
}));

const labelNorskBokmal = languagesInOriginalLanguage["nb-NO"];

describe("FyllUtRouter", () => {

  beforeAll(setupNavFormio);

  const renderFyllUtRouter = ({ form, translationsForNavForm }, enableTranslations = true) => {
    render(
      <AppConfigProvider featureToggles={{ enableTranslations }}>
        <MemoryRouter initialEntries={[{ pathname: mockFormPath }]}>
          <FyllUtRouter form={form} translations={translationsForNavForm} />
        </MemoryRouter>
      </AppConfigProvider>
    );
  };

  describe("Knapp for å velge språk", () => {
    it("Rendres ikke når feature toggle er false", () => {
      renderFyllUtRouter({ form, translationsForNavForm }, false);
      expect(screen.queryByRole("button", { name: labelNorskBokmal })).toBeNull();
    });

    it("Rendres når feature toggle er true", () => {
      renderFyllUtRouter({ form, translationsForNavForm }, true);
      expect(screen.queryByRole("button", { name: labelNorskBokmal })).not.toBeNull();
    });
  });

  describe("Endring av språk", () => {
    it("Skjema oversettes fra norsk til engelsk", async () => {
      const norskTittel = form.title;
      const engelskTittel = translationsForNavForm["en"][`${form.title}`];
      renderFyllUtRouter({ form, translationsForNavForm });

      expect(screen.queryByRole("heading", { name: norskTittel })).toBeTruthy();
      expect(screen.queryByRole("heading", { name: engelskTittel })).toBeNull();

      const velgSprakButton = screen.getByRole("button", { name: labelNorskBokmal });
      userEvent.click(velgSprakButton);

      const englishOption = screen.getByRole("link", { name: "English" });
      userEvent.click(englishOption);

      expect(await screen.findByRole("heading", { name: engelskTittel })).toBeTruthy();
      expect(screen.queryByRole("heading", { name: norskTittel })).toBeNull();

      // FIXME Vanskelig å teste formio-koden:
      // Av en eller annen grunn blir aldri instance.ready resolve't i testen (se NavForm linje 63),
      // og derfor får vi ikke satt language på formio-instansen (linje 127).
      // expect(screen.queryByText("Guidance")).toBeTruthy();
      // expect(screen.queryByText("Veiledning")).toBeNull();
    });
  });
});
