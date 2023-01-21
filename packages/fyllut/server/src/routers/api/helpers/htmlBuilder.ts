import {
  FormPropertiesType,
  FormSummaryComponent,
  FormSummaryContainer,
  FormSummaryField,
  FormSummaryImage,
  FormSummaryPanel,
  FormSummarySelectboxes,
  formSummaryUtil,
  NavFormType,
  NewFormSignatureType,
  signatureUtils,
} from "@navikt/skjemadigitalisering-shared-domain";

type TranslateFunction = (text: string) => string;
const calcImageWidth = (widthInPercentage: number) => {
  const MAX_WIDTH = 500;
  return (MAX_WIDTH * widthInPercentage) / 100;
};

const style = () => `
<style>
    body {}
    h1, h2, h3, h4, .spm {font-family: Arial;}
    .svar {margin-bottom: 5px; font-family: "Courier New", sans-serif;}
    .alt {margin-bottom: 5px; font-family: "Courier New", sans-serif; font-style: italic;}
    .innrykk {margin: 0px 0px 10px 20px;}
    .underskrift {margin-bottom: 30px;}
</style>
`;

const head = (title: string) => `
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>${title}</title>
    ${style()}
</head>
`;

const field = (component: FormSummaryField) => `
  <div class="spm">${component.label}</div>
  <div class="svar">- ${component.value}</div>
`;

const img = (component: FormSummaryImage) => `
  <div>
    <div class="spm">${component.label}</div>
    <img src="${component.value}" alt="${component.alt}" width="${calcImageWidth(component.widthPercent)}"/>
    <div class="alt">${component.alt}</div>
  </div>
`;

function multipleAnswers(component: FormSummarySelectboxes) {
  return `<div class="spm">${component.label}</div>
${component.value.map((val) => `<div class="svar">- ${val}</div>`).join("")}`;
}

const sectionContent = (components: FormSummaryComponent[], level: number): string => {
  return components
    .map((component) => {
      switch (component.type) {
        case "fieldset":
          return sectionContent(component.components, level);
        case "panel":
        case "navSkjemagruppe":
        case "datagrid":
          return subsection(component, level);
        case "datagrid-row":
          const label = `<div class="spm">${component.label}</div>`;
          return `
            ${component.label === "" ? "" : label}
            ${sectionContent(component.components, level)}
          `;
        case "selectboxes":
          return multipleAnswers(component as FormSummarySelectboxes);
        case "image":
          return img(component as FormSummaryImage);
        default:
          return field(component as FormSummaryField);
      }
    })
    .join("");
};

const h3 = (label: string) => `<h3>${label}</h3>`;
const h4 = (label: string) => `<h4>${label}</h4>`;

const subsection = (component: FormSummaryContainer, level: number) => `
  <div class="innrykk">
    ${level <= 1 ? h3(component.label) : h4(component.label)}
    ${sectionContent(component.components, level + 1)}
  </div>
`;

const section = (formSection: FormSummaryPanel) => `
  <h2>${formSection.label}</h2>
  ${sectionContent(formSection.components, 1)}
`;

const body = (formSummaryObject: FormSummaryPanel[], signatures?: string) => {
  console.log("formSubmission", JSON.stringify(formSummaryObject, null, 2));
  return `
    <body>
      ${formSummaryObject.map(section).join("")}
      ${signatures || ""}
    </body>
  `;
};

const signature = ({ label, description, key }: NewFormSignatureType, translate: TranslateFunction) =>
  `<h3>${translate(label)}</h3>
<p>${translate(description)}</p>
<div>_____________________________________________________________</div>
<div class="underskrift">${translate("Sted og dato")}</div>
<div>_____________________________________________________________</div>
<div class="underskrift">${translate("Underskrift")}</div>`;

const signatureSection = (formProperties: FormPropertiesType, translate: TranslateFunction) => {
  const { signatures, descriptionOfSignatures } = formProperties;
  const signatureList = signatureUtils.mapBackwardCompatibleSignatures(signatures);

  return `<h2>${translate("Underskrift")}</h2>
<p>${translate("Signér på de stedene som er aktuelle for din stønad.")}</p>
<p class="underskrift">${translate(descriptionOfSignatures || "")}</p>
${signatureList.map((signatureObject) => signature(signatureObject, translate))}`;
};

const createHtmlFromSubmission = (
  form: NavFormType,
  submission: any,
  translations: any,
  isTest: boolean,
  lang: string = "nb-NO"
) => {
  const translate = (text: string): string => translations[text] || text;
  console.log("submission", submission);
  console.log("translations", translations);

  const formSummaryObject: FormSummaryPanel[] = formSummaryUtil.createFormSummaryObject(form, submission, translate);

  console.log(form.properties);
  // console.log(body(formSummaryObject));
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${lang}" lang="${lang}">
  ${head(translate(form.title))}
  ${body(formSummaryObject, signatureSection(form.properties, translate))}
</html>
  `;
};

export { createHtmlFromSubmission, body, signatureSection };
