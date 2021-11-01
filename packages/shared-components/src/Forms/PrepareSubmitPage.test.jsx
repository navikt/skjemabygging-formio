import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppConfigProvider } from "../configContext";
import { computeDokumentinnsendingURL, PrepareSubmitPage } from "./PrepareSubmitPage";
import { LanguagesProvider } from "../context/languages";

test("Gå videre (til dokumentinnsending) er ikke tillatt før brukeren har krysset av på at de har lest instruksjonene", () => {
  // we had to provide previousPage in state since all navigations to this page sets that value
  render(
    <AppConfigProvider>
      <MemoryRouter initialEntries={[{ state: { previousPage: "/blask-blask" } }]}>
        <LanguagesProvider translations={[]}>
          <PrepareSubmitPage
            form={{ title: "Test form", properties: { skjemanummer: "NAV 76-07.10" } }}
            submission={{}}
          />
        </LanguagesProvider>
      </MemoryRouter>
    </AppConfigProvider>
  );
  const harLestVilkaarInput = screen.getByLabelText("Jeg har lest instruksjonene.");
  expect(harLestVilkaarInput).not.toBeChecked();
  const mustConfirmUserHasReadInstructionsWarningBeforeConfirmation = screen.getByText(
    "Du må bekrefte at du har lest instruksjonene over før du kan gå videre."
  );
  expect(mustConfirmUserHasReadInstructionsWarningBeforeConfirmation).toBeDefined();
  harLestVilkaarInput.click();
  const mustConfirmUserHasReadInstructionsWarningAfterConfirmation = screen.queryAllByText(
    "Du må bekrefte at du har lest instruksjonene over før du kan gå videre."
  );
  expect(mustConfirmUserHasReadInstructionsWarningAfterConfirmation).toHaveLength(0);
  const nextButton = screen.getByRole("link", { name: "Gå videre" });
  harLestVilkaarInput.click(); // Remove confirmation
  nextButton.click(); // Try to progress
  const mustConfirmUserHasReadInstructionsWarningAfterConfirmationIsRemoved = screen.getByText(
    "Du må bekrefte at du har lest instruksjonene over før du kan gå videre."
  );
  expect(mustConfirmUserHasReadInstructionsWarningAfterConfirmationIsRemoved).toBeDefined();
});

describe("computeDokumentinnsendingURL", () => {
  it("calculate url with vedlegg", () => {
    const url = computeDokumentinnsendingURL(
      "https://example.org",
      {
        components: [
          { key: "vedleggO9", properties: { vedleggskode: "O9" } },
          { key: "vedleggQ1", properties: { vedleggskode: "Q1" } },
          { key: "vedleggF4", properties: { vedleggskode: "F4" } },
        ],
        properties: { skjemanummer: "NAV 76-07.10" },
      },
      { vedleggO9: "leggerVedNaa", vedleggQ1: "leggerVedNaa", vedleggF4: "leggerVedNaa" }
    );
    expect(url).toEqual(
      "https://example.org/opprettSoknadResource?skjemanummer=NAV%2076-07.10&erEttersendelse=false&vedleggsIder=O9,Q1,F4"
    );
  });

  it("calculate url without vedlegg", () => {
    const url = computeDokumentinnsendingURL(
      "https://example.org",
      { components: [], properties: { skjemanummer: "NAV 76-07.10" } },
      {}
    );
    expect(url).toEqual("https://example.org/opprettSoknadResource?skjemanummer=NAV%2076-07.10&erEttersendelse=false");
  });
});
