import { Component, NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import { getDefaultPageMeta, getFormMeta, getQueryParamSub } from "./page";

describe("page (util)", () => {
  describe("getFormMeta", () => {
    it("uses default description when it is missing in form definition", () => {
      const form = {
        title: "Søknad om servicehund",
        components: [{ key: "randomkey", content: "Dette er en beskrivelse av skjemaet" }] as Component[],
      } as NavFormType;
      const meta = getFormMeta(form);
      expect(meta.PAGE_TITLE).toBe("Søknad om servicehund");
      expect(meta.PAGE_DESCRIPTION).toEqual(getDefaultPageMeta().PAGE_DESCRIPTION);
    });
  });

  describe("getQueryParamSub", () => {
    it("returns sub=paper", () => {
      const form = {
        properties: {
          innsending: "KUN_PAPIR",
        },
      } as NavFormType;
      const sub = getQueryParamSub(form);
      expect(sub).toBe("paper");
    });

    it("returns sub=digital", () => {
      const form = {
        properties: {
          innsending: "KUN_DIGITAL",
        },
      } as NavFormType;
      const sub = getQueryParamSub(form);
      expect(sub).toBe("digital");
    });

    it("returns undefined when both digital and paper are allowed", () => {
      const form = {
        properties: {
          innsending: "PAPIR_OG_DIGITAL",
        },
      } as NavFormType;
      const sub = getQueryParamSub(form);
      expect(sub).toBeUndefined();
    });

    it("returns undefined when there is no submission allowed", () => {
      const form = {
        properties: {
          innsending: "INGEN",
        },
      } as NavFormType;
      const sub = getQueryParamSub(form);
      expect(sub).toBeUndefined();
    });
  });
});
