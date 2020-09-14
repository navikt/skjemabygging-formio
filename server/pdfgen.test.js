import {Pdfgen} from "./pdfgen";

const createSubmission = () => ({
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
  },
  "state": "submitted"
});

const createForm = () => ({
  "_id": "5f20154e0018c900032fa00f",
  "type": "form",
  "tags": ["nav-skjema"],
  "owner": "5ee0eacc7665226ea32fd389",
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
      "type": "textfield",
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
    }],
  "display": "form",
  "name": "test56789",
  "title": "test56789",
  "path": "test56789",
  "machineName": "test56789"
});

describe('generating doc definition', () => {
  it('generates the docDef for an empty submission', () => {
    const submission = {data: {}, metadata: {}};
    const form = {components: []};
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
        }
      },
      content: [
        {
          "style": "header",
          "text": "Skjemainnsendingskvittering"
        },
        "Her står det så mye tekst at den bryter over mer enn en linje, bare for å at vi " +
        "skal se hvordan overskrift og brødtekst ser ut",
        {
          "layout": "lightHorizontalLines",
          "table": {
            "body": [
              [
                "Label",
                "Value"
              ]
            ],
            "headerRows": 1,
            "widths": [
              "*",
              "*"
            ]
          }
        }
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
    const tableData = tableDef.table.body.slice(1);
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
  })
});