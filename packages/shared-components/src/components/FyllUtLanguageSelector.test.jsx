import { render, screen } from "@testing-library/react";
import { MemoryRouter, Router } from "react-router-dom";
import { LanguagesProvider } from "../context/languages";
import React from "react";
import FyllUtLanguageSelector from "./FyllUtLanguageSelector";
import userEvent from "@testing-library/user-event";

const renderFyllUtLanguageSelector = (translations = {}, path = "") => {
  render(
    <MemoryRouter initialEntries={[path]}>
      <LanguagesProvider translations={translations}>
        <FyllUtLanguageSelector />
      </LanguagesProvider>
    </MemoryRouter>
  );
};

describe("Test FyllUtLanguageSelector in FyllUtRouter", () => {
  it("not render languageSelecor when there is with no selected language and with no translations", () => {
    renderFyllUtLanguageSelector();
    expect(screen.queryByText("Norsk bokmål")).toBeNull();
  });
  it("render languageSelector with default label and nynorsk as option when there is with no language selected and only nynorsk translations ", () => {
    renderFyllUtLanguageSelector({ "nn-NO": { Etternavn: "Etternamn", Fornavn: "Fornamn" } });
    const languageSelector = screen.getByRole("button", { name: "Norsk bokmål" });
    expect(languageSelector).toBeDefined();
    userEvent.click(languageSelector);
    expect(screen.getByText("Norsk nynorsk")).toBeTruthy();
  });

  it("render languageSelector with Nynorsk as label and nynorsk as option when the selected language and only nynorsk translations ", () => {
    renderFyllUtLanguageSelector(
      { "nn-NO": { Etternavn: "Etternamn", Fornavn: "Fornamn" } },
      "/testForm/view?lang=nn-NO"
    );
    const languageSelector = screen.getByRole("button", { name: "Norsk nynorsk" });
    expect(languageSelector).toBeDefined();
  });

  it("render languageSelector with default label and nynorsk as option when the selected language has no translation send in", () => {
    renderFyllUtLanguageSelector({ "nn-NO": { Etternavn: "Etternamn", Fornavn: "Fornamn" } }, "/testForm/view?lang=cn");
    const languageSelector = screen.getByRole("button", { name: "Norsk bokmål" });
    expect(languageSelector).toBeDefined();
    userEvent.click(languageSelector);
    expect(screen.getByText("Norsk nynorsk")).toBeTruthy();
    expect(screen.queryByText("Chinese")).toBeNull();
  });
});
