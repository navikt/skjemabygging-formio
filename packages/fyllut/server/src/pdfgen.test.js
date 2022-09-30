import { DateTime } from "luxon";
import { Pdfgen, PdfgenPapir } from "./pdfgen";

const createComplexSubmission = () => ({
  data: {
    personalia: {
      fornavn: "Syver",
      etternavn: "Enstad",
      fodselsnummerDNummer: "123456 78911",
    },
    harDuHattAndreInntekter: "nei",
    inntekt3: 0,
    sum: 10,
    tall: 10,
    summeringskonteiner: { sum: 3702 },
  },
  metadata: {
    pathName: "/skjema/testchristianogmona",
  },
  state: "submitted",
});

const createComplexFormDefinition = () => ({
  _id: "5f2812a61cd355000301f0d0",
  type: "form",
  tags: ["nav-skjema"],
  owner: "5ee0eacc7665226ea32fd389",
  display: "wizard",
  name: "testChristianOgMona",
  title: "Test Christian og Mona",
  path: "testchristianogmona",
  machineName: "testChristianOgMona",
  components: [
    {
      label: "HTML",
      key: "html",
      type: "htmlelement",
      input: false,
      id: "e5lcez",
    },
    {
      title: "Personalia",
      key: "personalia1",
      type: "panel",
      label: "Panel",
      input: false,
      id: "edfcko9",
      components: [
        {
          label: "Personalia",
          key: "personalia",
          type: "container",
          input: true,
          id: "ehnaj4mb",
          components: [
            {
              label: "Fornavn",
              type: "textfield",
              key: "fornavn",
              input: true,
              placeholder: "Fornavn",
              id: "e2i3kg5",
            },
            {
              label: "Etternavn",
              type: "textfield",
              key: "etternavn",
              input: true,
              placeholder: "Etternavn",
              id: "eu4ap99",
            },
            {
              key: "fodselsnummerDNummer",
              type: "fnrfield",
              input: true,
              label: "Fødselsnummer / D-nummer",
              id: "ecrz8yq",
            },
          ],
        },
        {
          label: "Har du hatt andre inntekter?",
          values: [
            { label: "Ja", value: "ja", shortcut: "" },
            { label: "Nei", value: "nei", shortcut: "" },
          ],
          key: "harDuHattAndreInntekter",
          type: "radiopanel",
          input: true,
          id: "ekmagkp",
        },
        {
          label: "Inntekt",
          key: "inntekt3",
          type: "currency",
          input: true,
          id: "ei5wbp",
        },
        {
          label: "Sum",
          key: "sum",
          type: "currency",
          input: true,
          id: "e5cym5",
        },
        {
          label: "Tall",
          key: "tall",
          type: "number",
          input: true,
          id: "exkmmf8",
        },
      ],
    },
    {
      title: "Summeringstest",
      key: "summeringstest",
      type: "panel",
      label: "Panel",
      input: false,
      id: "esu4ts",
      components: [
        {
          label: "Summeringskonteiner",
          key: "summeringskonteiner",
          type: "container",
          input: true,
          id: "eym4bhm",
          components: [
            {
              label: "Sum",
              key: "sum",
              type: "currency",
              input: true,
              id: "e6lbwub",
            },
          ],
        },
      ],
    },
  ],
});

const createSubmission = () => ({
  state: "submitted",
  data: {
    tekstfelt: "dfghjk",
    T: "tcfghj",
    submit: true,
    belop: 3456,
  },
  metadata: {
    pathName: "/skjema/test56789",
  },
});

const createForm = () => ({
  name: "test56789",
  title: "test56789",
  path: "test56789",
  machineName: "test56789",
  components: [
    {
      label: "Tekstfelt",
      key: "tekstfelt",
      type: "textfield",
      input: true,
      id: "e3nxyxr",
    },
    {
      label: "2345t",
      key: "T",
      type: "radio",
      values: [
        { label: "tcfghj", value: "tcfghj" },
        { label: "Nei", value: "nei" },
      ],
      input: true,
      id: "edawfax",
    },
    {
      label: "Beløp",
      key: "belop",
      type: "currency",
      input: true,
      id: "edo3ppo",
    },
    {
      type: "button",
      label: "Send inn",
      key: "submit",
      action: "submit",
      input: true,
      id: "ekuuti",
    },
  ],
});

describe("generating doc definition", () => {
  function now() {
    return DateTime.fromObject({ year: 1992, day: 19, month: 10 });
  }

  function setupDocDefinitionContent(submission, form, version = "deadbeef", translations = {}) {
    const generator = new Pdfgen(submission, form, version, now(), translations);
    return generator.generateDocDefinition();
  }

  it("generates the docDef for an empty submission", () => {
    const submission = { data: {}, metadata: {} };
    const form = { title: "Smølfeskjema", components: [] };
    const version = "deadbeef-dirty";
    const docDefinitionContent = setupDocDefinitionContent(submission, form, version);
    expect(docDefinitionContent.content).toEqual([
      {
        style: "header",
        text: "Smølfeskjema",
      },
      { text: " ", style: "ingress" },
      [],
    ]);
    expect(docDefinitionContent.footer(1, 1).columns).toEqual([
      {
        width: "80%",
        text: "Skjemaet ble opprettet 19. oktober 1992 kl. 00:00 CET \n Skjemaversjon: deadbeef-dirty",
        alignment: "left",
      },
      {
        alignment: "right",
        text: "1 / 1",
      },
    ]);
  });

  it("generates table from form and submission", () => {
    const submission = createSubmission();
    const tableDef = setupDocDefinitionContent(submission, createForm()).content[2];
    expect(tableDef.table).toBeDefined();
    const tableData = tableDef.table.body.slice(0);
    expect(tableData).toEqual([
      ["Tekstfelt", "dfghjk"],
      ["2345t", "tcfghj"],
      ["Beløp", 3456],
    ]);
    expect(tableData).toHaveLength(Object.keys(submission.data).length - 1); // submit button is removed
  });

  it("does not render inputs with empty or undefined submission", () => {
    const submission = createSubmission();
    submission.data = { ...submission.data, tekstfelt: "", T: undefined };
    const tableDef = setupDocDefinitionContent(submission, createForm()).content[2];

    expect(tableDef.table).toBeDefined();
    const tableData = tableDef.table.body.slice(0);
    expect(tableData).toEqual([["Beløp", 3456]]);
    expect(tableData).toHaveLength(Object.keys(submission.data).length - 3); // submit button, T, and tekstfelt are removed
  });

  it("generates a table for each panel in a complex form", () => {
    const tableDefs = setupDocDefinitionContent(
      createComplexSubmission(),
      createComplexFormDefinition()
    ).content.filter((paragraph) => paragraph.table);

    expect(tableDefs).toHaveLength(2);
    expect(tableDefs[0].table.body).toEqual([
      ["Fornavn", "Syver"],
      ["Etternavn", "Enstad"],
      ["Fødselsnummer / D-nummer", "123456 78911"],
      ["Har du hatt andre inntekter?", "Nei"],
      ["Inntekt", 0],
      ["Sum", 10],
      ["Tall", 10],
    ]);
    expect(tableDefs[1].table.body).toEqual([["Sum", 3702]]);
  });

  it("handles a radio field inside a container", () => {
    const submission = { data: { composite: { nestedRadioField: "ja" } } };
    const formDefinition = {
      name: "Skuppel",
      components: [
        {
          type: "container",
          key: "composite",
          label: "Parent",
          input: true,
          components: [
            {
              label: "Child",
              type: "radiopanel",
              key: "nestedRadioField",
              input: true,
              values: [
                { value: "ja", label: "Seff" },
                { value: "nei", label: "Særlig..." },
              ],
            },
          ],
        },
      ],
    };
    const tableDef = setupDocDefinitionContent(submission, formDefinition).content[2];
    const tableData = tableDef.table.body;
    expect(tableData).toEqual([["Child", "Seff"]]);
  });

  it("removes submit button from pdf content", () => {
    const tableDef = setupDocDefinitionContent(createSubmission(), createForm()).content[2];
    expect(tableDef.table).toBeDefined();
    const tableData = tableDef.table.body.slice(0);
    expect(tableData).not.toEqual(expect.arrayContaining([expect.arrayContaining(["Send inn", true])]));
  });

  describe("NavSkjemaGruppe", () => {
    const createFormDefinitionWithNavSkjemaGruppe = () => ({
      name: "Form with navSkjemaGruppe",
      components: [
        {
          type: "navSkjemagruppe",
          key: "navSkjemagruppe",
          label: "navSkjemaGruppe-Label (should not be displayed)",
          legend: "navSkjemaGruppe-Legend",
          input: true,
          components: [
            {
              label: "Textfield inside NavSkjemaGruppe",
              key: "fieldInsideNavSkjemaGruppe",
              type: "textfield",
              input: true,
            },
          ],
        },
        {
          label: "Textfield outside NavSkjemaGruppe",
          key: "fieldOutsideNavSkjemaGruppe",
          type: "textfield",
          input: true,
        },
      ],
    });

    it("displays legend and content of navSkjemagruppe with empty translations", () => {
      const formDefinition = createFormDefinitionWithNavSkjemaGruppe();
      const submission = {
        data: {
          fieldInsideNavSkjemaGruppe: "Value for field inside skjemaGruppe",
          fieldOutsideNavSkjemaGruppe: "Value for field outside of skjemaGruppe",
        },
      };
      const tableDef = setupDocDefinitionContent(submission, formDefinition, "", {}).content[2];
      expect(tableDef.table.body).toEqual([
        [{ text: "navSkjemaGruppe-Legend", colSpan: 2, style: ["groupHeader"] }, ""],
        [{ text: "Textfield inside NavSkjemaGruppe", style: ["subComponent"] }, "Value for field inside skjemaGruppe"],
        ["Textfield outside NavSkjemaGruppe", "Value for field outside of skjemaGruppe"],
      ]);
    });

    it("does not display label for navSkjemaGruppe with empty submission", () => {
      const formDefinition = createFormDefinitionWithNavSkjemaGruppe();
      const submission = { data: { fieldOutsideNavSkjemaGruppe: "Value for field outside of skjemaGruppe" } };
      const tableDef = setupDocDefinitionContent(submission, formDefinition).content[2];
      expect(tableDef.table.body).toEqual([
        ["Textfield outside NavSkjemaGruppe", "Value for field outside of skjemaGruppe"],
      ]);
    });

    it("show translation for labels in navSkjemaGruppe", () => {
      const formDefinition = createFormDefinitionWithNavSkjemaGruppe();
      const submission = { data: { fieldOutsideNavSkjemaGruppe: "Value for field outside of skjemaGruppe" } };
      const translations = {
        "Value for field outside of skjemaGruppe": "Verdi for felt some utenfor skjemaGruppe",
        "Textfield outside NavSkjemaGruppe": "Textfelt utenfor skjemaGruppe",
      };
      const tableDef = setupDocDefinitionContent(submission, formDefinition, "version", translations).content[2];
      expect(tableDef.table.body).toEqual([
        ["Textfelt utenfor skjemaGruppe", "Verdi for felt some utenfor skjemaGruppe"],
      ]);
    });
  });

  describe("DataGrid", () => {
    const createSubmissionForDatagridRows = () => ({
      data: { datagrid: [{ fieldInsideDataGrid: "SomeValue" }, { fieldInsideDataGrid: "AnotherValue" }] },
    });

    const datagridComponent = {
      type: "datagrid",
      key: "datagrid",
      label: "DataGrid",
      input: true,
      components: [
        {
          label: "Tekstfelt",
          key: "fieldInsideDataGrid",
          type: "textfield",
          input: true,
        },
      ],
    };
    const createFormDefinitionWithDatagrid = () => ({
      name: "Datagrid",
      components: [
        datagridComponent,
        { label: "TextFieldOutsideOfDataGrid", key: "fieldOutsideDataGrid", type: "textfield", input: true },
      ],
    });

    const createFormDefinitionWithDatagridHavingRowTitle = () => ({
      name: "Datagrid with rowTitle",
      components: [{ ...datagridComponent, rowTitle: "DatagridRowTitle" }],
    });

    it("is not displayed when submission is empty", () => {
      const formDefinition = createFormDefinitionWithDatagrid();
      const submission = { data: { datagrid: [], fieldOutsideDataGrid: "ValueForFieldOutsideDataGrid" }, metadata: {} };
      const tableDef = setupDocDefinitionContent(submission, formDefinition).content[2];
      expect(tableDef.table.body).toEqual([["TextFieldOutsideOfDataGrid", "ValueForFieldOutsideDataGrid"]]);
    });

    it("displays all datagrid rows with row title with empty translation", () => {
      const formDefinition = createFormDefinitionWithDatagridHavingRowTitle();
      const submission = createSubmissionForDatagridRows();
      const tableDef = setupDocDefinitionContent(submission, formDefinition, "", {}).content[2];
      const tableData = tableDef.table.body;
      expect(tableData).toEqual([
        [{ text: "DataGrid", style: ["groupHeader"], colSpan: 2 }, ""],
        [{ text: "DatagridRowTitle", colSpan: 2, style: ["groupHeader", "subComponent"] }, ""],
        [{ text: "Tekstfelt", style: ["subComponent"] }, "SomeValue"],
        [{ text: "DatagridRowTitle", colSpan: 2, style: ["groupHeader", "subComponent"] }, ""],
        [{ text: "Tekstfelt", style: ["subComponent"] }, "AnotherValue"],
      ]);
    });

    it("displays all datagrid rows with empty row below it, when datagrid has no row title with empty translation", () => {
      const formDefinition = createFormDefinitionWithDatagrid();
      const submission = createSubmissionForDatagridRows();
      const tableDef = setupDocDefinitionContent(submission, formDefinition, "", {}).content[2];
      const tableData = tableDef.table.body;
      expect(tableData).toEqual([
        [{ text: "DataGrid", style: ["groupHeader"], colSpan: 2 }, ""],
        [{ text: "Tekstfelt", style: ["subComponent"] }, "SomeValue"],
        [{ text: " ", colSpan: 2 }],
        [{ text: "Tekstfelt", style: ["subComponent"] }, "AnotherValue"],
        [{ text: " ", colSpan: 2 }],
      ]);
    });

    it("displays all datagrid rows with translated row title", () => {
      const formDefinition = createFormDefinitionWithDatagridHavingRowTitle();
      const submission = createSubmissionForDatagridRows();
      const translations = {
        DataGrid: "DataGrid Translation",
        DatagridRowTitle: "DatagridRowTitle Translation",
        Tekstfelt: "Text field",
      };
      const tableDef = setupDocDefinitionContent(submission, formDefinition, "", translations).content[2];
      const tableData = tableDef.table.body;
      expect(tableData).toEqual([
        [{ text: "DataGrid Translation", style: ["groupHeader"], colSpan: 2 }, ""],
        [{ text: "DatagridRowTitle Translation", colSpan: 2, style: ["groupHeader", "subComponent"] }, ""],
        [{ text: "Text field", style: ["subComponent"] }, "SomeValue"],
        [{ text: "DatagridRowTitle Translation", colSpan: 2, style: ["groupHeader", "subComponent"] }, ""],
        [{ text: "Text field", style: ["subComponent"] }, "AnotherValue"],
      ]);
    });

    it("displays all datagrid rows with partial translated row title", () => {
      const formDefinition = createFormDefinitionWithDatagridHavingRowTitle();
      const submission = createSubmissionForDatagridRows();
      const translations = {
        DataGrid: "DataGrid Translation",
        DatagridRowTitle: "DatagridRowTitle Translation",
      };
      const tableDef = setupDocDefinitionContent(submission, formDefinition, "", translations).content[2];
      const tableData = tableDef.table.body;
      expect(tableData).toEqual([
        [{ text: "DataGrid Translation", style: ["groupHeader"], colSpan: 2 }, ""],
        [{ text: "DatagridRowTitle Translation", colSpan: 2, style: ["groupHeader", "subComponent"] }, ""],
        [{ text: "Tekstfelt", style: ["subComponent"] }, "SomeValue"],
        [{ text: "DatagridRowTitle Translation", colSpan: 2, style: ["groupHeader", "subComponent"] }, ""],
        [{ text: "Tekstfelt", style: ["subComponent"] }, "AnotherValue"],
      ]);
    });
  });

  describe("Selectboxes", () => {
    const createSelectboxesSubmission = (answers) => ({
      state: "submitted",
      data: { flervalg: answers },
    });

    const createSelectboxesFormDefinition = (values) => ({
      name: "testSelecebox",
      components: [
        {
          type: "selectboxes",
          key: "flervalg",
          label: "Flervalg",
          input: true,
          values: values.map((value) => ({ label: value, value: value.toLowerCase() })),
        },
      ],
    });

    it("adds a single list item if one option is selected", () => {
      const formDefinition = createSelectboxesFormDefinition(["Sugar", "Salt", "Pepper"]);
      const submission = createSelectboxesSubmission({ sugar: true, salt: false, pepper: false });
      const tableDef = setupDocDefinitionContent(submission, formDefinition).content[2];
      const tableData = tableDef.table.body;
      expect(tableData).toEqual([["Flervalg", { ul: ["Sugar"] }]]);
    });

    it("adds multiple list items if more than one option is selected", () => {
      const formDefinition = createSelectboxesFormDefinition(["Sugar", "Salt", "Pepper"]);
      const submission = createSelectboxesSubmission({ sugar: true, salt: false, pepper: true });
      const tableDef = setupDocDefinitionContent(submission, formDefinition).content[2];
      const tableData = tableDef.table.body;
      expect(tableData).toEqual([["Flervalg", { ul: ["Sugar", "Pepper"] }]]);
    });

    it("does not add anything if no options are selected", () => {
      const formDefinition = createSelectboxesFormDefinition(["Sugar", "Salt", "Pepper"]);
      const submission = createSelectboxesSubmission({ sugar: false, salt: false, pepper: false });
      const tableDef = setupDocDefinitionContent(submission, formDefinition).content[2];
      expect(tableDef.table).toBeUndefined();
    });

    it("display translated selected options", () => {
      const formDefinition = createSelectboxesFormDefinition(["Sugar", "Salt", "Pepper"]);
      const submission = createSelectboxesSubmission({ sugar: true, salt: false, pepper: true });
      const translations = {
        Flervalg: "Selectboxes",
        Sugar: "Sukker",
        Pepper: "Pepper",
        Salt: "Salt",
      };
      const tableDef = setupDocDefinitionContent(submission, formDefinition, "", translations).content[2];
      const tableData = tableDef.table.body;
      expect(tableData).toEqual([["Selectboxes", { ul: ["Sukker", "Pepper"] }]]);
    });
  });

  describe("Image", () => {
    const createSingleImageComponent = (imgName, showInPdf) => ({
      name: "singleImageComponent",
      components: [createImageComponent(imgName, showInPdf)],
    });

    const createMultipleImageComponents = (numberofImages, imgName, showInPdf) => {
      let multipleImgComponents = [];
      for (let i = 0; i < numberofImages; i++) {
        multipleImgComponents.push(createImageComponent(imgName + i.toString(), showInPdf));
      }

      return {
        name: "multipleImageComponents",
        components: multipleImgComponents,
      };
    };

    const createImageComponent = (imgName, showInPdf) => ({
      image: [
        {
          storage: "base64",
          name: imgName + ".jpeg",
          url: "data:image/jpeg;base64,/" + imgName,
          size: 31172,
          type: "image/jpeg",
          originalName: imgName + ".jpeg",
        },
      ],
      altText: "img altText",
      description: "img description",
      showInPdf,
      widthPercent: 100,
      label: "Bilde",
      type: "image",
      key: "bilde",
    });

    const createImageFormDefinitionWithMultiComponents = () => ({
      name: "testImage",
      components: [
        {
          label: "Image panel",
          type: "panel",
          components: [
            {
              label: "Tekstfelt",
              key: "tekstfelt1",
              type: "textfield",
              input: true,
            },
            createImageComponent("testImg", true),
            {
              label: "Tekstfelt",
              key: "tekstfelt2",
              type: "textfield",
              input: true,
            },
          ],
        },
      ],
    });

    it("adds a single image component but showInPdf is unchecked", () => {
      const formDefinition = createSingleImageComponent("testImg", false);
      const pdfContent = setupDocDefinitionContent({}, formDefinition).content;
      expect(pdfContent.length).toEqual(3);
    });

    it("adds a multiple image components but showInPdf unchecked", () => {
      const formDefinition = createMultipleImageComponents(3, "testImg", false);
      const pdfContent = setupDocDefinitionContent({}, formDefinition).content;
      expect(pdfContent.length).toEqual(3);
    });

    it("adds a single image component", () => {
      const formDefinition = createSingleImageComponent("img", true);
      const imageDef = setupDocDefinitionContent({}, formDefinition).content[2].table.body;

      expect(imageDef).toEqual([
        [
          {
            colSpan: 2,
            stack: [
              { style: "imageLabel", text: "Bilde" },
              {
                alt: "img altText",
                image: "data:image/jpeg;base64,/img",
                maxHeight: 400,
                maxWidth: 500,
                width: 500,
              },
              { style: "cursive", text: "img altText" },
            ],
          },
          "",
        ],
      ]);
    });

    it("adds image components and textfield components", () => {
      const formDefinition = createImageFormDefinitionWithMultiComponents();
      const pdfContent = setupDocDefinitionContent(
        { data: { tekstfelt1: "inputdata1 value", tekstfelt2: "inputdata2 value" } },
        formDefinition
      ).content[4].table.body;
      expect(pdfContent).toEqual([
        ["Tekstfelt", "inputdata1 value"],
        [
          {
            colSpan: 2,
            stack: [
              { style: "imageLabel", text: "Bilde" },
              {
                alt: "img altText",
                image: "data:image/jpeg;base64,/testImg",
                maxHeight: 400,
                maxWidth: 500,
                width: 500,
              },
              { style: "cursive", text: "img altText" },
            ],
          },
          "",
        ],
        ["Tekstfelt", "inputdata2 value"],
      ]);
      expect(pdfContent).toHaveLength(3);
    });
  });

  describe("PdfgenPapir", () => {
    describe("Form with labeled signature fields in properties", () => {
      const submission = { data: {}, metadata: {} };
      const form = {
        title: "With labeled signatures",
        components: [],
        properties: {
          hasLabeledSignatures: true,
          signatures: [{ label: "Label 1" }, { label: "Label 2" }, { label: "" }],
        },
      };
      const generator = new PdfgenPapir(submission, form, "", now());
      const doc_definition = generator.generateDocDefinition();

      const signature1 = doc_definition.content[7];
      const signature2 = doc_definition.content[12];

      it("generates document with signature 1 from properties", () => {
        expect(signature1.stack[0].text).toEqual("Label 1");
      });

      it("generates document with signature 2 from properties", () => {
        expect(signature2.stack[0].text).toEqual("Label 2");
      });

      it("generates signature even when label has an empty string", () => {
        const restOfDocument = doc_definition.content.slice(13);

        const hasSignature3 = restOfDocument.some(
          (line) =>
            line.hasOwnProperty("stack") &&
            line.stack.some((partOfSignature) => partOfSignature.includes("Underskrift"))
        );
        expect(hasSignature3).toBe(true);
      });
    });

    describe("Form with signature description", () => {
      const submission = { data: {}, metadata: {} };
      const form = {
        title: "Labeled signatures with description",
        components: [],
        properties: {
          hasLabeledSignatures: true,
          descriptionOfSignatures: "Her står det litt om hvorfor man signerer",
          signatures: [
            {
              label: "Pensjonisten",
            },
            {
              label: "Lege",
              description: "Jeg bekrefter at personen er i live",
            },
          ],
        },
      };

      it("renders description below signature label", () => {
        const generator = new PdfgenPapir(submission, form, "", now(), undefined);
        const doc_definition = generator.generateDocDefinition();

        const signature1 = doc_definition.content[7];
        const signature2 = doc_definition.content[12];

        expect(signature1.stack[0].text).toEqual("Pensjonisten");
        expect(signature1.stack[1].text).toBeUndefined();
        expect(signature2.stack[0].text).toEqual("Lege");
        expect(signature2.stack[1].text).toEqual("Jeg bekrefter at personen er i live");
      });

      it("renders description for signatures above signatures section", () => {
        const generator = new PdfgenPapir(submission, form, "", now(), undefined);
        const doc_definition = generator.generateDocDefinition();
        const descriptionOfSignatures = doc_definition.content[4];
        expect(descriptionOfSignatures.text).toEqual("Her står det litt om hvorfor man signerer");
      });
    });

    describe("Form with no signature", () => {
      const submission = { data: {}, metadata: {} };
      const form = {
        title: "Labeled signatures with description",
        components: [],
        properties: {
          hasLabeledSignatures: true,
          descriptionOfSignatures: "Her står det litt om hvorfor man signerer",
          signatures: [],
        },
      };

      it("renders no signature label and description", () => {
        const generator = new PdfgenPapir(submission, form, "", now(), undefined);
        const doc_definition = generator.generateDocDefinition();
        const signature1 = doc_definition.content[7];
        expect(signature1).toBeUndefined();
      });
    });

    describe("Form with empty signature label and description", () => {
      const submission = { data: {}, metadata: {} };
      const form = {
        title: "Labeled signatures with description",
        components: [],
        properties: {
          hasLabeledSignatures: true,
          descriptionOfSignatures: "Her står det litt om hvorfor man signerer",
          signatures: [
            {
              label: "",
              description: "",
            },
          ],
        },
      };

      it("renders empty signature label and description", () => {
        const generator = new PdfgenPapir(submission, form, "", now(), undefined);
        const doc_definition = generator.generateDocDefinition();

        const signature1 = doc_definition.content[7];

        expect(signature1).toEqual({
          stack: [
            "_____________________________________\t\t_____________________________________",
            "Sted og dato\t\t\t\t\t\t\t\t\t\t\t\t\t Underskrift",
          ],
          unbreakable: true,
        });
      });
    });
  });
});
