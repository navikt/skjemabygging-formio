import { createFormSummaryObject, handleComponent } from "./SummaryPage";

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

const dummyNavSkjemagruppe = {
  label: "NavSkjemagruppe-label",
  legend: "NavSkjemagruppe-legend",
  type: "navSkjemagruppe",
  key: "navSkjemagruppe",
};

const submissionData = {
  email: "email-verdi",
  tekstfelt: "tekstfelt-verdi",
};

const createPanelObject = (label, components) => ({
  label,
  key: label.toLowerCase().replace(" ", ""),
  type: "panel",
  components,
});

const createFormObject = (panels = []) => ({
  components: panels,
});

describe("When handling component", () => {
  describe("form fields", () => {
    it("are added with value from submission", () => {
      const actual = handleComponent(dummyTextfield, submissionData, []);
      expect(actual).toContainEqual({
        label: "Tekstfelt",
        type: "textfield",
        value: "tekstfelt-verdi",
      });
    });

    it("are not added if they don't have a submission value", () => {
      const actual = handleComponent(dummyTextfield, {}, []);
      expect(actual.find((component) => component.type === "textfield")).toBeUndefined();
    });
  });

  describe("content", () => {
    it("is filtered away", () => {
      const actual = handleComponent(dummyContentElement, submissionData, []);
      expect(actual.find((component) => component.type === "content")).toBeUndefined();
    });
  });
  describe("htmlelement", () => {
    it("is filtered away", () => {
      const actual = handleComponent(dummyHTMLElement, submissionData, []);
      expect(actual.find((component) => component.type === "htmlelement")).toBeUndefined();
    });
  });

  describe("container", () => {
    it("is never included", () => {
      const actual = handleComponent(dummyContainerElement, submissionData, []);
      expect(actual.find((component) => component.type === "container")).toBeUndefined();
    });

    it("is ignored, and subcomponents that should not be included are also ignored", () => {
      const actual = handleComponent(
        {
          ...dummyContainerElement,
          components: [dummyContentElement, dummyTextfield],
        },
        {},
        []
      );
      expect(actual.find((component) => component.type === "container")).toBeUndefined();
      expect(actual.find((component) => component.type === "content")).toBeUndefined();
      expect(actual.find((component) => component.type === "textfield")).toBeUndefined();
    });

    it("is ignored, but subcomponents that should be included are added", () => {
      const actual = handleComponent(
        {
          ...dummyContainerElement,
          components: [dummyContentElement, dummyTextfield],
        },
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
      const actual = handleComponent(dummyNavSkjemagruppe, {}, []);
      expect(actual.find((component) => component.type === "navSkjemagruppe")).toBeUndefined();
    });

    it("uses legend and not label", () => {
      const actual = handleComponent({ ...dummyNavSkjemagruppe, components: [dummyTextfield] }, submissionData, []);
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
        createFormObject([createPanelObject("Panel 1"), createPanelObject("Panel 2"), createPanelObject("Panel 3")]),
        submissionData
      );
      expect(actual).toBeInstanceOf(Array);
      expect(actual.length).toEqual(3);
    });
  });
});
