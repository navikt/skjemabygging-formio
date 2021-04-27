import PdfPrinter from "pdfmake";
import luxon from "luxon";

const { DateTime } = luxon;

const fonts = {
  Roboto: {
    normal: "fonts/Roboto-Regular.ttf",
    bold: "fonts/Roboto-Medium.ttf",
    italics: "fonts/Roboto-Italic.ttf",
    bolditalics: "fonts/Roboto-MediumItalic.ttf",
  },
  SourceSans: {
    normal: "fonts/SourceSans-Regular.ttf",
    bold: "fonts/SourceSans-Medium.ttf",
    italics: "fonts/SourceSans-Italic.ttf",
    bolditalics: "fonts/SourceSans-MediumItalic.ttf",
  },
};

class InvalidValue extends Error {
  name = "InvalidValue";
}

const printer = new PdfPrinter(fonts);

export class Pdfgen {
  static generatePdf(submission, form, gitVersion, stream) {
    const now = DateTime.local().setZone("Europe/Oslo");
    const generator = new this(submission, form, gitVersion, now);
    const docDefinition = generator.generateDocDefinition();
    generator.writeDocDefinitionToStream(docDefinition, stream);
  }

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
        margin: [0, 0, 0, 10],
      },
      subHeader: {
        fontSize: 14,
        bold: true,
        margin: [0, 10, 0, 5],
      },
      groupHeader: {
        bold: true,
      },
      subComponent: {
        margin: [10, 0, 0, 0],
      },
      anotherStyle: {
        italics: true,
        alignment: "right",
      },
      panelTable: {
        margin: [0, 5, 0, 5],
      },
      ingress: {
        margin: [0, 5, 0, 5],
      },
    };
  }

  writeDocDefinitionToStream(docDefinition, writeStream) {
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    pdfDoc.pipe(writeStream);
    pdfDoc.end();
  }

  //Laget for å debugge, ikke tar i bruk i produksjon
  generatePDFToStream(writeStream) {
    const docDefinition = this.generateDocDefinition();
    console.debug("doc definition", docDefinition);
    docDefinition.content.forEach((paragraph) => {
      if (paragraph.table) {
        console.debug(paragraph.table);
      }
    });
    this.writeDocDefinitionToStream(docDefinition, writeStream);
  }

  generateDataTable() {
    const dataTable = this.createTable();
    this.form.components.forEach((component) => {
      this.handleComponent(component, dataTable.body, this.submission.data);
    });
    return dataTable;
  }

  generateHeaderAndTable(panel, content) {
    const dataTable = this.createTable();
    panel.components.forEach((component) => {
      this.handleComponent(component, dataTable.body, this.submission.data);
    });
    if (dataTable.body.length === 0) {
      return;
    } else {
      content.push({ text: panel.title, style: "subHeader" });
      content.push({ table: dataTable, style: "panelTable" });
    }
  }

  generateTableForComponentsOutsidePanels(rest, content) {
    const dataTable = this.createTable();
    rest.forEach((component) => {
      this.handleComponent(component, dataTable.body, this.submission.data);
    });
    if (dataTable.body.length) {
      content.push({ table: dataTable, style: "panelTable" });
    }
  }

  generateContentFromSubmission() {
    let result = this.generateFirstPart();
    return this.generateLastPart(result);
  }

  generateLastPart(result) {
    const datoTid = this.now.setLocale("nb-NO").toLocaleString(DateTime.DATETIME_FULL);
    result.push({ text: `Skjemaet ble opprettet ${datoTid}` });
    result.push({
      text: `Skjemaversjon: ${this.gitVersion}`,
    });
    return result;
  }

  generateFirstPart() {
    let result = [this.header(), { text: " ", style: "ingress" }];
    const rest = this.form.components.filter((component) => component.type !== "panel");
    this.generateTableForComponentsOutsidePanels(rest, result);
    const panels = this.form.components.filter((component) => component.type === "panel");
    panels.forEach((panel) => this.generateHeaderAndTable(panel, result)); // her er general case for hvert panel
    return result;
  }

  doGenerateDocDefinition(content) {
    return {
      pageSize: "A4",
      pageMargins: [40, 80, 40, 80],
      content: content,
      styles: this.docStyles(),
    };
  }

  generateDocDefinition() {
    return this.doGenerateDocDefinition(this.generateContentFromSubmission());
  }

  header() {
    return { text: this.form.title, style: "header" };
  }

  formatValue(component, value) {
    switch (component.type) {
      case "radiopanel":
      case "radio": {
        const valueObject = component.values.find((valueObject) => valueObject.value === value);
        if (!valueObject) {
          throw new InvalidValue(`'${value}' is not in ${JSON.stringify(component.values)}`);
        }
        return valueObject.label;
      }
      case "signature": {
        return "rendering signature not supported";
      }
      case "navDatepicker": {
        const date = new Date(value);
        return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`; // TODO: month is zero based.
      }
      case "navCheckbox": {
        return value === "ja" ? "Ja" : "Nei";
      }
      default:
        return value;
    }
  }

  handleComponent(component, dataTableBody, submissionData, style = {}) {
    if (component.input) {
      const value = submissionData[component.key];
      // TODO: as shown here if the component is not submitted this is something that only the component knows. Delegate to component
      if (value === undefined || value === "") {
        // TODO: burde vi generere pdf for feltet hvis det er required????
        return;
      }
      switch (component.type) {
        case "container": {
          component.components.forEach((subComponent) => {
            // TODO: must check if component is input
            // TODO: we don't handle further recursion
            const subValue = value[subComponent.key];
            if (subValue === undefined) {
              return;
            }
            dataTableBody.push([subComponent.label, this.formatValue(subComponent, subValue)]);
          });
          break;
        }
        case "button":
          return;
        case "datagrid": {
          dataTableBody.push([{ text: `${component.label}`, style: "groupHeader", colSpan: 2 }, " "]);
          value.forEach((dataGridRow) => {
            if (component.rowTitle) {
              dataTableBody.push([
                {
                  text: `${component.rowTitle}`,
                  style: ["groupHeader", "subComponent"],
                  colSpan: 2,
                },
                " ",
              ]);
            }
            component.components.forEach((subComponent) =>
              this.handleComponent(subComponent, dataTableBody, dataGridRow, { style: "subComponent" })
            );
            if (!component.rowTitle) {
              dataTableBody.push([{ text: " ", colSpan: 2 }]);
            }
          });
          return;
        }
        default:
          dataTableBody.push([{ text: component.label, ...style }, this.formatValue(component, value)]);
      }
    } else if (component.type === "navSkjemagruppe") {
      dataTableBody.push([{ text: component.legend, style: "groupHeader", colSpan: 2 }, ""]);
      component.components.forEach((subComponent) =>
        this.handleComponent(subComponent, dataTableBody, submissionData, { style: "subComponent" })
      );
    } else if (component.components) {
      component.components.forEach((subComponent) => this.handleComponent(subComponent, dataTableBody, submissionData));
    }
  }

  createTable() {
    return {
      // headers are automatically repeated if the table spans over multiple pages
      // you can declare how many rows should be treated as headers
      headerRows: 0,
      widths: ["*", "*"],
      body: [],
    };
  }
}

export class PdfgenPapir extends Pdfgen {
  generateContentFromSubmission(submission, form, gitVersion, stream) {
    let result = this.generateFirstPart();
    // her skal underskrift inn
    const underskriftsFelter = [
      " ",
      " ",
      " ",
      " ",
      "_____________________________________",
      "Sted og dato",
      " ",
      " ",
      " ",
      "_____________________________________",
      "Underskrift",
      " ",
      " ",
    ];

    result = result.concat(underskriftsFelter);
    return this.generateLastPart(result);
  }
}
