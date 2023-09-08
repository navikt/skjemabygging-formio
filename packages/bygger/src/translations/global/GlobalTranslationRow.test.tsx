import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GlobalTranslationRow from "./GlobalTranslationRow";

describe("GlobalTranslationRow", () => {
  let mockedUpdateTranslation = vi.fn();
  let mockedUpdateOriginalText = vi.fn();
  let mockedDeleteOneRow = vi.fn();

  const renderGlobalTranslationRow = (
    mockedOriginalText: string,
    mockedTranslation: string,
    mockedCurrentOriginalTextList: string[]
  ) => {
    mockedUpdateTranslation = vi.fn();
    mockedUpdateOriginalText = vi.fn();
    mockedDeleteOneRow = vi.fn();
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
  };

  afterEach(() => {
    mockedUpdateTranslation.mockClear();
    mockedUpdateOriginalText.mockClear();
    mockedDeleteOneRow.mockClear();
  });

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

  it("renders disabled translation input when original text exists in predefined original text list ", async () => {
    renderGlobalTranslationRow("forrige", "", []);
    const originalTextInput = screen.getByTestId("originalText");
    const translationInput = screen.getByTestId("translation");
    expect(originalTextInput).toHaveValue("forrige");
    expect(translationInput).toHaveValue("");
    originalTextInput.focus();
    await userEvent.tab();
    expect(screen.getByText("Denne teksten er allerede oversatt.")).toBeTruthy();
    expect(translationInput).toBeDisabled();
  });

  it("renders same original text and translation when there is no change only tabbed over", async () => {
    renderGlobalTranslationRow("Norge", "Norway", ["FORNAVN", "ETTERNAVN"]);
    const originalTextInput = screen.getByTestId("originalText");
    const translationInput = screen.getByTestId("translation");
    await userEvent.tab();
    expect(mockedUpdateOriginalText).not.toBeCalled();
    expect(originalTextInput).toHaveValue("Norge");
    expect(translationInput).toHaveValue("Norway");
  });
});
