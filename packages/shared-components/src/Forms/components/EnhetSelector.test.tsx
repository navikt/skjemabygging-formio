import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { Enhet } from "../../api/Enhet";
import { LanguagesProvider } from "../../context/languages";
import EnhetSelector from "./EnhetSelector";

jest.mock("../../context/languages/useLanguageCodeFromURL", () => jest.fn(() => ""));
const mockOnSelectEnhet = jest.fn();
const mockEnhetsListe = [
  { enhetNr: "1", navn: "NAV abc" },
  { enhetNr: "2", navn: "NAV def" },
  { enhetNr: "3", navn: "NAV ghi" },
  { enhetNr: "4", navn: "NAV jkl" },
];

describe("EnhetSelector", () => {
  const renderEnhetSelector = (enhetsListe = mockEnhetsListe) => {
    render(
      <LanguagesProvider translations={{}} children={undefined}>
        <EnhetSelector enhetsListe={enhetsListe as Enhet[]} onSelectEnhet={mockOnSelectEnhet} />,
      </LanguagesProvider>
    );
  };

  describe("When enhetsListe is provided", () => {
    beforeEach(async () => {
      renderEnhetSelector();
      const DOWN_ARROW = { keyCode: 40 };
      const enhetSelector = screen.getByText(TEXTS.statiske.prepareLetterPage.selectEntityDefault);
      fireEvent.keyDown(enhetSelector, DOWN_ARROW);
      await waitFor(() => expect(screen.getByText("NAV abc")).toBeTruthy());
    });

    it.each(mockEnhetsListe)("renders each option", (enhet) => {
      expect(screen.getByText(enhet.navn)).toBeDefined();
    });

    it("returns the selected enhet when selected", () => {
      fireEvent.click(screen.getByText("NAV ghi"));
      expect(mockOnSelectEnhet).toHaveBeenCalledTimes(1);
      expect(mockOnSelectEnhet).toHaveBeenCalledWith("3");
    });
  });

  describe("When enhetsListe is empty", () => {
    it("does not render the select", () => {
      renderEnhetSelector([]);
      expect(screen.queryByLabelText(TEXTS.statiske.prepareLetterPage.chooseEntity)).toBeNull();
    });
  });
});
