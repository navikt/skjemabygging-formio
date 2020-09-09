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

  it('generates table from submission', () => {
    const submission = createSubmission();
    const form = {components: []};
    const generator = new Pdfgen(submission, form);
    const doc_definition = generator.generateDocDefinition();
    const tableDef = doc_definition.content[2]
    expect(tableDef.table).toBeDefined();
    expect(tableDef.table.body).toHaveLength(Object.keys(submission.data).length + 1); // header row
  })
});