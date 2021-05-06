import PdfPrinter from "pdfmake";
import luxon from "luxon";
import { createFormSummaryObject } from "./formSummaryUtil.js";

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

  createTableWithBody(body = []) {
    return {
      table: {
        headerRows: 0,
        widths: ["*", "*"],
        body,
      },
      style: "panelTable",
    };
  }

  createRow(text, value, isGroupHeader, isSubComponent) {
    if (!isGroupHeader && !isSubComponent) {
      return [text, value];
    }

    const textObject = { text, style: [] };
    if (isGroupHeader) {
      textObject.colSpan = 2;
      textObject.style.push("groupHeader");
    }
    if (isSubComponent) {
      textObject.style.push("subComponent");
    }
    return [textObject, value];
  }

  componentsToBody(components = [], areSubComponents = false) {
    return components.flatMap((component) => {
      switch (component.type) {
        case "fieldset":
          return this.componentsToBody(component.components);
        case "navSkjemagruppe":
        case "datagrid":
          return [this.createRow(component.label, "", true), ...this.componentsToBody(component.components, true)];
        case "datagrid-row":
          const body = this.componentsToBody(component.components, true);
          if (component.label) {
            return [this.createRow(component.label, "", true, true), ...body];
          }
          return [...body, [{ text: " ", colSpan: 2 }]];
        default:
          return [this.createRow(component.label, component.value, false, areSubComponents)];
      }
    });
  }

  mapFormSummaryObjectToPdf(formSummaryObject, pdfObject) {
    const tables = formSummaryObject.flatMap((panel) => {
      return [
        { text: panel.label, style: "subHeader" },
        this.createTableWithBody(this.componentsToBody(panel.components)),
      ];
    });
    return [...pdfObject, ...tables];
  }

  generateContentFromSubmission() {
    let result = this.generateFirstPart();
    return this.generateLastPart(result);
  }

  generateLastPart(result) {
    const datoTid = this.now.setLocale("nb-NO").toLocaleString(DateTime.DATETIME_FULL);
    return [...result, { text: `Skjemaet ble opprettet ${datoTid}` }, { text: `Skjemaversjon: ${this.gitVersion}` }];
  }

  generateFirstPart() {
    const formSummaryObject = createFormSummaryObject(this.form, this.submission.data);

    const homelessComponents = formSummaryObject.filter((component) => component.type !== "panel");
    const homelessComponentsTable = this.createTableWithBody(this.componentsToBody(homelessComponents));
    const pdfObjectBase = [this.header(), { text: " ", style: "ingress" }];
    const startOfPdfObject =
      homelessComponents.length > 0 ? [...pdfObjectBase, homelessComponentsTable] : pdfObjectBase;
    return this.mapFormSummaryObjectToPdf(formSummaryObject, startOfPdfObject);
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
}

export class PdfgenPapir extends Pdfgen {
  generateContentFromSubmission() {
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
