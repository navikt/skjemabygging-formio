import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { AppConfigProvider } from "@navikt/skjemadigitalisering-shared-components";
import MottaksadresserPage from "./MottaksadresserPage";
import featureToggles from "../featureToggles";
import {MemoryRouter} from "react-router-dom";

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
    expect(await screen.findByRole("heading", {name: "Mottaksadresser"})).toBeTruthy();
  });

});
