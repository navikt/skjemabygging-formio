import form from "../../../bygger/server/src/util/testData/nav100750";
import { Component, FormPropertiesType, NavFormType } from "../form";
import { navFormUtils } from "../index";
import tool, { DiffStatus, generateNavFormDiff } from "./formDiffingTool";
import testdataPublishedForm from "./testdata/diff/published-form";

describe("formDiffingTool", () => {
  it("Diff same form", () => {
    const changes = generateNavFormDiff(form, form);
    expect(changes).toBeUndefined();
  });

  describe("generateNavFormSettingsDiff", () => {
    const publishedProperties: FormPropertiesType = {
      isTestForm: true,
      tema: "BIL",
      innsending: "PAPIR_OG_DIGITAL",
      skjemanummer: "NAV 12.13-14",
      signatures: [
        {
          key: "12790e44-15da-40b4-8168-a5afaf6f92b7",
          label: "Lege",
          description: "Det bekreftes at søker trenger dette",
        },
      ],
    } as FormPropertiesType;

    const publishedForm: NavFormType = {
      title: "Søknad om penger",
      properties: publishedProperties,
    } as NavFormType;

    it("reports diff on form title", () => {
      const testform = {
        ...publishedForm,
        title: "Søknad om servicehund",
      } as NavFormType;
      const diff = tool.generateNavFormSettingsDiff(publishedForm, testform);
      expect(diff).toEqual({
        title: {
          status: DiffStatus.CHANGED,
          originalValue: "Søknad om penger",
          value: "Søknad om servicehund",
        },
      });
    });

    it("reports diff on tema", () => {
      const testform = {
        ...publishedForm,
        properties: {
          ...publishedProperties,
          tema: "YRK",
        },
      } as NavFormType;
      const diff = tool.generateNavFormSettingsDiff(publishedForm, testform);
      expect(diff).toEqual({
        tema: {
          status: DiffStatus.CHANGED,
          originalValue: "BIL",
          value: "YRK",
        },
      });
    });

    describe("signatures", () => {
      it("reports diff on signatures", () => {
        const testform = {
          ...publishedForm,
          properties: {
            ...publishedProperties,
            signatures: [
              {
                key: "12790e44-15da-40b4-8168-a5afaf6f92b7",
                label: "Fastlege",
                description: "Det bekreftes at søker trenger dette",
              },
              {
                label: "Mor",
                description: "Mor må signere",
                key: "0bf65131-7ea6-4430-9a0d-fcf937f1c039",
              },
            ],
          },
        } as NavFormType;
        const diff = tool.generateNavFormSettingsDiff(publishedForm, testform);
        expect(diff).toEqual({
          signatures: {
            "12790e44-15da-40b4-8168-a5afaf6f92b7": {
              status: "Endring",
              originalValue: {
                label: "Lege",
                description: "Det bekreftes at søker trenger dette",
              },
              value: {
                label: "Fastlege",
                description: "Det bekreftes at søker trenger dette",
              },
            },
            "0bf65131-7ea6-4430-9a0d-fcf937f1c039": {
              status: "Ny",
              value: {
                label: "Mor",
                description: "Mor må signere",
              },
            },
          },
        });
      });

      it("reports diff only on new signature", () => {
        const testform = {
          ...publishedForm,
          properties: {
            ...publishedProperties,
            signatures: [
              {
                key: "12790e44-15da-40b4-8168-a5afaf6f92b7",
                label: "Lege",
                description: "Det bekreftes at søker trenger dette",
              },
              {
                label: "Mor",
                description: "Mor må signere",
                key: "0bf65131-7ea6-4430-9a0d-fcf937f1c039",
              },
            ],
          },
        } as NavFormType;
        const diff = tool.generateNavFormSettingsDiff(publishedForm, testform);
        expect(diff).toEqual({
          signatures: {
            "0bf65131-7ea6-4430-9a0d-fcf937f1c039": {
              status: "Ny",
              value: {
                label: "Mor",
                description: "Mor må signere",
              },
            },
          },
        });
      });
    });

    it("ignores signatures on old format", () => {
      const publishedFormWithOldSignatures = {
        ...publishedForm,
        properties: {
          ...publishedProperties,
          signatures: {
            signature2:
              "NAV-enhet som erklærer at bedriften er godkjent som tiltaksarrangør for VTA i ordinær virksomhet for ovennevnte person",
            signature1: "For Bedrift",
          },
        },
      };
      const testform = {
        ...publishedFormWithOldSignatures,
        properties: {
          ...publishedFormWithOldSignatures.properties,
          signatures: [
            { key: "1", label: "For Bedrift" },
            {
              key: "2",
              label:
                "NAV-enhet som erklærer at bedriften er godkjent som tiltaksarrangør for VTA i ordinær virksomhet for ovennevnte person",
            },
            { key: "3" },
          ],
        },
      } as NavFormType;
      const diff = tool.generateNavFormSettingsDiff(publishedFormWithOldSignatures, testform);
      expect(diff).toEqual({
        signatures: undefined,
      });
    });
  });

  describe("Diff against changes", () => {
    let newForm: any;

    beforeEach(() => {
      newForm = JSON.parse(JSON.stringify(form));
    });

    it("Diff modified date", () => {
      const modified = new Date().toISOString();
      newForm.modified = modified;
      const changes: any = generateNavFormDiff(form, newForm);
      expect(changes).toHaveProperty("type");
      expect(changes).toHaveProperty("title");
      expect(changes.diff.modified.originalValue).toBe(form.modified);
      expect(changes.diff.modified.value).toBe(modified);
      expect(changes.diff.modified.status).toBe(DiffStatus.CHANGED);
    });

    it("Diff component change", () => {
      const content = "New content";
      newForm.components[0].components[0].content = content;
      const changes: any = generateNavFormDiff(form, newForm);
      checkDefaultComponentsValues(changes.components[0]);
      checkDefaultComponentsValues(changes.components[0].components[0]);
      expect(changes.components[0].components[0].diff.content.originalValue).toBe(
        form.components[0].components[0].content
      );
      expect(changes.components[0].components[0].diff.content.value).toBe(content);
      expect(changes.components[0].components[0].diff.content.status).toBe(DiffStatus.CHANGED);
      expect(changes.components[0].components[0].status).toBe(DiffStatus.CHANGED);
    });

    it("Diff element order", () => {
      const value0 = form.components[0].components[1].values[0];
      const value1 = form.components[0].components[1].values[1];
      newForm.components[0].components[1].values[1] = value0;
      newForm.components[0].components[1].values[0] = value1;
      const changes: any = generateNavFormDiff(form, newForm);
      checkDefaultComponentsValues(changes.components[0]);
      checkDefaultComponentsValues(changes.components[0].components[0]);
      expect(changes.components[0].components[0]).toHaveProperty("diff");
      expect(changes.components[0].components[0].diff.values.status).toBe(DiffStatus.CHANGED);
    });

    it("Diff component order", () => {
      const comp0 = form.components[0].components[0];
      const comp1 = form.components[0].components[1];
      newForm.components[0].components[1] = comp0;
      newForm.components[0].components[0] = comp1;
      const changes: any = generateNavFormDiff(form, newForm);
      checkDefaultComponentsValues(changes.components[0]);
      checkDefaultComponentsValues(changes.components[0].components[0]);
      expect(changes.components[0].components[0].id).toBeUndefined();
      expect(changes.components[0].components[0].originalIndex).toBe(1);
      expect(changes.components[0].components[1].id).toBeUndefined();
      expect(changes.components[0].components[1].originalIndex).toBe(0);
    });
  });

  describe("checkComponentDiff", () => {
    const publishedForm: NavFormType = testdataPublishedForm as unknown as NavFormType;
    const getComp = (key: string) => navFormUtils.findByKey(key, publishedForm.components) as Component;

    it("has no diff when form is not published", () => {
      const comp = getComp("fornavn");
      const changes = tool.checkComponentDiff(comp, undefined);
      expect(changes).toBeNull();
    });
    it("has no diff when component is not changed", () => {
      const comp = getComp("fornavn");
      const changes = tool.checkComponentDiff(comp, publishedForm);
      expect(changes.status).toBeUndefined();
      expect(changes.diff).toBeUndefined();
    });
    it("marks label as changed, but ignores id", () => {
      const comp = {
        ...getComp("fornavn"),
        label: "Oppgi fornavn",
        id: "e123456", // id endrer seg automatisk
      };
      const changes = tool.checkComponentDiff(comp, publishedForm);
      expect(changes.status).toEqual(DiffStatus.CHANGED);
      expect(changes.diff).toBeDefined();
      expect(Object.keys(changes.diff)).toHaveLength(1);
      expect(changes.diff.label).toEqual({
        originalValue: "Fornavn",
        status: DiffStatus.CHANGED,
        value: "Oppgi fornavn",
      });
      expect(changes.diff.id).toBeUndefined();
    });
    it("marks ", () => {
      const comp = {
        ...getComp("fornavn"),
        defaultValue: "Kasper",
      };
      const changes = tool.checkComponentDiff(comp, publishedForm);
      expect(changes.status).toEqual(DiffStatus.CHANGED);
      expect(changes.diff).toBeDefined();
      expect(Object.keys(changes.diff)).toHaveLength(1);
      expect(changes.diff.defaultValue).toEqual({
        originalValue: "",
        status: DiffStatus.CHANGED,
        value: "Kasper",
      });
    });
  });
});

const checkDefaultComponentsValues = (component: object) => {
  expect(component).not.toHaveProperty("id");
  expect(component).toHaveProperty("key");
  expect(component).toHaveProperty("type");
  expect(component).toHaveProperty("label");
};
