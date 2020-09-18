import {Pdfgen} from "./pdfgen";

const createComplexSubmission = () => ({
  "data": {
    "personalia": {
      "fornavn": "Syver",
      "etternavn": "Enstad",
      "fodselsnummerDNummer": "123456 78911"
    },
    "harDuHattAndreInntekter": "nei",
    "inntekt3": 0,
    "sum": 10,
    "tall": 10,
    "summeringskonteiner": {"sum": 3702},
  },
  "metadata": {
    "timezone": "Europe/Oslo",
    "offset": 120,
    "origin": "http://localhost:3000",
    "referrer": "http://localhost:3000/skjema/nynav760710registreringsskjemafortilskuddtilutdanning",
    "browserName": "Netscape",
    "userAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36",
    "pathName": "/skjema/testchristianogmona",
    "onLine": true
  },
  "state": "submitted"
});

const createComplexFormDefinition = () => ({
  "_id": "5f2812a61cd355000301f0d0",
  "type": "form",
  "tags": ["nav-skjema"],
  "owner": "5ee0eacc7665226ea32fd389",
  "display": "wizard",
  "name": "testChristianOgMona",
  "title": "Test Christian og Mona",
  "path": "testchristianogmona",
  "machineName": "testChristianOgMona",
  "components": [
    {
      "label": "HTML",
      "key": "html",
      "type": "htmlelement",
      "input": false,
      "id": "e5lcez"
    },
    {
      "title": "Personalia",
      "key": "personalia1",
      "type": "panel",
      "label": "Panel",
      "input": false,
      "id": "edfcko9",
      "components": [
        {
          "label": "Personalia",
          "key": "personalia",
          "type": "container",
          "input": true,
          "id": "ehnaj4mb",
          "components": [
            {
              "label": "Fornavn",
              "type": "textfield",
              "key": "fornavn",
              "input": true,
              "placeholder": "Fornavn",
              "id": "e2i3kg5"
            },
            {
              "label": "Etternavn",
              "type": "textfield",
              "key": "etternavn",
              "input": true,
              "placeholder": "Etternavn",
              "id": "eu4ap99"
            },
            {
              "key": "fodselsnummerDNummer",
              "type": "fnrfield",
              "input": true,
              "label": "Fødselsnummer / D-nummer",
              "id": "ecrz8yq"
            }
          ],
        },
        {
          "label": "Har du hatt andre inntekter?",
          "values": [{"label": "Ja", "value": "ja", "shortcut": ""}, {"label": "Nei", "value": "nei", "shortcut": ""}],
          "key": "harDuHattAndreInntekter",
          "type": "radio",
          "input": true,
          "id": "ekmagkp",
        },
        {
          "label": "Inntekt",
          "key": "inntekt3",
          "type": "currency",
          "input": true,
          "id": "ei5wbp"
        },
        {
          "label": "Sum",
          "key": "sum",
          "type": "currency",
          "input": true,
          "id": "e5cym5",
        },
        {
          "label": "Tall",
          "key": "tall",
          "type": "number",
          "input": true,
          "id": "exkmmf8",
        }],
    },
    {
      "title": "Summeringstest",
      "key": "summeringstest",
      "type": "panel",
      "label": "Panel",
      "input": false,
      "id": "esu4ts",
      "components": [{
        "label": "Summeringskonteiner",
        "key": "summeringskonteiner",
        "type": "container",
        "input": true,
        "id": "eym4bhm",
        "components": [
          {
            "label": "Sum",
            "key": "sum",
            "type": "currency",
            "input": true,
            "id": "e6lbwub",
          }]
      }],
    },
  ],
});

const createSubmission = () => ({
  "state": "submitted",
  "data": {
    "tekstfelt": "dfghjk",
    "T": "tcfghj",
    "submit": true,
    "sum": 3957,
    "belop": 3456,
    "belop1": 456,
    "belop2": 45
  },
  "metadata": {
    "timezone": "Europe/Oslo",
    "offset": 120,
    "origin": "https://skjema.dev.nav.no",
    "referrer": "",
    "browserName": "Netscape",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36",
    "pathName": "/skjema/test56789",
    "onLine": true
  }
});

const createForm = () => ({
  "_id": "5f20154e0018c900032fa00f",
  "type": "form",
  "tags": ["nav-skjema"],
  "owner": "5ee0eacc7665226ea32fd389",
  "display": "form",
  "name": "test56789",
  "title": "test56789",
  "path": "test56789",
  "machineName": "test56789",
  "components": [
    {
      "label": "Tekstfelt",
      "key": "tekstfelt",
      "type": "textfield",
      "input": true,
      "id": "e3nxyxr",
    },
    {
      "label": "2345t",
      "key": "T",
      "type": "radio",
      "values": [{label: 'tcfghj', value: 'tcfghj'}, {label: 'Nei',  value: 'nei'}],
      "input": true,
      "id": "edawfax"
    },
    {
      "label": "Beløp",
      "key": "belop",
      "type": "currency",
      "input": true,
      "id": "edo3ppo",
    },
    {
      "label": "Beløp",
      "key": "belop1",
      "type": "currency",
      "input": true,
      "id": "edsy44",
    },
    {
      "label": "Beløp",
      "key": "belop2",
      "type": "currency",
      "input": true,
      "id": "eg92i4j",
    },
    {
      "label": "Sum",
      "key": "sum",
      "type": "currency",
      "input": true,
      "id": "e5guh0h",
    },
    {
      "type": "button",
      "label": "Send inn",
      "key": "submit",
      "action": "submit",
      "input": true,
      "id": "ekuuti"
    }]
});

describe('generating doc definition', () => {
  it('generates the docDef for an empty submission', () => {
    const submission = {data: {}, metadata: {}};
    const form = {title: 'Smølfeskjema', components: []};
    const generator = new Pdfgen(submission, form);
    const doc_definition = generator.generateDocDefinition();
    expect(doc_definition).toEqual({
      styles: {
        "anotherStyle": {
          "alignment": "right",
          "italics": true
        },
        "header": {
          "bold": true,
          "fontSize": 22
        },
        subHeader: {
          bold: true,
          fontSize: 18
        }
      },
      content: [
        {
          "style": "header",
          "text": "Smølfeskjema"
        },
        "Her skal det stå informasjon til innsender",
        {"text": "Informasjon om versjonen av utfyller (implisitt skjemaversjon) som publiserte denne pdfen"}
      ]
    });
  });

  it('generates table from form and submission', () => {
    const submission = createSubmission();
    const form = createForm();
    const generator = new Pdfgen(submission, form);
    const doc_definition = generator.generateDocDefinition();
    const tableDef = doc_definition.content[2]
    expect(tableDef.table).toBeDefined();
    const tableData = tableDef.table.body.slice(0);
    expect(tableData).toHaveLength(Object.keys(submission.data).length); // header row
    expect(tableData).toEqual([
      ['Tekstfelt', "dfghjk"],
      ['2345t', 'tcfghj'],
      ['Beløp', 3456],
      ['Beløp', 456],
      ['Beløp', 45],
      ['Sum', 3957],
      ['Send inn', true],
    ])
  });

  it('handles missing values in the submission when the field is not required', () => {
    const submission = createSubmission();
    submission.data.T = '';
    const form = createForm();
    const generator = new Pdfgen(submission, form);
    const doc_definition = generator.generateDocDefinition();
    const tableDef = doc_definition.content[2];
    expect(tableDef.table).toBeDefined();
    const tableData = tableDef.table.body.slice(0);
    expect(tableData).toHaveLength(Object.keys(submission.data).length - 1); // header row
    expect(tableData).toEqual([
      ["Tekstfelt", "dfghjk"],
      ['Beløp', 3456],
      ['Beløp', 456],
      ['Beløp', 45],
      ['Sum', 3957],
      ['Send inn', true],
    ])
  });


  it('generates a table for each panel in a complex form', () => {
    const submission = createComplexSubmission();
    const form = createComplexFormDefinition();
    const generator = new Pdfgen(submission, form);
    const doc_definition = generator.generateDocDefinition();
    const tableDefs = doc_definition.content.filter(paragraph => paragraph.table);
    expect(tableDefs).toHaveLength(2);
    expect(tableDefs[0].table.body).toEqual([
      ['Fornavn', "Syver"],
      ['Etternavn', 'Enstad'],
      ['Fødselsnummer / D-nummer', "123456 78911"],
      ['Har du hatt andre inntekter?', 'Nei'],
      ['Inntekt', 0],
      ['Sum', 10],
      ['Tall', 10]
        ]);
    expect(tableDefs[1].table.body).toEqual([
      ['Sum', 3702]
    ])
  });

  it('handles a radio field inside a container', () => {
    const submission = {data: {'composite': {'nestedRadioField': 'ja'}}};
    const formDefinition = {
      name: 'Skuppel',
      components: [
        {
          type: 'container',
          key: 'composite',
          label: 'Parent',
          input: true,
          components: [
            {
              label: 'Child',
              type: 'radio',
              key: 'nestedRadioField',
              input: true,
              values: [{value: 'ja', label: 'Seff'}, {value: 'nei', label: 'Særlig...'}]
            }
          ]
        }
      ]
    };
    const generator = new Pdfgen(submission, formDefinition);
    const doc_definition = generator.generateDocDefinition();
    const tableDef = doc_definition.content[2];
    const tableData = tableDef.table.body;
    expect(tableData).toEqual([
      ['Child', 'Seff']
    ])
  });
});
