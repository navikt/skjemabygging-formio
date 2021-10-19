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
    renderGlobalTranslationRow("forrige", "previous", ["AVBRYT, NESTE"]);
    expect(screen.getByTestId("originalText")).toHaveValue("forrige");
    expect(screen.getByTestId("translation")).toHaveValue("previous");
  });

  it("renders disabled translation input when original text(lower case) exists in current original text list", () => {
    renderGlobalTranslationRow("forrige", "previous", ["AVBRYT, NESTE"]);
    const originalTextInput = screen.getByTestId("originalText");
    const translationInput = screen.getByTestId("translation");
    userEvent.type(originalTextInput, "avbryt");
    userEvent.tab();
    expect(mockedUpdateOriginalText).toBeCalled();
    expect(translationInput).toBeDisabled();
  });

  it("renders disabled translation input when original text(with one uppercase) exists in current original text list", () => {
    renderGlobalTranslationRow("forrige", "previous", ["AVBRYT, NESTE"]);
    const originalTextInput = screen.getByTestId("originalText");
    const translationInput = screen.getByTestId("translation");
    userEvent.type(originalTextInput, "avbRyt");
    userEvent.tab();
    expect(mockedUpdateOriginalText).toBeCalled();
    expect(translationInput).toBeDisabled();
  });

  it("renders same original text and translation when there is no change only tabbed over", () => {
    renderGlobalTranslationRow("forrige", "previous", ["AVBRYT, NESTE"]);
    const originalTextInput = screen.getByTestId("originalText");
    const translationInput = screen.getByTestId("translation");
    userEvent.tab();
    expect(mockedUpdateOriginalText).not.toBeCalled();
    expect(originalTextInput).toHaveValue("forrige");
    expect(translationInput).toHaveValue("previous");
  });
});
