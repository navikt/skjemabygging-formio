import { GlobalTranslationMap } from "@navikt/skjemadigitalisering-shared-domain";
import { render, screen } from "@testing-library/react";
import GlobalCsvLink from "./GlobalCsvLink";

describe.skip("GlobalCsvLink", () => {
  it("renders link to download csv", async () => {
    const allGlobalTranslations: GlobalTranslationMap = {
      en: [
        {
          id: "4",
          name: "global",
          scope: "global",
          tag: "skjematekster",
          translations: { Personopplysninger: { value: "Personal information", scope: "global" } },
        },
      ],
    };
    render(<GlobalCsvLink allGlobalTranslations={allGlobalTranslations} languageCode="en" />);
    const link = await screen.findByRole("link", { name: "Eksporter" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("download");
    expect(link.getAttribute("download")).toEqual("globale-oversettelser-en.csv");
    expect(link).toHaveAttribute("href");
  });
});
