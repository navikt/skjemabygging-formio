import PdfPrinter from 'pdfmake';
import luxon from 'luxon';
const {DateTime} = luxon;

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

class InvalidValue extends Error {
  name = 'InvalidValue';
}

const printer = new PdfPrinter(fonts);

export class Pdfgen {
  constructor(submission, form, gitVersion, nowAsLuxonDateTime) {
    this.gitVersion = gitVersion;
    this.submission = submission;
    this.form = form;
    this.now = nowAsLuxonDateTime;
  }

  docStyles() {
    return {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10]
      },
      subHeader: {
        fontSize: 14,
        bold: true,
        margin: [0, 10, 0, 5]
      },
      anotherStyle: {
        italics: true,
        alignment: 'right'
      },
      panelTable: {
        margin: [0, 5, 0, 5]
      },
      ingress: {
        margin: [0, 5, 0, 5]
      }
    }
  }

  static writePDFToStream(submission, form, stream) {
    const instance = new this(submission, form);
    instance.generatePDFToStream(stream);
  }

  writeDocDefinitionToStream(docDefinition, writeStream) {
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    pdfDoc.pipe(writeStream);
    pdfDoc.end();
  }

  generatePDFToStream(writeStream) {
    const docDefinition = this.generateDocDefinition();
    console.log('doc definition', docDefinition);
    docDefinition.content.forEach(paragraph => {
      if (paragraph.table) {
        console.log(paragraph.table);
      }
    });
    this.writeDocDefinitionToStream(docDefinition, writeStream);
  }

  generateDataTable() {
    const dataTable = this.createTable();
    this.form.components.forEach((component) => {
      this.handleComponent(component, dataTable.body);
    });
    return dataTable;
  }

  generateHeaderAndTable(panel, content) {
    const dataTable = this.createTable();
    panel.components.forEach((component) => {
      this.handleComponent(component, dataTable.body);
    });
    if (dataTable.body.length === 0) {
      return;
    } else {
      content.push({text: panel.title, style: 'subHeader'});
      content.push({table: dataTable, style: 'panelTable'});
    }
  }

  generateTableForComponentsOutsidePanels(rest, content) {
    const dataTable = this.createTable();
    rest.forEach((component) => {
      this.handleComponent(component, dataTable.body);
    });
    if (dataTable.body.length) {
      content.push({table: dataTable, style: 'panelTable'});
    }
  }

  generateContentFromSubmission() {
    const panels = this.form.components.filter(component => component.type === 'panel');
    const rest = this.form.components.filter(component => component.type !== 'panel');
    let result = [
      this.header(),
      {text: 'Her skal det stå informasjon til innsender', style: 'ingress'}
    ];
    this.generateTableForComponentsOutsidePanels(rest, result);
    panels.forEach(panel => this.generateHeaderAndTable(panel, result)); // her er general case for hvert panel
    const datoTid = this.now.setLocale('nb-NO').toLocaleString(DateTime.DATETIME_FULL);
    result.push({text: `Skjemaet ble opprettet ${datoTid}`});
    result.push({
      text: `Skjemaversjon: ${this.gitVersion}`
    });
    return result;
  }

  generateDocDefinition() {
    return {
      content: this.generateContentFromSubmission(),
      styles: this.docStyles()
    };
  }

  header() {
    return {text: this.form.title, style: 'header'};
  }

  formatValue(component, value) {
    switch (component.type) {
      case 'radio':
        const valueObject = component.values.find(valueObject => valueObject.value === value);
        if (!valueObject) {
          throw new InvalidValue(`'${value}' is not in ${JSON.stringify(component.values)}`);
        }
        return valueObject.label;
      case 'signature': {
        return 'rendering signature not supported';
      }
      case 'navDatepicker': {
        const date = new Date(value);
        return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`; // TODO: month is zero based.
      }
      default:
        return value;

    }
  }

  handleComponent(component, dataTableBody) {
    if (component.input) {
      const value = this.submission.data[component.key];
      // TODO: as shown here if the component is not submitted this is something that only the component knows. Delegate to component
      if (value === undefined || (component.type === 'radio' && value === '')) {
        // TODO: burde vi generere pdf for feltet hvis det er required????
        return;
      }
      switch (component.type) {
        case 'container': {
          component.components.forEach(subComponent => {
            // TODO: must check if component is input
            // TODO: we don't handle further recursion
            const subValue = value[subComponent.key];
            if (subValue === undefined) {
              return;
            }
            dataTableBody.push([
              subComponent.label,
              this.formatValue(subComponent, subValue)]);
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

