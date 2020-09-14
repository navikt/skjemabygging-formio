import PdfPrinter from 'pdfmake';

const camelToWords = (camelString) => {
  const wordList = camelString.match(/[A-Z][a-z]+/g);
  if (!wordList) {
    return camelString;
  }
  return wordList.join(' ');
};

const fonts = {
  Roboto: {
    normal: 'fonts/Roboto-Regular.ttf',
    bold: 'fonts/Roboto-Medium.ttf',
    italics: 'fonts/Roboto-Italic.ttf',
    bolditalics: 'fonts/Roboto-MediumItalic.ttf'
  },
  SourceSans: {
    normal: 'fonts/SourceSans-Regular.ttf',
    bold: 'fonts/SourceSans-Medium.ttf',
    italics: 'fonts/SourceSans-Italic.ttf',
    bolditalics: 'fonts/SourceSans-MediumItalic.ttf'
  }
};

const printer = new PdfPrinter(fonts);

export class Pdfgen {
  constructor(submission, form) {
    this.submission = submission;
    this.form = form;
  }

  docStyles() {
    return {
      header: {
        fontSize: 22,
          bold: true
      },
      anotherStyle: {
        italics: true,
          alignment: 'right'
      }
    }
  }

  static writePDFToStream(submission, form, stream) {
    const instance = new this(submission, form);
    instance.generatePDFToStream(stream);
  }
  generatePDFToStream(writeStream) {
    const pdfDoc = printer.createPdfKitDocument(this.generateDocDefinition());
    pdfDoc.pipe(writeStream);
    pdfDoc.end();
  }

  generateDocDefinition() {
    return {
      content: [
        this.header(),
        'Her står det så mye tekst at den bryter over mer enn en' +
        ' linje, bare for å at vi skal se hvordan overskrift og brødtekst ser ut',
        {
          layout: 'lightHorizontalLines', // optional
          table: this.generateDataTable()
        }
      ],
      styles: this.docStyles()
    };
  }

  header() {
    return {text: 'Skjemainnsendingskvittering', style: 'header'};
  }

  generateDataTable() {
    const dataTable = {
      // headers are automatically repeated if the table spans over multiple pages
      // you can declare how many rows should be treated as headers
      headerRows: 1,
      widths: ['*', '*'],

      body: [
        ['Label', 'Value'],
      ]
    };
    this.form.components.forEach((component) => {
      const value = this.submission.data[component.key];
      if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          dataTable.body.push([camelToWords(component.key) + camelToWords(subKey), subValue]);
        });
      } else {
        dataTable.body.push([component.label, value]);
      }
    });
    return dataTable;
  }
}

