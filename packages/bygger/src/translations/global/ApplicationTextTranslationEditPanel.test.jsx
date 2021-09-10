import React from "react";
import ApplicationTextTranslationEditPanel, {
  getTranslationByOriginalText,
} from "./ApplicationTextTranslationEditPanel";
import { render, screen } from "@testing-library/react";

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
          updateTranslation={jest.fn()}
        />
      );
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
  });
});
