import { NavFormioJs } from "@navikt/skjemadigitalisering-shared-components";
import { renderHook, waitFor } from "@testing-library/react";
import createMockImplementation, { DEFAULT_PROJECT_URL } from "../../test/backendMockImplementation";
import { FeedbackEmitContext } from "../context/notifications/FeedbackContext";
import { useFormioTranslations } from "./useFormioTranslations";

const MOCK_PREDEFINED_TEXTS_I18N_EN = {
  Ja: "Yes",
  Nei: "No",
  Forrige: "Previous",
  Neste: "Next",
};
const MOCK_PREDEFINED_TEXTS_I18N_PL = {
  Ja: "Tak",
  Nei: "Nie",
  Forrige: "Poprzedni",
  Neste: "Następny",
};
vi.mock("../translations/global/utils", () => ({
  getTranslationKeysForAllPredefinedTexts: () => Object.keys(MOCK_PREDEFINED_TEXTS_I18N_EN),
  tags: { VALIDERING: "validering", GRENSESNITT: "grensesnitt" },
}));

const RESPONSE_HEADERS_OK = {
  headers: {
    "content-type": "application/json",
  },
  status: 200,
};

const RESPONSE_HEADERS_ERROR = {
  headers: {
    "content-type": "text/plain",
  },
  status: 500,
};

describe("useFormioTranslations", () => {
  const expectedHeader = { headers: { "x-jwt-token": "" } };
  let fetchSpy, formioSpy;
  let formioTranslations: ReturnType<typeof useFormioTranslations>;
  let mockFeedbackEmit;

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, "fetch");
    fetchSpy.mockImplementation(createMockImplementation());
    formioSpy = vi.spyOn(NavFormioJs.Formio, "fetch");
    formioSpy.mockImplementation(createMockImplementation());
    mockFeedbackEmit = { success: vi.fn(), error: vi.fn() };
    const wrapper = ({ children }) => (
      <FeedbackEmitContext.Provider value={mockFeedbackEmit}>{children}</FeedbackEmitContext.Provider>
    );

    const { result } = renderHook(
      () => useFormioTranslations(DEFAULT_PROJECT_URL, new NavFormioJs.Formio(DEFAULT_PROJECT_URL)),
      {
        wrapper,
      },
    );
    formioTranslations = result.current;
  });

  afterEach(() => {
    fetchSpy.mockClear();
    formioSpy.mockClear();
  });

  describe("Global translations", () => {
    const valideringI18n = {
      data: {
        language: "en",
        name: "global",
        scope: "global",
        tag: "validering",
        i18n: {
          minYear: "{{field}} cannot be before {{minYear}}",
          maxYear: "{{field}} cannot be later than {{maxYear}}",
        },
      },
    };
    const grensesnittI18n = {
      data: {
        language: "en",
        name: "global",
        scope: "global",
        tag: "grensesnitt",
        i18n: {
          Ja: "Yes",
          Nei: "No",
        },
      },
    };

    describe("loadGlobalTranslations", () => {
      it("fetches all global translations when no language or tag is provided", async () => {
        const translations = formioTranslations.loadGlobalTranslations();
        await waitFor(() => expect(translations).toBeDefined());
        expect(fetchSpy).toHaveBeenCalledTimes(1);
        expect(fetchSpy).toHaveBeenCalledWith(
          `${DEFAULT_PROJECT_URL}/language/submission?data.name=global&limit=1000`,
          expectedHeader,
        );
      });

      it("fetches all global translations for the given language", async () => {
        const translations = formioTranslations.loadGlobalTranslations("en");
        await waitFor(() => expect(translations).toBeDefined());
        expect(fetchSpy).toHaveBeenCalledTimes(1);
        expect(fetchSpy).toHaveBeenCalledWith(
          `${DEFAULT_PROJECT_URL}/language/submission?data.name=global&data.language=en&limit=1000`,
          expectedHeader,
        );
      });

      it("fetches English translations and does no mapping for text keys", async () => {
        const fetchMockImpl = (globalTranslations) => {
          return () => {
            return Promise.resolve(new Response(JSON.stringify(globalTranslations["en"])));
          };
        };

        fetchSpy.mockImplementation(
          fetchMockImpl({
            en: [valideringI18n, grensesnittI18n],
          }),
        );

        const globalTranslation = await waitFor(() => formioTranslations.loadGlobalTranslations("en"));
        expect(globalTranslation).toEqual({
          en: [
            {
              id: undefined,
              name: "global",
              scope: "global",
              tag: "validering",
              translations: {
                minYear: {
                  scope: "global",
                  value: "{{field}} cannot be before {{minYear}}",
                },
                maxYear: {
                  scope: "global",
                  value: "{{field}} cannot be later than {{maxYear}}",
                },
              },
            },
            {
              id: undefined,
              name: "global",
              scope: "global",
              tag: "grensesnitt",
              translations: {
                Ja: {
                  scope: "global",
                  value: "Yes",
                },
                Nei: {
                  scope: "global",
                  value: "No",
                },
              },
            },
          ],
        });
      });
    });

    describe("loadGlobalTranslationsForTranslationsPage", () => {
      it("fetches all global translations when no language or tag is provided", async () => {
        const translations = formioTranslations.loadGlobalTranslationsForTranslationsPage();
        await waitFor(() => expect(translations).toBeDefined());
        expect(fetchSpy).toHaveBeenCalledTimes(1);
        expect(fetchSpy).toHaveBeenCalledWith(
          `${DEFAULT_PROJECT_URL}/language/submission?data.name=global&limit=1000`,
          expectedHeader,
        );
      });

      it("fetches English translations and maps original text value as key for texts with tag validering", async () => {
        const fetchMockImpl = (globalTranslations) => {
          return () => {
            return Promise.resolve(new Response(JSON.stringify(globalTranslations["en"])));
          };
        };

        fetchSpy.mockImplementation(
          fetchMockImpl({
            en: [valideringI18n, grensesnittI18n],
          }),
        );

        const globalTranslation = await waitFor(() =>
          formioTranslations.loadGlobalTranslationsForTranslationsPage("en"),
        );
        expect(globalTranslation).toEqual({
          en: [
            {
              id: undefined,
              name: "global",
              scope: "global",
              tag: "validering",
              translations: {
                "{{field}} kan ikke være før {{minYear}}": {
                  scope: "global",
                  value: "{{field}} cannot be before {{minYear}}",
                },
                "{{field}} kan ikke være senere enn {{maxYear}}": {
                  scope: "global",
                  value: "{{field}} cannot be later than {{maxYear}}",
                },
              },
            },
            {
              id: undefined,
              name: "global",
              scope: "global",
              tag: "grensesnitt",
              translations: {
                Ja: {
                  scope: "global",
                  value: "Yes",
                },
                Nei: {
                  scope: "global",
                  value: "No",
                },
              },
            },
          ],
        });
      });
    });

    describe("Publisering av globale oversettelser", () => {
      const LOAD_GLOBAL_TRANSLATIONS_REGEX =
        /\/language\/submission\?data\.name=global&data\.language=([a-z]{2}(-NO)?)&limit=1000$/;

      const fetchMockImpl = (globalTranslations) => {
        return (url, options) => {
          if (LOAD_GLOBAL_TRANSLATIONS_REGEX.test(url)) {
            const languageCode = LOAD_GLOBAL_TRANSLATIONS_REGEX.exec(url)?.[1];
            return Promise.resolve(
              new Response(JSON.stringify(languageCode ? globalTranslations[languageCode] : {}), RESPONSE_HEADERS_OK),
            );
          }
          if (url === "/api/published-resource/global-translations-en") {
            return Promise.resolve(new Response(JSON.stringify({ changed: true, result: "sha" }), RESPONSE_HEADERS_OK));
          }
          if (url === "/api/published-resource/global-translations-pl") {
            return Promise.resolve(new Response("500 Internal Server Error", RESPONSE_HEADERS_ERROR));
          }
          Promise.reject(`Manglende testoppsett: Ukjent url ${url}, options = ${JSON.stringify(options)}`);
        };
      };

      it("Publisering starter dersom alle predefinerte tekster er oversatt", async () => {
        fetchSpy.mockImplementation(
          fetchMockImpl({
            en: [
              {
                data: {
                  language: "en",
                  name: "global",
                  scope: "global",
                  tag: "validering",
                  i18n: MOCK_PREDEFINED_TEXTS_I18N_EN,
                },
              },
            ],
          }),
        );
        await waitFor(() => formioTranslations.publishGlobalTranslations("en"));
        expect(mockFeedbackEmit.error).not.toHaveBeenCalled();
        expect(mockFeedbackEmit.success).toHaveBeenCalled();
        const messages = mockFeedbackEmit.success.mock.calls;
        expect(messages).toHaveLength(1);
        expect(messages[0][0]).toEqual("Publisering av Engelsk startet");
      });

      it("Feiler dersom det mangler oversettelser for noen av de predefinerte tekstene", async () => {
        fetchSpy.mockImplementation(
          fetchMockImpl({
            en: [
              {
                data: {
                  language: "en",
                  name: "global",
                  scope: "global",
                  tag: "validering",
                  i18n: {
                    ...MOCK_PREDEFINED_TEXTS_I18N_EN,
                    Forrige: undefined,
                    Neste: undefined,
                  },
                },
              },
            ],
          }),
        );
        await waitFor(() => formioTranslations.publishGlobalTranslations("en"));
        expect(mockFeedbackEmit.success).not.toHaveBeenCalled();
        expect(mockFeedbackEmit.error).toHaveBeenCalled();
        const errorMessages = mockFeedbackEmit.error.mock.calls;
        expect(errorMessages).toHaveLength(1);
        expect(errorMessages[0][0]).toEqual("Det mangler oversettelser for følgende tekster: Forrige, Neste");
      });

      it("Viser feilmelding dersom kall til backend feiler", async () => {
        fetchSpy.mockImplementation(
          fetchMockImpl({
            pl: [
              {
                data: {
                  language: "pl",
                  name: "global",
                  scope: "global",
                  tag: "validering",
                  i18n: MOCK_PREDEFINED_TEXTS_I18N_PL,
                },
              },
            ],
          }),
        );
        await waitFor(() => formioTranslations.publishGlobalTranslations("pl"));
        expect(mockFeedbackEmit.success).not.toHaveBeenCalled();
        expect(mockFeedbackEmit.error).toHaveBeenCalled();
        const errorMessages = mockFeedbackEmit.error.mock.calls;
        expect(errorMessages).toHaveLength(1);
        expect(errorMessages[0][0]).toEqual("Publisering feilet");
      });
    });
  });

  describe("loadTranslationsForEditPage", () => {
    const formPath = "testFormPath";
    let translations;

    beforeEach(() => {
      translations = formioTranslations.loadTranslationsForEditPage(formPath);
    });

    it("fetches translations for the given form path", async () => {
      await waitFor(() => expect(translations).toBeDefined());
      expect(fetchSpy).toHaveBeenCalledWith(
        `${DEFAULT_PROJECT_URL}/language/submission?data.name__regex=/^global(.${formPath})*$/gi&limit=1000`,
        expectedHeader,
      );
    });

    it("fetches country names for Norwegian Bokmål", async () => {
      await waitFor(() => expect(translations).toBeDefined());
      expect(fetchSpy).toHaveBeenCalledWith(`${DEFAULT_PROJECT_URL}/api/countries?lang=nb`);
    });

    it("fetches country names for all other languages in translations", async () => {
      await waitFor(() => expect(translations).toBeDefined());
      expect(fetchSpy).toHaveBeenCalledWith(`${DEFAULT_PROJECT_URL}/api/countries?lang=en`);
    });

    it("makes no extra fetch calls", async () => {
      await waitFor(() => expect(translations).toBeDefined());
      expect(fetchSpy).toHaveBeenCalledTimes(3);
    });

    it("maps translations and countries", async () => {
      expect.assertions(2);
      await waitFor(() => expect(translations).toBeDefined());
      await expect(translations).resolves.toStrictEqual({
        "nb-NO": {
          translations: {
            Sverige: { value: "Sverige", scope: "component-countryName" },
            Norge: { value: "Norge", scope: "component-countryName" },
          },
        },
        en: {
          id: undefined,
          translations: {
            ja: { value: "yes", scope: "global" },
            Norge: { value: "Norway", scope: "component-countryName" },
            Sverige: { value: "Sweden", scope: "component-countryName" },
          },
        },
      });
    });
  });

  describe("saveTranslation", () => {
    it("updates the translationSubmission, when translationId is provided", async () => {
      expect.assertions(4);
      formioTranslations.saveLocalTranslation(
        "translationId",
        "en",
        { tekst: { value: "text", scope: "local" } },
        "formPath",
        "formTitle",
      );

      await waitFor(() => expect(mockFeedbackEmit.success).toHaveBeenCalled());

      expect(formioSpy).toHaveBeenCalledWith(`${DEFAULT_PROJECT_URL}/language/submission/translationId`, {
        body: JSON.stringify({
          data: { language: "en", i18n: { tekst: "text" }, name: "global.formPath", scope: "local", form: "formPath" },
        }),
        headers: { "content-type": "application/json", "x-jwt-token": "" },
        method: "PUT",
      });
      expect(formioSpy).toHaveBeenCalledTimes(1);
    });

    it("creates a translationSubmission, before update, when translationId is not provided", async () => {
      expect.assertions(5);
      formioTranslations.saveLocalTranslation(
        undefined,
        "en",
        { tekst: { value: "text", scope: "local" } },
        "formPath",
        "formTitle",
      );
      await waitFor(() => expect(mockFeedbackEmit.success).toHaveBeenCalled());

      expect(formioSpy).toHaveBeenCalledWith(`${DEFAULT_PROJECT_URL}/language/submission`, {
        body: JSON.stringify({
          data: { language: "en", name: "global.formPath", scope: "local", form: "formPath" },
        }),
        headers: { "content-type": "application/json", "x-jwt-token": "" },
        method: "POST",
      });

      expect(formioSpy).toHaveBeenCalledWith(`${DEFAULT_PROJECT_URL}/language/submission/_translationId`, {
        body: JSON.stringify({
          data: { language: "en", i18n: { tekst: "text" }, name: "global.formPath", scope: "local", form: "formPath" },
        }),
        headers: { "content-type": "application/json", "x-jwt-token": "" },
        method: "PUT",
      });

      expect(formioSpy).toHaveBeenCalledTimes(2);
    });
  });
});
