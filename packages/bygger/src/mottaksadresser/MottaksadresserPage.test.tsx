import { AppConfigProvider } from "@navikt/skjemadigitalisering-shared-components";
import { render, screen } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import featureToggles from "../featureToggles";
import MottaksadresserPage from "./MottaksadresserPage";

jest.mock("./MottaksadresserListe", () => () => {
  return <div>mottaksadresserliste</div>;
});

describe("MottaksadressePage", () => {
  it("rendrer siden med overskrift", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppConfigProvider featureToggles={featureToggles}>
          <MottaksadresserPage />
        </AppConfigProvider>
      </MemoryRouter>
    );
    expect(await screen.findByRole("heading", { name: "Mottaksadresser" })).toBeTruthy();
  });
});
