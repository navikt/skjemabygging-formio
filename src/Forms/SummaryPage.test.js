import { createFormSummaryObject, handleComponent } from "./SummaryPage";

const keyFromLabel = (label = "") => label.toLowerCase().replace(/\s/gi, "");

const createDummyTextfield = (label = "Tekstfelt") => ({
  label,
  key: keyFromLabel(label),
  type: "textfield",
});

const createDummyEmail = (label = "Email") => ({
  label,
  key: keyFromLabel(label),
  type: "email",
});

const createDummyContentElement = (label = "Content") => ({
  label,
  key: keyFromLabel(label),
  type: "content",
});

const createDummyHTMLElement = (label = "HTMLelement") => ({
  label,
  key: keyFromLabel(label),
  type: "htmlelement",
});

const createDummyContainerElement = (label = "Container", components) => ({
  label,
  type: keyFromLabel(label),
  key: "container",
  components,
});

const createDummyNavSkjemagruppe = (label = "NavSkjemagruppe", components) => ({
  label: `${label}-label`,
  legend: `${label}-legend`,
  type: "navSkjemagruppe",
  key: keyFromLabel(label),
  components,
});

const submissionData = {
  email: "email-verdi",
  tekstfelt: "tekstfelt-verdi",
};

const createPanelObject = (label, components) => ({
  label,
  key: keyFromLabel(label),
  type: "panel",
  components,
});

const createFormObject = (panels = []) => ({
  components: panels,
});

describe("When handling component", () => {
  describe("form fields", () => {
    it("are added with value from submission", () => {
      const actual = handleComponent(createDummyTextfield(), submissionData, []);
      expect(actual).toContainEqual({
        label: "Tekstfelt",
        type: "textfield",
        value: "tekstfelt-verdi",
      });
    });

    it("are not added if they don't have a submission value", () => {
      const actual = handleComponent(createDummyTextfield(), {}, []);
      expect(actual.find((component) => component.type === "textfield")).toBeUndefined();
    });
  });

  describe("content", () => {
    it("is filtered away", () => {
      const actual = handleComponent(createDummyContentElement(), submissionData, []);
      expect(actual.find((component) => component.type === "content")).toBeUndefined();
    });
  });
  describe("htmlelement", () => {
    it("is filtered away", () => {
      const actual = handleComponent(createDummyHTMLElement(), submissionData, []);
      expect(actual.find((component) => component.type === "htmlelement")).toBeUndefined();
    });
  });

  describe("container", () => {
    it("is never included", () => {
      const actual = handleComponent(createDummyContainerElement(), submissionData, []);
      expect(actual.find((component) => component.type === "container")).toBeUndefined();
    });

    it("is ignored, and subcomponents that should not be included are also ignored", () => {
      const actual = handleComponent(
        createDummyContainerElement("Container", [createDummyContentElement(), createDummyTextfield()]),
        {},
        []
      );
      expect(actual.find((component) => component.type === "container")).toBeUndefined();
      expect(actual.find((component) => component.type === "content")).toBeUndefined();
      expect(actual.find((component) => component.type === "textfield")).toBeUndefined();
    });

    it("is ignored, but subcomponents that should be included are added", () => {
      const actual = handleComponent(
        createDummyContainerElement("Container", [createDummyContentElement(), createDummyTextfield()]),
        submissionData,
        []
      );
      expect(actual).toEqual([
        {
          label: "Tekstfelt",
          type: "textfield",
          value: "tekstfelt-verdi",
        },
      ]);
    });
  });

  describe("[navSkjemagruppe]", () => {
    it("is ignored if they have no subcomponents", () => {
      const actual = handleComponent(createDummyNavSkjemagruppe(), {}, []);
      expect(actual.find((component) => component.type === "navSkjemagruppe")).toBeUndefined();
    });

    it("uses legend and not label", () => {
      const actual = handleComponent(
        createDummyNavSkjemagruppe("NavSkjemagruppe", [createDummyTextfield()]),
        submissionData,
        []
      );
      const actualNavSkjemagruppe = actual.find((component) => component.type === "navSkjemagruppe");
      expect(actualNavSkjemagruppe).toBeDefined();
      expect(actualNavSkjemagruppe.label).toEqual("NavSkjemagruppe-legend");
    });
  });
});

describe("When creating form summary object", () => {
  describe("panels", () => {
    it("are added as arrays on the top level", () => {
      const actual = createFormSummaryObject(
        // TODO: Do we need to add components for this to be legal?
        createFormObject([createPanelObject("Panel 1"), createPanelObject("Panel 2"), createPanelObject("Panel 3")]),
        submissionData
      );
      expect(actual).toBeInstanceOf(Array);
      expect(actual.length).toEqual(3);
    });
  });
});
