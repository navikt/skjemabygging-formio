import PdfPrinter from 'pdfmake';

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


export function generateSubmissionPDF(submission, writeStream) {
  const dataTable = {
    // headers are automatically repeated if the table spans over multiple pages
    // you can declare how many rows should be treated as headers
    headerRows: 1,
    widths: ['*', '*'],

    body: [
      ['Label', 'Value'],
    ]
  };

  const docDefinition = {
    content: [
      'Skjemainnsendingskvittering',
      'Her står det så mye tekst at den bryter over mer enn en' +
      ' linje, bare for å at vi skal se hvordan overskrift og brødtekst ser ut',
      {
        layout: 'lightHorizontalLines', // optional
        table: dataTable
      }
    ]
  };

  const camelToWords = (camelString) => {
    const wordList = camelString.match(/[A-Z][a-z]+/g);
    if (!wordList) {
      return camelString;
    }
    return wordList.join(' ');
  };

  Object.entries(submission.data).forEach(([key, value]) => {
    console.log(key, value);
    if (typeof value === 'object') {
      Object.entries(value).forEach(([subKey, subValue]) => {
        dataTable.body.push([camelToWords(key) + camelToWords(subKey), subValue]);
      });
    } else {
      dataTable.body.push([camelToWords(key), value]);
    }
  });

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  pdfDoc.pipe(writeStream);
  pdfDoc.end();
}
