import getCurrenttranslationsReducer from "./getCurrenttranslationsReducer";

const mockedPayload = {
  translations: {
    "Bor du i Norge?": { value: "Do you live in Norway?", scope: "global" },
    "Har du noen tilleggsdokumentasjon?": {
      value: "Do you have any additional documentation?",
      scope: "global",
    },
  },
};

const mockedEmptyState = [
  {
    id: "000",
    originalText: "",
    translatedText: "",
  },
];

const mockedState = [
  {
    id: "123",
    originalText: "Bor du i Norge?",
    translatedText: "Do you live in Norway?",
  },
  {
    id: "321",
    originalText: "Har du noen tilleggsdokumentasjon?",
    translatedText: "Do you have any additional documentation?",
  },
];

describe("Test getCurrenttranslationsReducer", () => {
  describe("Test initial language action", () => {
    it("return empty original text and translation", () => {
      const updatedState = getCurrenttranslationsReducer(mockedEmptyState, { type: "initializeLanguage", payload: {} });
      expect(updatedState[0].originalText).toEqual("");
      expect(updatedState[0].translatedText).toEqual("");
    });
  });

  describe("Test load new language action", () => {
    it("with mock payload, return original text and translation", () => {
      const updatedState = getCurrenttranslationsReducer(mockedEmptyState, {
        type: "loadNewLanguage",
        payload: mockedPayload,
      });
      expect(updatedState[0].originalText).toEqual("Bor du i Norge?");
      expect(updatedState[0].translatedText).toEqual("Do you live in Norway?");
      expect(updatedState[1].originalText).toEqual("Har du noen tilleggsdokumentasjon?");
      expect(updatedState[1].translatedText).toEqual("Do you have any additional documentation?");
    });

    it("without mock payload, return empty original text and translation", () => {
      const updatedState = getCurrenttranslationsReducer(mockedEmptyState, {
        type: "loadNewLanguage",
        payload: { translations: {} },
      });
      expect(updatedState[0].originalText).toEqual("");
      expect(updatedState[0].translatedText).toEqual("");
    });
  });

  describe("Test add new translation action", () => {
    it("without existing original text and translation, return new empty original text and translation", () => {
      const updatedState = getCurrenttranslationsReducer(mockedEmptyState, { type: "addNewTranslation", payload: {} });
      expect(updatedState[0].originalText).toEqual("");
      expect(updatedState[0].translatedText).toEqual("");
    });

    it("with mocked original text and translation,  return existing original text and translation and new empty original text and translation", () => {
      const updatedState = getCurrenttranslationsReducer(mockedState, { type: "addNewTranslation", payload: {} });
      expect(updatedState[0].originalText).toEqual("Bor du i Norge?");
      expect(updatedState[0].translatedText).toEqual("Do you live in Norway?");
      expect(updatedState[1].originalText).toEqual("Har du noen tilleggsdokumentasjon?");
      expect(updatedState[1].translatedText).toEqual("Do you have any additional documentation?");
      expect(updatedState[2].originalText).toEqual("");
      expect(updatedState[2].translatedText).toEqual("");
    });
  });

  describe("Test update translation action", () => {
    it("update only an empty translation,  return empty original text and new translation", () => {
      const updatedState = getCurrenttranslationsReducer(mockedEmptyState, {
        type: "updateTranslation",
        payload: { id: "000", originalText: "", translatedText: "Yes" },
      });
      expect(updatedState[0].originalText).toEqual("");
      expect(updatedState[0].translatedText).toEqual("Yes");
    });

    it("update existing translation,  return existing original text and new translation", () => {
      const updatedState = getCurrenttranslationsReducer(mockedState, {
        type: "updateTranslation",
        payload: { id: "123", originalText: "Bor du i Norge?", translatedText: "Do you live in Norway" },
      });
      console.log("updatedState", updatedState);
      expect(updatedState[0].originalText).toEqual("Bor du i Norge?");
      expect(updatedState[0].translatedText).toEqual("Do you live in Norway");
      expect(updatedState[1].originalText).toEqual("Har du noen tilleggsdokumentasjon?");
      expect(updatedState[1].translatedText).toEqual("Do you have any additional documentation?");
    });
  });

  describe("Test update original text action", () => {
    it("update an empty original text,  return new original text and empty translation", () => {
      const updatedState = getCurrenttranslationsReducer(mockedEmptyState, {
        type: "updateOriginalText",
        payload: { id: "000", newOriginalText: "Forrige", oldOriginalText: "" },
      });
      expect(updatedState[0].originalText).toEqual("Forrige");
      expect(updatedState[0].translatedText).toEqual("");
    });

    it("update mocked original text,  return new original text and existing translation", () => {
      const updatedState = getCurrenttranslationsReducer(mockedState, {
        type: "updateOriginalText",
        payload: { id: "123", newOriginalText: "Bor du ikke i Norge?", oldOriginalText: "Bor du i Norge?" },
      });
      expect(updatedState[0].originalText).toEqual("Bor du ikke i Norge?");
      expect(updatedState[0].translatedText).toEqual("Do you live in Norway?");
      expect(updatedState[1].originalText).toEqual("Har du noen tilleggsdokumentasjon?");
      expect(updatedState[1].translatedText).toEqual("Do you have any additional documentation?");
    });

    it("update non-existing original text,  return existing original text and translation", () => {
      const updatedState = getCurrenttranslationsReducer(mockedState, {
        type: "updateOriginalText",
        payload: { id: "789", newOriginalText: "Bor du ikke i Norge?", oldOriginalText: "Bor du i Norge?" },
      });
      expect(updatedState[0].originalText).toEqual("Bor du i Norge?");
      expect(updatedState[0].translatedText).toEqual("Do you live in Norway?");
      expect(updatedState[1].originalText).toEqual("Har du noen tilleggsdokumentasjon?");
      expect(updatedState[1].translatedText).toEqual("Do you have any additional documentation?");
    });
  });

  describe("Test delete one row action", () => {
    it("delete empty row with id,  return empty original text and translation", () => {
      const updatedState = getCurrenttranslationsReducer(mockedEmptyState, {
        type: "deleteOneRow",
        payload: { id: "123", originalText: "", translatedText: "" },
      });
      expect(updatedState[0].originalText).toEqual("");
      expect(updatedState[0].translatedText).toEqual("");
    });

    it("delete existing row with id, return original text and translation", () => {
      const updatedState = getCurrenttranslationsReducer(mockedState, {
        type: "deleteOneRow",
        payload: { id: "123" },
      });

      expect(updatedState[0].originalText).toEqual("Har du noen tilleggsdokumentasjon?");
      expect(updatedState[0].translatedText).toEqual("Do you have any additional documentation?");
    });

    it("delete with wrong id, return same rows", () => {
      const updatedState = getCurrenttranslationsReducer(mockedState, {
        type: "deleteOneRow",
        payload: { id: "000" },
      });

      expect(updatedState[0].originalText).toEqual("Bor du i Norge?");
      expect(updatedState[0].translatedText).toEqual("Do you live in Norway?");
      expect(updatedState[1].originalText).toEqual("Har du noen tilleggsdokumentasjon?");
      expect(updatedState[1].translatedText).toEqual("Do you have any additional documentation?");
    });
  });

  describe("Test default action", () => {
    it("with empty state and empty payload,  return empty original text and new translation", () => {
      const updatedState = getCurrenttranslationsReducer(mockedEmptyState, {
        type: "deleteLanguage",
        payload: {},
      });
      expect(updatedState[0].originalText).toEqual("");
      expect(updatedState[0].translatedText).toEqual("");
    });

    it("with empty state and translation payload,  return empty original text and new translation", () => {
      const updatedState = getCurrenttranslationsReducer(mockedEmptyState, {
        type: "deleteLanguage",
        payload: { id: "345", originalText: "Ja", translatedText: "Yes" },
      });
      expect(updatedState[0].originalText).toEqual("");
      expect(updatedState[0].translatedText).toEqual("");
    });

    it("with mocked state and empty payload,  return mocked original text and new translation", () => {
      const updatedState = getCurrenttranslationsReducer(mockedState, {
        type: "deleteLanguage",
        payload: {},
      });
      expect(updatedState[0].originalText).toEqual("Bor du i Norge?");
      expect(updatedState[0].translatedText).toEqual("Do you live in Norway?");
      expect(updatedState[1].originalText).toEqual("Har du noen tilleggsdokumentasjon?");
      expect(updatedState[1].translatedText).toEqual("Do you have any additional documentation?");
    });

    it("with mocked state and payload,  return mocked original text and new translation", () => {
      const updatedState = getCurrenttranslationsReducer(mockedState, {
        type: "deleteLanguage",
        payload: { id: "345", originalText: "Ja", translatedText: "Yes" },
      });
      expect(updatedState[0].originalText).toEqual("Bor du i Norge?");
      expect(updatedState[0].translatedText).toEqual("Do you live in Norway?");
      expect(updatedState[1].originalText).toEqual("Har du noen tilleggsdokumentasjon?");
      expect(updatedState[1].translatedText).toEqual("Do you have any additional documentation?");
    });
  });
});
