import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AppConfigProvider } from "../configContext";
import { PrepareSubmitPage } from "./PrepareSubmitPage";

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

it("Calculate url", () => {});
