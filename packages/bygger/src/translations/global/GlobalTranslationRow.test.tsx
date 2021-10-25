import React from "react";
import { render, screen } from "@testing-library/react";
import GlobalTranslationRow from "./GlobalTranslationRow";
import userEvent from "@testing-library/user-event";

describe("GlobalTranslationRow", () => {
  const mockedUpdateTranslation = jest.fn();
  const mockedUpdateOriginalText = jest.fn();
  const mockedDeleteOneRow = jest.fn();

  const renderGlobalTranslationRow = (
    mockedOriginalText: string,
    mockedTranslation: string,
    mockedCurrentOriginalTextList: string[]
  ) => {
    render(
      <GlobalTranslationRow
        id={"123"}
        originalText={mockedOriginalText}
        translatedText={mockedTranslation}
        updateTranslation={mockedUpdateTranslation}
        updateOriginalText={mockedUpdateOriginalText}
        deleteOneRow={mockedDeleteOneRow}
        currentOriginalTextList={mockedCurrentOriginalTextList}
        predefinedGlobalOriginalTexts={["FORRIGE", "NESTE", "FJERN"]}
      />
    );

    afterEach(() => {
      mockedUpdateTranslation.mockClear();
      mockedUpdateOriginalText.mockClear();
      mockedDeleteOneRow.mockClear();
    });
  };

  it("renders one globalTranslation row with empty originalText and translation", () => {
    renderGlobalTranslationRow("", "", []);
    expect(screen.getAllByRole("textbox")).toHaveLength(2);
    expect(screen.getByTestId("originalText")).toHaveValue("");
    expect(screen.getByTestId("translation")).toHaveValue("");
  });

  it("renders globalTranslation row with originalText and translation", () => {
    renderGlobalTranslationRow("Norge", "Norway", ["FORNAVN", "ETTERNAVN"]);
    expect(screen.getByTestId("originalText")).toHaveValue("Norge");
    expect(screen.getByTestId("translation")).toHaveValue("Norway");
  });

  it("renders disabled translation input when original text exists in predefined original text list ", () => {
    renderGlobalTranslationRow("forrige", "", []);
    const originalTextInput = screen.getByTestId("originalText");
    const translationInput = screen.getByTestId("translation");
    expect(originalTextInput).toHaveValue("forrige");
    expect(translationInput).toHaveValue("");
    originalTextInput.focus();
    userEvent.tab();
    expect(screen.getByText("Denne teksten er allerede oversatt.")).toBeTruthy();
    expect(translationInput).toBeDisabled();
  });

  it("renders same original text and translation when there is no change only tabbed over", () => {
    renderGlobalTranslationRow("Norge", "Norway", ["FORNAVN", "ETTERNAVN"]);
    const originalTextInput = screen.getByTestId("originalText");
    const translationInput = screen.getByTestId("translation");
    userEvent.tab();
    expect(mockedUpdateOriginalText).not.toBeCalled();
    expect(originalTextInput).toHaveValue("Norge");
    expect(translationInput).toHaveValue("Norway");
  });
});
