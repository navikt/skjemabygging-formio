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

const createDummyRadioPanel = (
  label = "RadioPanel",
  values = [
    { label: "NO-label", value: "no" },
    { label: "YES-label", value: "yes" },
  ]
) => ({
  label,
  key: keyFromLabel(label),
  type: "radiopanel",
  values,
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
  key: keyFromLabel(label),
  type: "container",
  components,
});

const createDummyNavSkjemagruppe = (label = "NavSkjemagruppe", components) => ({
  label: `${label}-label`,
  legend: `${label}-legend`,
  key: keyFromLabel(label),
  type: "navSkjemagruppe",
  components,
});

const createDummyDataGrid = (label = "DataGrid", components) => ({
  label,
  key: keyFromLabel(label),
  type: "datagrid",
  rowTitle: "datagrid-row-title",
  components,
});

const createPanelObject = (label, components) => ({
  label,
  key: keyFromLabel(label),
  type: "panel",
  components,
});

const createFormObject = (panels = []) => ({
  components: panels,
});

const submissionData = {
  email: "email-verdi",
  tekstfelt: "tekstfelt-verdi",
};

describe("When handling component", () => {
  describe("form fields", () => {
    it("are added with value from submission", () => {
      const actual = handleComponent(createDummyTextfield(), submissionData, []);
      expect(actual).toContainEqual({
        label: "Tekstfelt",
        key: "tekstfelt",
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
        { container: submissionData },
        []
      );
      expect(actual).toEqual([
        {
          label: "Tekstfelt",
          key: "tekstfelt",
          type: "textfield",
          value: "tekstfelt-verdi",
        },
      ]);
    });
  });

  describe("navSkjemagruppe", () => {
    it("is ignored if it has no subcomponents", () => {
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

  describe("DataGrid", () => {
    it("is ignored if it has no subComponents", () => {
      const actual = handleComponent(createDummyDataGrid(), {}, []);
      expect(actual.find((component) => component.type === "datagrid")).toBeUndefined();
    });

    it("is ignored if subComponents don't have submissions", () => {
      const actual = handleComponent(
        createDummyDataGrid("Datagrid", [createDummyTextfield(), createDummyEmail(), createDummyRadioPanel()]),
        { datagrid: [] },
        []
      );
      expect(actual.find((component) => component.type === "datagrid")).toBeUndefined();
    });

    it("renders datagrid as expected", () => {
      const actual = handleComponent(
        createDummyDataGrid("DataGrid", [createDummyTextfield()]),
        { datagrid: [submissionData] },
        []
      );

      expect(actual).toEqual([
        {
          label: "DataGrid",
          key: "datagrid",
          type: "datagrid",
          value: [
            {
              type: "datagrid-row",
              label: "datagrid-row-title",
              key: "datagrid-row-0",
              components: [{ label: "Tekstfelt", value: "tekstfelt-verdi", key: "tekstfelt", type: "textfield" }],
            },
          ],
        },
      ]);
    });
  });
});

describe("When creating form summary object", () => {
  it("it is created as it should", () => {
    const actual = createFormSummaryObject(
      createFormObject([
        createPanelObject("Panel that should not be included", [
          createDummyContentElement("Content that should be ignored"),
          createDummyHTMLElement("HTMLElement that should be ignored"),
          createDummyContainerElement("Container that should be ignored"),
          createDummyNavSkjemagruppe("NavSkjemagruppe that should be ignored"),
          createDummyDataGrid("Datagrid that should be ignored because it is empty"),
          createDummyDataGrid("Datagrid that contains components that should be ignored", [
            createDummyContentElement("Content that should be ignored"),
            createDummyNavSkjemagruppe("NavSkjemagruppe that should be ignored"),
            createDummyDataGrid("Datagrid that should be ignored"),
          ]),
        ]),
        createPanelObject("Panel with simple fields that should all be included", [
          createDummyTextfield("Simple Textfield"),
          createDummyEmail("Simple Email"),
        ]),
        createPanelObject("Panel with container", [
          createDummyContainerElement("Container", [
            createDummyTextfield("Textfield in container"),
            createDummyEmail("Email in container"),
          ]),
        ]),
        createPanelObject("Panel with navSkjemagruppe", [
          createDummyNavSkjemagruppe("NavSkjemagruppe", [
            createDummyTextfield("Textfield in NavSkjemagruppe"),
            createDummyEmail("Email in NavSkjemagruppe"),
          ]),
        ]),
        createPanelObject("Panel with radioPanel", [createDummyRadioPanel("RadioPanel")]),
      ]),
      {
        simpletextfield: "simpletextfield-value",
        simpleemail: "simpleemail-value",
        container: {
          textfieldincontainer: "textfieldincontainer-value",
          emailincontainer: "emailincontainer-value",
        },
        textfieldinnavskjemagruppe: "textfieldinnavskjemagruppe-value",
        emailinnavskjemagruppe: "emailinnavskjemagruppe-value",
        radiopanel: "yes",
      }
    );
    expect(actual).toEqual([
      {
        label: "Panel with simple fields that should all be included",
        key: "panelwithsimplefieldsthatshouldallbeincluded",
        type: "panel",
        components: [
          {
            label: "Simple Textfield",
            key: "simpletextfield",
            type: "textfield",
            value: "simpletextfield-value",
          },
          {
            label: "Simple Email",
            key: "simpleemail",
            type: "email",
            value: "simpleemail-value",
          },
        ],
      },
      {
        label: "Panel with container",
        key: "panelwithcontainer",
        type: "panel",
        components: [
          {
            label: "Textfield in container",
            key: "textfieldincontainer",
            type: "textfield",
            value: "textfieldincontainer-value",
          },

          {
            label: "Email in container",
            key: "emailincontainer",
            type: "email",
            value: "emailincontainer-value",
          },
        ],
      },
      {
        label: "Panel with navSkjemagruppe",
        key: "panelwithnavskjemagruppe",
        type: "panel",
        components: [
          {
            label: "NavSkjemagruppe-legend",
            key: "navskjemagruppe",
            type: "navSkjemagruppe",
            components: [
              {
                label: "Textfield in NavSkjemagruppe",
                key: "textfieldinnavskjemagruppe",
                type: "textfield",
                value: "textfieldinnavskjemagruppe-value",
              },
              {
                label: "Email in NavSkjemagruppe",
                key: "emailinnavskjemagruppe",
                type: "email",
                value: "emailinnavskjemagruppe-value",
              },
            ],
          },
        ],
      },
      {
        label: "Panel with radioPanel",
        key: "panelwithradiopanel",
        type: "panel",
        components: [
          {
            label: "RadioPanel",
            key: "radiopanel",
            type: "radiopanel",
            value: "YES-label",
          },
        ],
      },
    ]);
  });

  describe("panels", () => {
    it("are added as arrays on the top level", () => {
      const actual = createFormSummaryObject(
        // TODO: Do we need to add components for this to be legal?
        createFormObject([
          createPanelObject("Panel 1", [createDummyTextfield()]),
          createPanelObject("Panel 2", [createDummyEmail()]),
        ]),
        submissionData
      );
      expect(actual).toBeInstanceOf(Array);
      expect(actual.length).toEqual(2);
    });
  });
});
