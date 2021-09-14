import React from "react";
import ApplicationTextTranslationEditPanel, {
  getTranslationByOriginalText,
} from "./ApplicationTextTranslationEditPanel";
import { fireEvent, render, screen } from "@testing-library/react";

describe("ApplicationTextTranslationEditPanel", () => {
  describe("getTranslationByOriginalText", () => {
    it("returns translation object that matches originalText", () => {
      expect(
        getTranslationByOriginalText("bbb", [
          { id: "id1", originalText: "aaa", translatedText: "AAA" },
          { id: "id2", originalText: "bbb", translatedText: "BBB" },
          { id: "id3", originalText: "ccc", translatedText: "CCC" },
        ])
      ).toEqual({ id: "id2", originalText: "bbb", translatedText: "BBB" });
    });

    it("returns nothing if translations has no matching originalText", () => {
      expect(
        getTranslationByOriginalText("original text", [
          { id: "id", originalText: "a different original text", translatedText: "translated text" },
        ])
      ).toBeUndefined();
    });
  });

  describe("Rendering with three texts and one translation", () => {
    const mockedUpdateTranslation = jest.fn();
    beforeEach(() => {
      render(
        <ApplicationTextTranslationEditPanel
          texts={[
            { key: "key1", text: "text1" },
            { key: "key2", text: "text2" },
            { key: "key3", text: "text3" },
          ]}
          translations={[{ id: "id", originalText: "text1", translatedText: "TEXT1" }]}
          languageCode={"en"}
          updateTranslation={mockedUpdateTranslation}
        />
      );
    });

    afterEach(() => {
      mockedUpdateTranslation.mockClear();
    });

    it("renders all three inputs", () => {
      expect(screen.getAllByRole("textbox")).toHaveLength(3);
    });

    it("renders text1 with translatedText as value", () => {
      expect(screen.getByLabelText("text1").getAttribute("value")).toEqual("TEXT1");
    });

    it("renders text2 without a value", () => {
      expect(screen.getByLabelText("text2").getAttribute("value")).toEqual("");
    });

    describe("onChange", () => {
      it("calls updateTranslation with existing id, text and new value, when text already has a translation", () => {
        const text1 = screen.getByLabelText("text1");
        fireEvent.change(text1, { target: { value: "new global translation" } });
        expect(mockedUpdateTranslation).toHaveBeenCalledTimes(1);
        expect(mockedUpdateTranslation).toHaveBeenCalledWith("id", "text1", "new global translation");
      });
      it("calls updateTranslation with empty string as id, text and new value, when text did not have a translation", () => {
        const text1 = screen.getByLabelText("text2");
        fireEvent.change(text1, { target: { value: "new global translation" } });
        expect(mockedUpdateTranslation).toHaveBeenCalledTimes(1);
        expect(mockedUpdateTranslation).toHaveBeenCalledWith("", "text2", "new global translation");
      });
    });
  });
});
