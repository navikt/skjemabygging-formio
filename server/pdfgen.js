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

class InvalidValue extends Error {
  name = 'InvalidValue';
}

const printer = new PdfPrinter(fonts);

export class Pdfgen {
  constructor(submission, form, gitVersion) {
    this.gitVersion = gitVersion;
    this.submission = submission;
    this.form = form;
  }

  docStyles() {
    return {
      header: {
        fontSize: 22,
        bold: true
      },
      subHeader: {
        fontSize: 18,
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

  generateHeaderAndTable(panel) {
    const dataTable = this.createTable();
    panel.components.forEach((component) => {
      this.handleComponent(component, dataTable.body);
    });
    if (dataTable.body.length === 0) {
      return [{text: panel.title, style: 'subHeader'},
        'Panelet er ikke utfyllt'
      ];
    }
    return [
      {text: panel.title, style: 'subHeader'},
      {table: dataTable}
    ];
  }

  generateContentFromSubmission() {
    const panels = this.form.components.filter(component => component.type === 'panel');
    const rest = this.form.components.filter(component => component.type !== 'panel');
    // her kommer special case av generateHeaderAndTable for this.form
    const dataTable = this.createTable();
    rest.forEach((component) => {
      this.handleComponent(component, dataTable.body);
    });
    let result = [
      this.header(),
      'Her skal det stå informasjon til innsender'
    ];
    if (dataTable.body.length) {
      result.push({table: dataTable});
    }

    const headerAndTables = panels.map(panel => this.generateHeaderAndTable(panel)); // her er general case for hvert panel
    result = result.concat(headerAndTables.flat());
    result.push({
      text: 'Informasjon om versjonen av utfyller (implisitt skjemaversjon) som publiserte denne pdfen'
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
      default:
        return value;

    }
  }

  handleComponent(component, dataTableBody) {
    if (component.input) {
      const value = this.submission.data[component.key];
      if (value === undefined || (component.type === 'radio' && value === '')) {
        return;
      }
      switch (component.type) {
        case 'container': {
          component.components.forEach(subComponent => {
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
          const formattedValue = this.formatValue(component, value);
          dataTableBody.push([
            component.label,
            formattedValue]);
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

