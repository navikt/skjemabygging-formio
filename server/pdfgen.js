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
    const docDefinition = this.generateDocDefinition();
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    pdfDoc.pipe(writeStream);
    pdfDoc.end();
  }

  generateSubmissionTables() {
    const table = this.createTable();
    this.form.components.forEach((component) => {


      });
    return [{
      // layout: 'lightHorizontalLines', // optional
      table: this.generateDataTable()
    }];
  }

  generateDocDefinition() {
    return {
      content: [
        this.header(),
        'Her står det så mye tekst at den bryter over mer enn en' +
        ' linje, bare for å at vi skal se hvordan overskrift og brødtekst ser ut',
        ...this.generateSubmissionTables()
      ],
      styles: this.docStyles()
    };
  }

  header() {
    return {text: 'Skjemainnsendingskvittering', style: 'header'};
  }

  formatValue(component, value) {
    switch (component.type) {
      case 'radio':
        const valueObject = component.values.find(valueObject => valueObject.value === value);
        if (!valueObject) {
          console.error(value, component.values);
          throw new Error(JSON.stringify(component.values));
        }
        return valueObject.label;
      case 'signature': {
        return 'rendering signature not supported';
      }
      default:
        return value;

    }
  }

  handleComponent(component, dataTableBody) {
    if (component.input) {
      const value = this.submission.data[component.key];
      if (value === undefined) {
        return;
      }
      switch (component.type) {
        case 'container': {
          component.components.forEach(subComponent => {
            dataTableBody.push([
              component.label + ': ' + subComponent.label,
              this.formatValue(subComponent, value[subComponent.key])]);
          });
          break;
        }
        default:
          dataTableBody.push([
            component.label,
            this.formatValue(component, value)]);
      }
    } else if (component.components) {
      component.components.forEach(subComponent => this.handleComponent(subComponent, dataTableBody));
    }
  }

  generateDataTable() {
    const dataTable = this.createTable();
    this.form.components.forEach((component) => {
      this.handleComponent(component, dataTable.body);
    });
    return dataTable;
  }

  createTable() {
    return {
      // headers are automatically repeated if the table spans over multiple pages
      // you can declare how many rows should be treated as headers
      headerRows: 0,
      widths: ['*', '*'],
      body: []
    };
  }
}

