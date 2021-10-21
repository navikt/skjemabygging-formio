import React from "react";
import { useFormioTranslations } from "./useFormioTranslations";
import { InprocessQuipApp } from "../fakeBackend/InprocessQuipApp";
import { dispatcherWithBackend } from "../fakeBackend/fakeWebApp";
import { FakeBackend } from "../fakeBackend/FakeBackend";
import { Formio } from "formiojs";
import { waitFor } from "@testing-library/react";

describe("useFormioTranslations", () => {
  const projectUrl = "http://myProject.example.org";
  let fetchSpy;
  let formioTranslations;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, "fetch");
    const fetchAppGlue = new InprocessQuipApp(dispatcherWithBackend(new FakeBackend()));
    fetchSpy.mockImplementation(fetchAppGlue.fetchImpl);
    jest.useFakeTimers();

    formioTranslations = useFormioTranslations(projectUrl, new Formio(projectUrl), undefined);
  });

  afterEach(() => {
    fetchSpy.mockClear();
    jest.useRealTimers();
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
        `${projectUrl}/language/submission?data.name__regex=/^global(.${formPath})*$/gi&limit=null`,
        { headers: { "x-jwt-token": "" } }
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
      await waitFor(() => expect(translations).toBeDefined());
      translations.then((result) => {
        expect(result).toStrictEqual({
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
});
