import { createFormSummaryObject } from "./SummaryPage";

const dummyTextfield = {
  label: "Tekstfelt",
  key: "tekstfelt",
  type: "textfield",
};

const dummyEmail = {
  label: "Email",
  key: "email",
  type: "email",
};

const dummyContentElement = {
  label: "Content",
  key: "content",
  type: "content",
};

const dummyHTMLElement = {
  label: "HTMLelement",
  key: "htmlelement",
  type: "htmlelement",
};

const dummyContainerElement = {
  label: "Container",
  type: "container",
  key: "container",
};

const dummyFieldset = {
  label: "Fieldset-label",
  legend: "Fieldset-legend",
  type: "fieldset",
  key: "fieldset",
};

const dummyNavSkjemagruppe = {
  label: "NavSkjemagruppe-label",
  legend: "NavSkjemagruppe-legend",
  type: "navSkjemagruppe",
  key: "navSkjemagruppe",
};

const createFormObject = (componentsForPanel1) => ({
  components: [
    {
      label: "Panel 1",
      key: "panel1",
      type: "panel",
      components: componentsForPanel1 ? componentsForPanel1 : undefined,
    },
    {
      label: "Panel 2",
      key: "panel1",
      type: "panel",
    },
    {
      label: "Panel 3",
      key: "panel1",
      type: "panel",
    },
  ],
});

const submissionData = {
  email: "email-verdi",
  tekstfelt: "tekstfelt-verdi",
};

const expectedFormSummaryObject = {};

describe("When creating form summary object", () => {
  it("panels are added as arrays on the top level", () => {
    const actual = createFormSummaryObject(createFormObject(), submissionData);
    expect(actual).toBeInstanceOf(Array);
    expect(actual.length).toEqual(3);
  });

  it("form fields in panels are added with value from submission", () => {
    const actual = createFormSummaryObject(createFormObject([dummyTextfield]), submissionData);
    expect(actual[0].components).toContainEqual({
      label: "Tekstfelt",
      type: "textfield",
      value: "tekstfelt-verdi",
    });
  });

  it("form fields in panels are not added if they don't have a submission value", () => {
    const actual = createFormSummaryObject(createFormObject([dummyTextfield]), {});
    expect(actual[0].components.find((component) => component.type === "textfield")).toBeUndefined();
    expect(actual[0].components).not.toContainEqual({
      label: "Tekstfelt",
      type: "textfield",
      value: undefined,
    });
  });

  describe("[content, htmlelement]", () => {
    it("is filtered away", () => {
      const actual = createFormSummaryObject(createFormObject([dummyContentElement, dummyHTMLElement]), submissionData);
      expect(actual[0].components).not.toContainEqual({
        label: "Content",
        type: "content",
        value: undefined,
      });
      expect(actual[0].components).not.toContainEqual({
        label: "HTMLelement",
        type: "htmlelement",
        value: undefined,
      });
    });
  });

  describe("container", () => {
    it("is ignored if it does not contain any subcomponents", () => {
      const actual = createFormSummaryObject(createFormObject([dummyContainerElement]), submissionData);
      expect(actual[0].components.find((component) => component.type === "container")).toBeUndefined();
    });

    it("is ignored, and subcomponents that should not be included are also ignored", () => {
      const actual = createFormSummaryObject(
        createFormObject([
          {
            ...dummyContainerElement,
            components: [dummyContentElement, dummyTextfield],
          },
        ]),
        {} // Textfield has no value, so it should not be included
      );
      expect(actual[0].components).not.toContainEqual({
        label: "Tekstfelt",
        type: "textfield",
        value: undefined,
      });
    });

    it("is ignored, but subcomponents that should be included are added", () => {
      const actual = createFormSummaryObject(
        createFormObject([
          {
            ...dummyContainerElement,
            components: [dummyContentElement, dummyTextfield],
          },
        ]),
        submissionData // Textfield has no value, so it should not be included
      );
      expect(actual[0].components).toContainEqual({
        label: "Tekstfelt",
        type: "textfield",
        value: "tekstfelt-verdi",
      });
    });
  });

  describe("[fieldset, navSkjemagruppe]", () => {
    it("is ignored if they have no subcomponents", () => {
      const actual = createFormSummaryObject(createFormObject([dummyFieldset, dummyNavSkjemagruppe]), {});
      expect(actual[0].components.find((component) => component.type === "fieldset")).toBeUndefined();
      expect(actual[0].components.find((component) => component.type === "navSkjemagruppe")).toBeUndefined();
    });

    it("uses legend and not label", () => {
      const actual = createFormSummaryObject(
        createFormObject([
          {
            ...dummyFieldset,
            components: [dummyTextfield],
          },
          {
            ...dummyNavSkjemagruppe,
            components: [dummyEmail],
          },
        ]),
        submissionData
      );
      const actualFieldsetInFormSummaryObject = actual[0].components.find((component) => component.type === "fieldset");
      const actualNavSkjemagruppeInFormSummaryObject = actual[0].components.find(
        (component) => component.type === "navSkjemagruppe"
      );
      expect(actualFieldsetInFormSummaryObject).toBeDefined();
      expect(actualFieldsetInFormSummaryObject.label).toEqual("Fieldset-legend");
      expect(actualNavSkjemagruppeInFormSummaryObject).toBeDefined();
      expect(actualNavSkjemagruppeInFormSummaryObject.label).toEqual("NavSkjemagruppe-legend");
    });
  });
});
