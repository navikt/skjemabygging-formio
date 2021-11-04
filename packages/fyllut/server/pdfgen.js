import PdfPrinter from "pdfmake";
import luxon from "luxon";
import { createFormSummaryObject } from "@navikt/skjemadigitalisering-shared-domain";

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
  static generatePdf(submission, form, gitVersion, stream, translations) {
    const now = DateTime.local().setZone("Europe/Oslo");
    const generator = new this(submission, form, gitVersion, now, translations);
    const docDefinition = generator.generateDocDefinition();
    generator.writeDocDefinitionToStream(docDefinition, stream);
  }

  constructor(submission, form, gitVersion, nowAsLuxonDateTime, translations) {
    this.gitVersion = gitVersion;
    this.submission = submission;
    this.form = form;
    this.now = nowAsLuxonDateTime;
    this.translations = translations;
  }

  translate(originalText) {
    return this.translations?.[originalText] ? this.translations[originalText] : originalText;
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

  createList(body = []) {
    return {
      ul: body,
    };
  }

  componentsToBody(components = [], areSubComponents = false) {
    return components.flatMap((component) => {
      switch (component.type) {
        case "fieldset":
          return this.componentsToBody(component.components);
        case "panel":
        case "navSkjemagruppe":
        case "datagrid":
          return [
            this.createRow(this.translate(component.label), "", true),
            ...this.componentsToBody(component.components, true),
          ];
        case "datagrid-row":
          const body = this.componentsToBody(component.components, true);
          if (component.label) {
            return [this.createRow(this.translate(component.label), "", true, true), ...body];
          }
          return [...body, [{ text: " ", colSpan: 2 }]];
        case "selectboxes":
          return [
            this.createRow(
              this.translate(component.label),
              this.createList(this.translate(component.value)),
              false,
              areSubComponents
            ),
          ];
        default:
          return [
            this.createRow(this.translate(component.label), this.translate(component.value), false, areSubComponents),
          ];
      }
    });
  }

  mapFormSummaryObjectToTables(formSummaryObject) {
    return formSummaryObject.flatMap((panel) => {
      return [
        { text: this.translate(panel.label), style: "subHeader" },
        this.createTableWithBody(this.componentsToBody(panel.components)),
      ];
    });
  }

  generateContentFromSubmission() {
    return [...this.generateHeader(), ...this.generateBody(), ...this.generateFooter()];
  }

  generateFooter() {
    const datoTid = this.now.setLocale("nb-NO").toLocaleString(DateTime.DATETIME_FULL);
    return [
      " ",
      " ",
      " ",
      { text: `${this.translate("Skjemaet ble opprettet")} ${datoTid}` },
      { text: `${this.translate("Skjemaversjon")}: ${this.gitVersion}` },
    ];
  }

  generateBody() {
    const formSummaryObject = createFormSummaryObject(this.form, this.submission);

    const homelessComponents = formSummaryObject.filter((component) => component.type !== "panel");
    const homelessComponentsTable =
      homelessComponents.length > 0 ? this.createTableWithBody(this.componentsToBody(homelessComponents)) : [];

    return [homelessComponentsTable, ...this.mapFormSummaryObjectToTables(formSummaryObject)];
  }

  generateDocDefinition() {
    return {
      pageSize: "A4",
      pageMargins: [40, 80, 40, 80],
      content: this.generateContentFromSubmission(),
      styles: this.docStyles(),
    };
  }

  generateHeader() {
    return [
      { text: this.translate(this.form.title), style: "header" },
      { text: " ", style: "ingress" },
    ];
  }
}

export class PdfgenPapir extends Pdfgen {
  newSignature(label) {
    const signatureLabel = label ? [{ text: this.translate(label), style: "groupHeader" }, " ", " "] : [];
    return [
      " ",
      " ",
      " ",
      " ",
      {
        stack: [
          ...signatureLabel,
          "_____________________________________\t\t_____________________________________",
          `${this.translate("Sted og dato")}\t\t\t\t\t\t\t\t\t\t\t\t\t ${this.translate("Underskrift")}`,
        ],
        unbreakable: true,
      },
    ];
  }

  generateSignatures() {
    const signatureLabels = this.form?.properties?.signatures
      ? Object.values(this.form.properties.signatures).filter((label) => label !== "")
      : [];

    if (this.form?.properties?.hasLabeledSignatures && signatureLabels.length > 0) {
      return signatureLabels.flatMap((label) => this.newSignature(label));
    }
    return this.newSignature();
  }

  generateContentFromSubmission() {
    return [...this.generateHeader(), ...this.generateBody(), ...this.generateSignatures(), ...this.generateFooter()];
  }
}
