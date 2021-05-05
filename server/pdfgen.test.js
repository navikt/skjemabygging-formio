import { Pdfgen, PdfgenPapir } from "./pdfgen";
import luxon from "luxon";

const { DateTime } = luxon;

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
    return DateTime.fromObject({ year: 1992, day: 19, month: 10, zone: "Europe/Oslo" });
  }

  function setupDocDefinitionContent(submission, form, version = "deadbeef") {
    const generator = new Pdfgen(submission, form, version, now());
    const doc_definition = generator.generateDocDefinition();
    return doc_definition.content;
  }

  it("generates the docDef for an empty submission", () => {
    const submission = { data: {}, metadata: {} };
    const form = { title: "Smølfeskjema", components: [] };
    const version = "deadbeef-dirty";
    const docDefinitionContent = setupDocDefinitionContent(submission, form, version);
    expect(docDefinitionContent).toEqual([
      {
        style: "header",
        text: "Smølfeskjema",
      },
      { text: " ", style: "ingress" },
      { text: "Skjemaet ble opprettet 19. oktober 1992, 00:00 CET" },
      { text: `Skjemaversjon: ${version}` },
    ]);
  });

  it("generates table from form and submission", () => {
    const submission = createSubmission();
    const tableDef = setupDocDefinitionContent(submission, createForm())[2];
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
    const tableDef = setupDocDefinitionContent(submission, createForm())[2];

    expect(tableDef.table).toBeDefined();
    const tableData = tableDef.table.body.slice(0);
    expect(tableData).toEqual([["Beløp", 3456]]);
    expect(tableData).toHaveLength(Object.keys(submission.data).length - 3); // submit button, T, and tekstfelt are removed
  });

  it("generates a table for each panel in a complex form", () => {
    const tableDefs = setupDocDefinitionContent(createComplexSubmission(), createComplexFormDefinition()).filter(
      (paragraph) => paragraph.table
    );

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
    const tableDef = setupDocDefinitionContent(submission, formDefinition)[2];
    const tableData = tableDef.table.body;
    expect(tableData).toEqual([["Child", "Seff"]]);
  });

  it("removes submit button from pdf content", () => {
    const tableDef = setupDocDefinitionContent(createSubmission(), createForm())[2];
    expect(tableDef.table).toBeDefined();
    const tableData = tableDef.table.body.slice(0);
    expect(tableData).not.toEqual(expect.arrayContaining([expect.arrayContaining(["Send inn", true])]));
  });

  describe("PdfgenPapir", () => {
    it("generates with signature field", () => {
      const submission = { data: {}, metadata: {} };
      const form = { title: "Smølfeskjema", components: [] };
      const version = "deadbeef-dirty";
      const generator = new PdfgenPapir(submission, form, version, now());
      const doc_definition = generator.generateDocDefinition();

      expect(doc_definition.content).toContain("Underskrift");
    });
  });
});
