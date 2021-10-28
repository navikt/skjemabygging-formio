import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
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
  it("not render languageSelecor when there is no selected language and no translations", () => {
    renderFyllUtLanguageSelector();
    expect(screen.queryByText("Norsk bokmål")).toBeNull();
  });

  it("render languageSelector with default label and nynorsk as option when there is no language selected and only with nynorsk translations ", () => {
    renderFyllUtLanguageSelector({ "nn-NO": { Etternavn: "Etternamn", Fornavn: "Fornamn" } });
    const languageSelector = screen.getByRole("button", { name: "Norsk bokmål" });
    expect(languageSelector).toBeDefined();
    userEvent.click(languageSelector);
    expect(screen.getByText("Norsk nynorsk")).toBeTruthy();
  });

  it("render languageSelector with Nynorsk as label and Bokmål as option when the selected language is nynorsk and there is only nynorsk translations ", () => {
    renderFyllUtLanguageSelector(
      { "nn-NO": { Etternavn: "Etternamn", Fornavn: "Fornamn" } },
      "/testForm/view?lang=nn-NO"
    );
    const languageSelector = screen.getByRole("button", { name: "Norsk nynorsk" });
    expect(languageSelector).toBeDefined();
    userEvent.click(languageSelector);
    expect(screen.getByText("Norsk bokmål")).toBeTruthy();
  });

  it("render languageSelector with Nynorsk as label and Bokmål as option when there are bokmål translations and nynorsk translations ", () => {
    renderFyllUtLanguageSelector(
      { "nn-NO": { Etternavn: "Etternamn", Fornavn: "Fornamn" } },
      "/testForm/view?lang=nn-NO"
    );
    const languageSelector = screen.getByRole("button", { name: "Norsk nynorsk" });
    expect(languageSelector).toBeDefined();
    userEvent.click(languageSelector);
    expect(screen.getByText("Norsk bokmål")).toBeTruthy();
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
