import PdfPrinter from 'pdfmake';

/*
var fonts = {
    SourceSans: {
        normal: 'fonts/SourceSans-Regular.ttf',
        bold: 'fonts/SourceSans-Medium.ttf',
        italics: 'fonts/SourceSans-Italic.ttf',
        bolditalics: 'fonts/SourceSans-MediumItalic.ttf'
    }
};

 */

var fonts = {
  Roboto: {
    normal: 'fonts/Roboto-Regular.ttf',
    bold: 'fonts/Roboto-Medium.ttf',
    italics: 'fonts/Roboto-Italic.ttf',
    bolditalics: 'fonts/Roboto-MediumItalic.ttf'
  }
};


export function generateSubmissionPDF(submission, writeStream) {
  // can we create the printer just once, or do we need to create it for each document
  var printer = new PdfPrinter(fonts);


  var dataTable = {
    // headers are automatically repeated if the table spans over multiple pages
    // you can declare how many rows should be treated as headers
    headerRows: 1,
    widths: ['*', '*'],

    body: [
      ['Label', 'Value'],
    ]
  };

  var docDefinition = {
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

  var pdfDoc = printer.createPdfKitDocument(docDefinition);
  pdfDoc.pipe(writeStream);
  pdfDoc.end();
}
