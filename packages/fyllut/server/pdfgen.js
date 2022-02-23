import { createFormSummaryObject } from "@navikt/skjemadigitalisering-shared-domain";
import luxon from "luxon";
import PdfPrinter from "pdfmake";

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
      cursive: {
        italics: true,
        margin: 10,
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
      ul: body.map((item) => this.translate(item)),
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
            this.createRow(this.translate(component.label), this.createList(component.value), false, areSubComponents),
          ];
        case "image":
          return [];
        default:
          return [
            this.createRow(this.translate(component.label), this.translate(component.value), false, areSubComponents),
          ];
      }
    });
  }

  createImageWithAlt(img) {
    return [
      { text: this.translate(img.label), style: "subHeader" },
      { image: img.value, width: 500 },
      { text: img.alt, style: "cursive" },
    ];
  }

  mapFormSummaryObjectToTables(formSummaryObject) {
    console.log("Formsum", formSummaryObject);
    return formSummaryObject.flatMap((panel) => {
      const img = panel.components && panel.components.find((comp) => comp.type === "image");
      const imgWithAlt = img && this.createImageWithAlt(img);
      const header = { text: this.translate(panel.label), style: "subHeader" };
      const tableWithBody = this.createTableWithBody(this.componentsToBody(panel.components));

      if (imgWithAlt) {
        return [header, imgWithAlt, tableWithBody];
      }
      return [header, tableWithBody];
    });
  }

  generateContentFromSubmission() {
    return [...this.generateHeader(), ...this.generateBody()];
  }

  generateFooter(currentPage, pageCount) {
    const datoTid = this.now.setLocale("nb-NO").toLocaleString(DateTime.DATETIME_FULL);
    return {
      columns: [
        {
          width: "80%",
          text: `${this.translate("Skjemaet ble opprettet")} ${datoTid} \n ${this.translate("Skjemaversjon")}: ${
            this.gitVersion
          }`,
          alignment: "left",
        },
        { text: currentPage.toString() + " / " + pageCount, alignment: "right" },
      ],
      margin: [40, 10, 40, 0],
    };
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
      footer: (currentPage, pageCount) => {
        return this.generateFooter(currentPage, pageCount);
      },
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
const signatureLabelKeyRegexp = /^signature\d$/;

export class PdfgenPapir extends Pdfgen {
  newSignature(signature, isFirstSignature) {
    const signatureLines = [];
    if (signature?.label) {
      signatureLines.push({ text: this.translate(signature.label), style: "groupHeader" });
      if (signature.description) {
        signatureLines.push({ text: this.translate(signature.description) });
      }
      signatureLines.push(" ");
      signatureLines.push(" ");
    }
    let descriptionOfSignatures;
    if (isFirstSignature && this.form?.properties?.descriptionOfSignatures) {
      descriptionOfSignatures = { text: this.form.properties.descriptionOfSignatures };
    }
    return [
      " ",
      descriptionOfSignatures || " ",
      " ",
      " ",
      {
        stack: [
          ...signatureLines,
          "_____________________________________\t\t_____________________________________",
          `${this.translate("Sted og dato")}\t\t\t\t\t\t\t\t\t\t\t\t\t ${this.translate("Underskrift")}`,
        ],
        unbreakable: true,
      },
    ];
  }

  static extractSignatures(properties) {
    if (properties?.signatures) {
      const signatureLabels = Object.keys(properties?.signatures).filter(
        (key) => signatureLabelKeyRegexp.test(key) && properties.signatures[key]
      );
      return signatureLabels.map((label) => ({
        label: properties.signatures[label],
        description: properties.signatures[`${label}Description`],
      }));
    }

    return [];
  }

  generateSignatures() {
    const signatures = PdfgenPapir.extractSignatures(this.form?.properties);
    if (this.form?.properties?.hasLabeledSignatures && signatures.length > 0) {
      return signatures.flatMap((signature, index) => this.newSignature(signature, index === 0));
    }
    return this.newSignature();
  }

  generateContentFromSubmission() {
    return [...this.generateHeader(), ...this.generateBody(), ...this.generateSignatures()];
  }
}
