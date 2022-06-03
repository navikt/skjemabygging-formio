import { createFormSummaryObject, signatureUtils } from "@navikt/skjemadigitalisering-shared-domain";
import { DateTime } from "luxon";
import PdfPrinter from "pdfmake";

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
    try {
      const now = DateTime.local().setZone("Europe/Oslo");
      const generator = new this(submission, form, gitVersion, now, translations);
      const docDefinition = generator.generateDocDefinition();
      generator.writeDocDefinitionToStream(docDefinition, stream);
    } catch (err) {
      if (typeof err === "string" || err instanceof String) {
        throw new Error(err);
      }
      throw err;
    }
  }
  static generatePdfByteArray(submission, form, gitVersion, translations) {
    return new Promise((resolve, reject) => {
      try {
        const now = DateTime.local().setZone("Europe/Oslo");
        const generator = new this(submission, form, gitVersion, now, translations);
        const docDefinition = generator.generateDocDefinition();
        const doc = printer.createPdfKitDocument(docDefinition);
        const chunks = [];
        doc.on("data", function (chunk) {
          chunks.push(chunk);
        });
        doc.on("end", function () {
          const result = Buffer.concat(chunks);
          resolve(Array.from(result));
        });
        doc.end();
      } catch (err) {
        if (typeof err === "string" || err instanceof String) {
          reject(new Error(err));
        } else {
          reject(err);
        }
      }
    });
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
      imageLabel: {
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
    if (body.length === 0) {
      return [];
    }
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
          if (component.showInPdf !== false) {
            return [this.createImageWithAlt(component)];
          }
          return [];
        default:
          return [
            this.createRow(this.translate(component.label), this.translate(component.value), false, areSubComponents),
          ];
      }
    });
  }

  createImageWithAlt(img) {
    const maxWidth = 500;
    return [
      {
        stack: [
          { text: this.translate(img.label), style: "imageLabel" },
          {
            image: img.value,
            width: (maxWidth * img.widthPercent) / 100,
            maxWidth: maxWidth,
            maxHeight: 400,
            alt: img.alt,
          },
          { text: img.alt, style: "cursive" },
        ],
        colSpan: 2,
      },
      "",
    ];
  }

  mapFormSummaryObjectToTables(formSummaryObject) {
    return formSummaryObject.flatMap((panel) => {
      const header = { text: this.translate(panel.label), style: "subHeader" };
      const body = this.componentsToBody(panel.components);
      if (body.length === 0) {
        return [];
      }
      const tableWithBody = this.createTableWithBody(body);
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
    const panels = formSummaryObject.filter((component) => component.type === "panel");
    const homelessComponents = formSummaryObject.filter((component) => component.type !== "panel");
    const homelessComponentsTable = this.createTableWithBody(this.componentsToBody(homelessComponents));
    return [homelessComponentsTable, ...this.mapFormSummaryObjectToTables(panels)];
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
      descriptionOfSignatures = { text: this.translate(this.form.properties.descriptionOfSignatures) };
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

  generateSignatures() {
    const signatures = signatureUtils.mapBackwardCompatibleSignatures(this.form?.properties?.signatures);

    if (signatureUtils.hasOnlyDefaultSignaturesValues(signatures)) {
      return this.newSignature();
    }

    if (signatures?.length > 0) {
      return signatures.flatMap((signature, index) => this.newSignature(signature, index === 0));
    }

    return [];
  }

  generateContentFromSubmission() {
    return [...this.generateHeader(), ...this.generateBody(), ...this.generateSignatures()];
  }
}
