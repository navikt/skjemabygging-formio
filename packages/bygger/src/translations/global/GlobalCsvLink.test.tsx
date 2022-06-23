import { FormioTranslationMap } from "@navikt/skjemadigitalisering-shared-domain";
import { render, screen } from "@testing-library/react";
import React from "react";
import GlobalCsvLink from "./GlobalCsvLink";

describe("GlobalCsvLink", () => {
  it("renders link to download csv", async () => {
    const allGlobalTranslations: FormioTranslationMap = {
      en: [{ translations: { Personopplysninger: { value: "Personal information", scope: "global" } } }],
    };
    render(<GlobalCsvLink allGlobalTranslations={allGlobalTranslations} languageCode="en" />);
    const link = await screen.findByRole("link", { name: "Eksporter" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("download");
    expect(link.getAttribute("download")).toEqual("globale-oversettelser-en.csv");
    expect(link).toHaveAttribute("href");
  });
});
