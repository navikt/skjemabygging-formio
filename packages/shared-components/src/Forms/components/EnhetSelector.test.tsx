import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { EnhetInkludertKontaktinformasjon } from "../../api/Enhet";
import { LanguagesProvider } from "../../context/languages";
import EnhetSelector from "./EnhetSelector";

jest.mock("../../context/languages/useLanguageCodeFromURL", () => jest.fn(() => ""));
const mockOnSelectEnhet = jest.fn();
const mockEnhetsListe = [
  { enhet: { enhetId: 1, navn: "NAV abc" } },
  { enhet: { enhetId: 2, navn: "NAV def" } },
  { enhet: { enhetId: 3, navn: "NAV ghi" } },
  { enhet: { enhetId: 4, navn: "NAV jkl" } },
];

describe("EnhetSelector", () => {
  const renderEnhetSelector = (enhetsListe = mockEnhetsListe) => {
    render(
      <LanguagesProvider translations={{}} children={undefined}>
        <EnhetSelector
          enhetsListe={enhetsListe as EnhetInkludertKontaktinformasjon[]}
          onSelectEnhet={mockOnSelectEnhet}
        />
        ,
      </LanguagesProvider>
    );
  };

  describe("When enhetsListe is provided", () => {
    beforeEach(() => {
      renderEnhetSelector();
    });

    it("renders the select", () => {
      expect(screen.getByLabelText(TEXTS.statiske.prepareLetterPage.chooseEntity)).toBeDefined();
    });

    it.each(mockEnhetsListe)("renders each option", ({ enhet }) => {
      expect(screen.getByText(enhet.navn)).toBeDefined();
    });

    it("returns the selected enhet when selected", () => {
      const enhetSelector = screen.getByLabelText(TEXTS.statiske.prepareLetterPage.chooseEntity);
      fireEvent.change(enhetSelector, { target: { value: 3 } });
      expect(mockOnSelectEnhet).toHaveBeenCalledTimes(1);
      expect(mockOnSelectEnhet).toHaveBeenCalledWith({ enhet: { enhetId: 3, navn: "NAV ghi" } });
    });
  });

  describe("When enhetsListe is empty", () => {
    it("does not render the select", () => {
      renderEnhetSelector([]);
      expect(screen.queryByLabelText(TEXTS.statiske.prepareLetterPage.chooseEntity)).toBeNull();
    });
  });
});
