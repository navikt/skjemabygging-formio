import { createFormSummaryObject, handleComponent } from "./formSummaryUtil";
import MockedComponentObjectForTest from "./MockedComponentObjectForTest";
const {
  createDummyContainerElement,
  createDummyContentElement,
  createDummyDataGrid,
  createDummyEmail,
  createDummyHTMLElement,
  createDummyAlertstripe,
  createDummyNavSkjemagruppe,
  createDummyRadioPanel,
  createDummySelectboxes,
  createDummyTextfield,
  createFormObject,
  createPanelObject,
} = MockedComponentObjectForTest;

const mockedTranslate = (value) => value;

const dummySubmission = {
  data: {
    email: "email-verdi",
    tekstfelt: "tekstfelt-verdi",
  },
};

describe("When handling component", () => {
  describe("panel", () => {
    it("is ignored if it has no subComponents", () => {
      const actual = handleComponent(createPanelObject(), {}, [], "", mockedTranslate);
      expect(actual.find((component) => component.type === "panel")).toBeUndefined();
    });

    it("is ignored if subComponents don't have submissions", () => {
      const actual = handleComponent(
        createPanelObject("Panel", [createDummyTextfield(), createDummyEmail(), createDummyRadioPanel()]),
        {},
        [],
        "",
        mockedTranslate
      );
      expect(actual.find((component) => component.type === "panel")).toBeUndefined();
    });

    it("uses title instead of label", () => {
      const actual = handleComponent(
        createPanelObject("PanelTitle", [createDummyTextfield("TextField")], "PanelLabel (should not be included)"),
        { data: { textfield: "textValue" } },
        [],
        "",
        mockedTranslate
      );
      expect(actual).toEqual([
        {
          label: "PanelTitle",
          key: "paneltitle",
          type: "panel",
          components: [{ label: "TextField", key: "textfield", type: "textfield", value: "textValue" }],
        },
      ]);
    });
  });

  describe("form fields", () => {
    it("are added with value from submission", () => {
      const actual = handleComponent(createDummyTextfield(), dummySubmission, [], "", mockedTranslate);
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
      const actual = handleComponent(createDummyContentElement(), dummySubmission, []);
      expect(actual.find((component) => component.type === "content")).toBeUndefined();
    });
  });
  describe("htmlelement", () => {
    it("is added if it contains content for PDF", () => {
      const actual = handleComponent(
        createDummyHTMLElement("HTML", "", "contentForPdf"),
        dummySubmission,
        [],
        mockedTranslate()
      );
      expect(actual.find((component) => component.type === "htmlelement").value).toBe("contentForPdf");
    });

    it("is filtered out if it has no content for PDF", () => {
      const actual = handleComponent(createDummyHTMLElement(), dummySubmission, [], mockedTranslate());
      expect(actual.find((component) => component.type === "htmlelement")).toBeUndefined();
    });
  });

  describe("Alertstripe", () => {
    it("is added if it contains content for PDF", () => {
      const actual = handleComponent(
        createDummyAlertstripe("HTML", "contentForPdf"),
        dummySubmission,
        [],
        mockedTranslate()
      );
      expect(actual.find((component) => component.type === "alertstripe").value).toBe("contentForPdf");
    });

    it("is filtered out if it has no content for PDF", () => {
      const actual = handleComponent(createDummyAlertstripe(), dummySubmission, [], mockedTranslate());
      expect(actual.find((component) => component.type === "alertstripe")).toBeUndefined();
    });
  });

  describe("container", () => {
    it("is never included", () => {
      const actual = handleComponent(createDummyContainerElement(), dummySubmission, [], "", mockedTranslate);
      expect(actual.find((component) => component.type === "container")).toBeUndefined();
    });

    it("is ignored, and subcomponents that should not be included are also ignored", () => {
      const actual = handleComponent(
        createDummyContainerElement("Container", [createDummyContentElement(), createDummyTextfield()]),
        {},
        [],
        "",
        mockedTranslate
      );
      expect(actual.find((component) => component.type === "container")).toBeUndefined();
      expect(actual.find((component) => component.type === "content")).toBeUndefined();
      expect(actual.find((component) => component.type === "textfield")).toBeUndefined();
    });

    it("is ignored, but subcomponents that should be included are added", () => {
      const actual = handleComponent(
        createDummyContainerElement("Container", [createDummyContentElement(), createDummyTextfield()]),
        { data: { container: dummySubmission.data } },
        [],
        "",
        mockedTranslate
      );
      expect(actual).toEqual([
        {
          label: "Tekstfelt",
          key: "container.tekstfelt",
          type: "textfield",
          value: "tekstfelt-verdi",
        },
      ]);
    });

    it("Maps the correct submission value to the correct field", () => {
      const actual = handleComponent(
        createPanelObject("Panel", [
          createDummyTextfield(),
          createDummyContainerElement("Level 1 Container", [
            createDummyTextfield(),
            createDummyContainerElement("Level 2 Container", [createDummyTextfield()]),
          ]),
        ]),
        {
          data: {
            tekstfelt: "Utenfor container",
            level1container: { tekstfelt: "Inni container 1", level2container: { tekstfelt: "Inni container 2" } },
          },
        },
        [],
        "",
        mockedTranslate
      );
      expect(actual).toEqual([
        {
          key: "panel",
          label: "Panel",
          type: "panel",
          components: [
            {
              key: "tekstfelt",
              label: "Tekstfelt",
              type: "textfield",
              value: "Utenfor container",
            },
            {
              key: "level1container.tekstfelt",
              label: "Tekstfelt",
              type: "textfield",
              value: "Inni container 1",
            },
            {
              key: "level2container.tekstfelt",
              label: "Tekstfelt",
              type: "textfield",
              value: "Inni container 2",
            },
          ],
        },
      ]);
    });
  });

  describe("navSkjemagruppe", () => {
    it("is ignored if it has no subcomponents", () => {
      const actual = handleComponent(createDummyNavSkjemagruppe(), {}, [], "", mockedTranslate);
      expect(actual.find((component) => component.type === "navSkjemagruppe")).toBeUndefined();
    });

    it("uses legend and not label", () => {
      const actual = handleComponent(
        createDummyNavSkjemagruppe("NavSkjemagruppe", [createDummyTextfield()]),
        dummySubmission,
        [],
        "",
        mockedTranslate
      );
      const actualNavSkjemagruppe = actual.find((component) => component.type === "navSkjemagruppe");
      expect(actualNavSkjemagruppe).toBeDefined();
      expect(actualNavSkjemagruppe.label).toEqual("NavSkjemagruppe-legend");
    });
  });

  describe("Selectboxes", () => {
    it("adds each option that is selected", () => {
      const actual = handleComponent(
        createDummySelectboxes(),
        { data: { selectboxes: { milk: true, bread: false, juice: true } } },
        [],
        "",
        mockedTranslate
      );
      expect(actual).toEqual([
        {
          label: "Selectboxes",
          key: "selectboxes",
          type: "selectboxes",
          value: ["Milk", "Juice"],
        },
      ]);
    });
    it("does not add anything if no options are selected", () => {
      const actual = handleComponent(
        createDummySelectboxes(),
        { data: { selectboxes: { milk: false, bread: false, juice: false } } },
        [],
        "",
        mockedTranslate
      );
      expect(actual).toEqual([]);
    });
  });

  describe("DataGrid", () => {
    it("is ignored if it has no subComponents", () => {
      const actual = handleComponent(createDummyDataGrid(), {}, [], "", mockedTranslate);
      expect(actual.find((component) => component.type === "datagrid")).toBeUndefined();
    });

    it("is ignored if subComponents don't have submissions", () => {
      const actual = handleComponent(
        createDummyDataGrid("Datagrid", [createDummyTextfield(), createDummyEmail(), createDummyRadioPanel()]),
        { data: { datagrid: [] } },
        [],
        "",
        mockedTranslate
      );
      expect(actual.find((component) => component.type === "datagrid")).toBeUndefined();
    });

    it("renders datagrid as expected", () => {
      const actual = handleComponent(
        createDummyDataGrid("DataGrid", [createDummyTextfield()]),
        { data: { datagrid: [dummySubmission.data] } },
        [],
        "",
        mockedTranslate
      );

      expect(actual).toEqual([
        {
          label: "DataGrid",
          key: "datagrid",
          type: "datagrid",
          components: [
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
        createPanelObject("Panel with containers nested in different layout components", [
          createDummyContainerElement("Container1", [
            createDummyNavSkjemagruppe("NavSkjemaGruppe", [
              createDummyTextfield("Field"),
              createDummyContainerElement("Container2", [
                createPanelObject("Panel", [
                  createDummyTextfield("Field"),
                  createDummyContainerElement("Container3", [
                    createDummyTextfield("Field"),
                    createDummyContainerElement("Container4", [
                      createDummyTextfield("Field"),
                      createDummyDataGrid("Datagrid", [createDummyTextfield("Field")]),
                    ]),
                  ]),
                ]),
              ]),
            ]),
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
        data: {
          simpletextfield: "simpletextfield-value",
          simpleemail: "simpleemail-value",
          container: {
            textfieldincontainer: "textfieldincontainer-value",
            emailincontainer: "emailincontainer-value",
          },
          container1: {
            field: "nested-field-1",
            container2: {
              field: "nested-field-2",
              container3: {
                field: "nested-field-3",
                container4: {
                  field: "nested-field-4",
                  datagrid: [
                    {
                      field: "field inside datagrid does not inherit container key",
                    },
                  ],
                },
              },
            },
          },
          textfieldinnavskjemagruppe: "textfieldinnavskjemagruppe-value",
          emailinnavskjemagruppe: "emailinnavskjemagruppe-value",
          radiopanel: "yes",
        },
      },
      mockedTranslate
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
            key: "container.textfieldincontainer",
            type: "textfield",
            value: "textfieldincontainer-value",
          },

          {
            label: "Email in container",
            key: "container.emailincontainer",
            type: "email",
            value: "emailincontainer-value",
          },
        ],
      },
      {
        label: "Panel with containers nested in different layout components",
        key: "panelwithcontainersnestedindifferentlayoutcomponents",
        type: "panel",
        components: [
          {
            label: "NavSkjemaGruppe-legend",
            key: "navskjemagruppe",
            type: "navSkjemagruppe",
            components: [
              {
                label: "Field",
                key: "container1.field",
                type: "textfield",
                value: "nested-field-1",
              },
              {
                label: "Panel",
                key: "panel",
                type: "panel",
                components: [
                  {
                    label: "Field",
                    key: "container2.field",
                    type: "textfield",
                    value: "nested-field-2",
                  },
                  {
                    label: "Field",
                    key: "container3.field",
                    type: "textfield",
                    value: "nested-field-3",
                  },
                  {
                    label: "Field",
                    key: "container4.field",
                    type: "textfield",
                    value: "nested-field-4",
                  },
                  {
                    label: "Datagrid",
                    key: "datagrid",
                    type: "datagrid",
                    components: [
                      {
                        label: "datagrid-row-title",
                        key: "datagrid-row-0",
                        type: "datagrid-row",
                        components: [
                          {
                            label: "Field",
                            key: "field",
                            type: "textfield",
                            value: "field inside datagrid does not inherit container key",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
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
        createFormObject([
          createPanelObject("Panel 1", [createDummyTextfield()]),
          createPanelObject("Panel 2", [createDummyEmail()]),
        ]),
        dummySubmission,
        mockedTranslate
      );
      expect(actual).toBeInstanceOf(Array);
      expect(actual.length).toEqual(2);
    });
  });
});
