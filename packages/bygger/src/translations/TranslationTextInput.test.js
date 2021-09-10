import React from "react";
import { render, screen } from "@testing-library/react";
import TranslationTextInput from "./TranslationTextInput";

describe("TranslationTextInput", () => {
  const setUp = (type, hasGlobalTranslation = false, showGlobalTranslation = false) => {
    render(
      <TranslationTextInput
        text={"Original text"}
        value={"Value"}
        type={type}
        hasGlobalTranslation={hasGlobalTranslation}
        showGlobalTranslation={showGlobalTranslation}
        onChange={jest.fn()}
      />
    );
  };

  it('renders textArea when type is "textArea"', () => {
    setUp("textArea");
    expect(screen.getByRole("textbox").getAttribute("type")).toBe("textArea");
  });

  it('renders Input with type text when type is "text"', () => {
    setUp("text");
    expect(screen.getByRole("textbox").getAttribute("type")).toBe("text");
  });

  it("does not render input description", () => {
    setUp("text");
    expect(screen.queryByText("Denne teksten er globalt oversatt")).toBeNull();
  });

  describe("When text has global translation", () => {
    beforeEach(() => {
      setUp("text", true, true);
    });

    it("renders description", () => {
      expect(screen.getByText("Denne teksten er globalt oversatt")).toBeDefined();
    });

    it("renders locked icon", () => {
      expect(screen.getByTitle("Lås opp for å overstyre global oversettelse")).toBeDefined();
    });

    it("renders unlocked icon when text no longer has global translation", () => {
      setUp("text", false, true);
      expect(screen.getByTitle("Bruk global oversettelse")).toBeDefined();
    });
  });
});
