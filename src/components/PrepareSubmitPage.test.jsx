import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AppConfigProvider } from "../configContext";
import { computeDokumentinnsendingURL, PrepareSubmitPage } from "./PrepareSubmitPage";

beforeEach(() => {
  Element.prototype.scrollIntoView = jest.fn();
});

afterEach(() => {
  Element.prototype.scrollIntoView = undefined;
});

test("Gå videre (til dokumentinnsending) er ikke tillatt før brukeren har krysset av på at de har lest instruksjonene", () => {
  render(
    <AppConfigProvider>
      <BrowserRouter>
        <PrepareSubmitPage
          form={{ title: "Test form", properties: { skjemanummer: "NAV 76-07.10" } }}
          submission={{}}
        />
      </BrowserRouter>
    </AppConfigProvider>
  );
  const harLestVilkaarInput = screen.getByLabelText("Jeg har lastet ned PDF-en og lest instruksjonene.");
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
      { properties: { skjemanummer: "NAV 76-07.10" } },
      { vedleggOP: "leggerVedNaa", vedleggQ1: "leggerVedNaa", vedleggF4: "leggerVedNaa" }
    );
    expect(url).toEqual(
      "https://example.org/opprettSoknadResource?skjemanummer=NAV%2076-07.10&erEttersendelse=false&vedleggsIder=OP,Q1,F4"
    );
  });

  it("calculate url without vedlegg", () => {
    const url = computeDokumentinnsendingURL(
      "https://example.org",
      { properties: { skjemanummer: "NAV 76-07.10" } },
      {}
    );
    expect(url).toEqual("https://example.org/opprettSoknadResource?skjemanummer=NAV%2076-07.10&erEttersendelse=false");
  });

  it("includes only the correct prefix vedlegg, drops prefix vedleg", () => {
    const url = computeDokumentinnsendingURL(
      "https://example.org",
      { properties: { skjemanummer: "NAV 76-07.10" } },
      { vedlegOP: "leggerVedNaa", vedleggR5: "leggerVedNaa", vedlegg: "leggerVedNaa" }
    );
    expect(url).toEqual(
      "https://example.org/opprettSoknadResource?skjemanummer=NAV%2076-07.10&erEttersendelse=false&vedleggsIder=R5"
    );
  });
});
