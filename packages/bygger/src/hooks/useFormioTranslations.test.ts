import { useFormioTranslations } from "./useFormioTranslations";
import { InprocessQuipApp } from "../fakeBackend/InprocessQuipApp";
import { dispatcherWithBackend } from "../fakeBackend/fakeWebApp";
import { FakeBackend } from "../fakeBackend/FakeBackend";
import { Formio } from "formiojs";
import { waitFor } from "@testing-library/react";

const MOCK_PREDEFINED_TEXTS_I18N_EN = {
  Ja: "Yes",
  Nei: "No",
  Forrige: "Previous",
  Neste: "Next",
};
jest.mock("../translations/global/utils", () => ({
  getAllPredefinedOriginalTexts: () => Object.keys(MOCK_PREDEFINED_TEXTS_I18N_EN),
  tags: { VALIDERING: "validering", GRENSESNITT: "grensesnitt" },
}));

describe("useFormioTranslations", () => {
  const projectUrl = "http://myProject.example.org";
  const expectedHeader = { headers: { "x-jwt-token": "" } };
  let fetchSpy;
  let formioTranslations: ReturnType<typeof useFormioTranslations>;
  let mockUserAlerter;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, "fetch");
    const fetchAppGlue = new InprocessQuipApp(dispatcherWithBackend(new FakeBackend()));
    fetchSpy.mockImplementation(fetchAppGlue.fetchImpl);
    mockUserAlerter = { setErrorMessage: jest.fn(), flashSuccessMessage: jest.fn() };

    formioTranslations = useFormioTranslations(projectUrl, new Formio(projectUrl), mockUserAlerter);
  });

  afterEach(() => {
    fetchSpy.mockClear();
  });

  describe("loadGlobalTranslations", () => {
    it("fetches all global translations when no language or tag is provided", async () => {
      const translations = formioTranslations.loadGlobalTranslations();
      await waitFor(() => expect(translations).toBeDefined());
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(
        `${projectUrl}/language/submission?data.name=global&limit=1000`,
        expectedHeader
      );
    });

    it("fetches all global translations for the given language", async () => {
      const translations = formioTranslations.loadGlobalTranslations("en");
      await waitFor(() => expect(translations).toBeDefined());
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(
        `${projectUrl}/language/submission?data.name=global&data.language=en&limit=1000`,
        expectedHeader
      );
    });

    it("fetches English translations and check the response with validering tag", async () => {
      const fetchMockImpl = (globalTranslations) => {
        return () => {
          return Promise.resolve(new Response(JSON.stringify(globalTranslations["en"])));
        };
      };

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
                  minYear: "{{field}} cannot be before {{minYear}}",
                  maxYear: "{{field}} cannot be later than {{maxYear}}",
                },
              },
            },
          ],
        })
      );

      formioTranslations.loadGlobalTranslations("en").then((globalTranslation) => {
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
          ],
        });
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
          return Promise.resolve(new Response(JSON.stringify(languageCode ? globalTranslations[languageCode] : {})));
        }
        if (url === "/api/published-resource/global-translations-en") {
          return Promise.resolve(new Response("Ok"));
        }
        fail(`Manglende testoppsett: Ukjent url ${url}, options = ${JSON.stringify(options)}`);
      };
    };

    it("Publisering starter dersom alle predefinerte tekster er oversatt", (done) => {
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
        })
      );
      formioTranslations.publishGlobalTranslations("en").then(() => {
        expect(mockUserAlerter.setErrorMessage).not.toHaveBeenCalled();
        expect(mockUserAlerter.flashSuccessMessage).toHaveBeenCalled();
        const errorMessages = mockUserAlerter.flashSuccessMessage.mock.calls;
        expect(errorMessages).toHaveLength(1);
        expect(errorMessages[0][0]).toEqual("Publisering av Engelsk startet");
        done();
      });
    });

    it("Feiler dersom det mangler oversettelser for noen av de predefinerte tekstene", (done) => {
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
        })
      );
      formioTranslations.publishGlobalTranslations("en").then(() => {
        expect(mockUserAlerter.flashSuccessMessage).not.toHaveBeenCalled();
        expect(mockUserAlerter.setErrorMessage).toHaveBeenCalled();
        const errorMessages = mockUserAlerter.setErrorMessage.mock.calls;
        expect(errorMessages).toHaveLength(1);
        expect(errorMessages[0][0]).toEqual("Det mangler oversettelser for følgende tekster: Forrige, Neste");
        done();
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
        `${projectUrl}/language/submission?data.name__regex=/^global(.${formPath})*$/gi&limit=1000`,
        expectedHeader
      );
    });

    it("fetches country names for Norwegian Bokmål", async () => {
      await waitFor(() => expect(translations).toBeDefined());
      expect(fetchSpy).toHaveBeenCalledWith(`${projectUrl}/countries?lang=nb`);
    });

    it("fetches country names for all other languages in translations", async () => {
      await waitFor(() => expect(translations).toBeDefined());
      expect(fetchSpy).toHaveBeenCalledWith(`${projectUrl}/countries?lang=en`);
    });

    it("makes no extra fetch calls", async () => {
      await waitFor(() => expect(translations).toBeDefined());
      expect(fetchSpy).toHaveBeenCalledTimes(3);
    });

    it("maps translations and countries", async () => {
      expect.assertions(2);
      await waitFor(() => expect(translations).toBeDefined());
      await expect(translations).resolves.toStrictEqual({
        en: {
          id: undefined,
          translations: {
            ja: { value: "yes", scope: "global" },
            Norway: { value: "Norway", scope: "component-countryName" },
            Austria: { value: "Austria", scope: "component-countryName" },
          },
        },
      });
    });
  });
});
