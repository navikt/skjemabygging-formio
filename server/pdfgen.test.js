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

const createFormWithConditional = () => ({
  name: "conditionalForm",
  title: "conditionalForm",
  path: "conditionalForm",
  machineName: "conditionalForm",
  components: [
    {
      label: "Radio Input",
      key: "radioInput",
      type: "radioPanel",
      values: [
        { label: "Ja", value: "ja" },
        { label: "Nei", value: "nei" },
      ],
      input: true,
      id: "edawfax",
    },
    {
      label: "renderWhenRadioIsJa",
      key: "renderWhenRadioIsJa",
      type: "datagrid",
      input: true,
      components: [],
      conditional: {
        when: "radioInput",
        eq: "ja",
        show: true,
      },
    },
    {
      label: "notRenderWhenRadioIsJa",
      key: "notRenderWhenRadioIsJa",
      type: "datagrid",
      input: true,
      components: [],
      conditional: {
        when: "radioInput",
        eq: "ja",
        show: false,
      },
    },
  ],
});

const createConditionalSubmission = (radioValue) => ({
  state: "submitted",
  data: {
    radioInput: radioValue,
    renderWhenRadioIsJa: [],
    notRenderWhenRadioIsJa: [],
  },
});

describe("generating doc definition", () => {
  function now() {
    return DateTime.fromObject({ year: 1992, day: 19, month: 10, zone: "Europe/Oslo" });
  }

  it("generates the docDef for an empty submission", () => {
    const submission = { data: {}, metadata: {} };
    const form = { title: "Smølfeskjema", components: [] };
    const version = "deadbeef-dirty";
    const generator = new Pdfgen(submission, form, version, now());
    const doc_definition = generator.generateDocDefinition();
    expect(doc_definition.content).toEqual([
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
    const form = createForm();
    const version = "deadbeef";
    const generator = new Pdfgen(submission, form, version, now());
    const doc_definition = generator.generateDocDefinition();
    const tableDef = doc_definition.content[2];
    expect(tableDef.table).toBeDefined();
    const tableData = tableDef.table.body.slice(0);
    expect(tableData).toHaveLength(Object.keys(submission.data).length - 1); // header row and submit button is removed
    expect(tableData).toEqual([
      [{ text: "Tekstfelt" }, "dfghjk"],
      [{ text: "2345t" }, "tcfghj"],
      [{ text: "Beløp" }, 3456],
    ]);
  });

  it("handles missing values in the submission when the field is not required", () => {
    const submission = createSubmission();
    submission.data.T = "";
    const form = createForm();
    const version = "deadbeef";
    const generator = new Pdfgen(submission, form, version, now());
    const doc_definition = generator.generateDocDefinition();
    const tableDef = doc_definition.content[2];
    expect(tableDef.table).toBeDefined();
    const tableData = tableDef.table.body.slice(0);
    expect(tableData).toHaveLength(Object.keys(submission.data).length - 2); // header row and submit button
    expect(tableData).toEqual([
      [{ text: "Tekstfelt" }, "dfghjk"],
      [{ text: "Beløp" }, 3456],
    ]);
  });

  it("generates a table for each panel in a complex form", () => {
    const submission = createComplexSubmission();
    const form = createComplexFormDefinition();
    const version = "deadbeef";
    const generator = new Pdfgen(submission, form, version, now());
    const doc_definition = generator.generateDocDefinition();
    const tableDefs = doc_definition.content.filter((paragraph) => paragraph.table);
    expect(tableDefs).toHaveLength(2);
    expect(tableDefs[0].table.body).toEqual([
      ["Fornavn", "Syver"],
      ["Etternavn", "Enstad"],
      ["Fødselsnummer / D-nummer", "123456 78911"],
      [{ text: "Har du hatt andre inntekter?" }, "Nei"],
      [{ text: "Inntekt" }, 0],
      [{ text: "Sum" }, 10],
      [{ text: "Tall" }, 10],
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
    const version = "deadbeef";
    const generator = new Pdfgen(submission, formDefinition, version, now());
    const doc_definition = generator.generateDocDefinition();
    const tableDef = doc_definition.content[2];
    const tableData = tableDef.table.body;
    expect(tableData).toEqual([["Child", "Seff"]]);
  });

  it("removes submit button from pfd content", () => {
    const submission = createSubmission();
    const form = createForm();
    const version = "deadbeef";
    const generator = new Pdfgen(submission, form, version, now());
    const doc_definition = generator.generateDocDefinition();
    const tableDef = doc_definition.content[2];
    expect(tableDef.table).toBeDefined();
    const tableData = tableDef.table.body.slice(0);
    expect(tableData).not.toEqual(expect.arrayContaining([expect.arrayContaining(["Send inn", true])]));
  });

  it("generates with signature field", () => {
    const submission = { data: {}, metadata: {} };
    const form = { title: "Smølfeskjema", components: [] };
    const version = "deadbeef-dirty";
    const generator = new PdfgenPapir(submission, form, version, now());
    const doc_definition = generator.generateDocDefinition();

    expect(doc_definition.content).toContain("Underskrift");
  });
});
