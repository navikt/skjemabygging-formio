import {
  FormPropertiesType,
  formSummaryUtil,
  NavFormType,
  NewFormSignatureType,
  signatureUtils,
  Submission,
  Summary,
} from "@navikt/skjemadigitalisering-shared-domain";

type TranslateFunction = (text: string) => string;
const calcImageWidth = (widthInPercentage: number) => {
  const MAX_WIDTH = 500;
  return (MAX_WIDTH * widthInPercentage) / 100;
};

const createHtmlFromSubmission = (
  form: NavFormType,
  submission: Submission,
  submissionMethod: string,
  translate: (text: string) => string,
  lang: string = "nb"
) => {
  const symmaryPanels: Summary.Panel[] = formSummaryUtil.createFormSummaryPanels(form, submission, translate);
  const signatures = signatureSection(form.properties, submissionMethod, translate);

  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${lang}" lang="${lang}">
${head(translate(form.title))}
${body(symmaryPanels, signatures)}
</html>`;
};

const head = (title: string) => `
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<title>${title}</title>
${style()}
</head>`;

const style = () => `
<style>
body {}
h1, h2, h3, h4, .spm {font-family: Arial;}
h3 {margin-bottom: 2px}
h4 {margin: 4px auto 2px auto}
p {margin: 0}
.svar {margin-bottom: 5px; font-family: "Courier New", sans-serif;}
.label {font-weight: bold;}
.alert {margin-bottom: 5px;}
.row-label {margin-bottom: 2px; font-family: "Arial", sans-serif; font-weight: bold; text-decoration: underline}
.row {margin-bottom: 12px;}
.alt {margin-bottom: 5px; font-family: "Courier New", sans-serif; font-style: italic;}
.innrykk {margin: 0px 0px 10px 20px;}
.underskrift {margin-bottom: 30px;}
</style>`;

const body = (formSummaryObject: Summary.Panel[], signatures?: string) => `
<body>
${formSummaryObject.map(section).join("")}
${signatures || ""}
</body>`;

const section = (formSection: Summary.Panel) => `
<h2>${formSection.label}</h2>
${sectionContent(formSection.components, 1)}`;

const sectionContent = (components: Summary.Component[], level: number): string => {
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
          return datagridRow(component, level);
        case "selectboxes":
          return multipleAnswers(component);
        case "image":
          return img(component);
        case "alertstripe":
          return alert(component);
        default:
          return field(component);
      }
    })
    .join("");
};

const h3 = (label: string) => `<h3>${label}</h3>`;
const h4 = (label: string) => `<h4>${label}</h4>`;
const addInnrykkClass = (level: number) => (level <= 2 ? 'class="innrykk"' : "");

const subsection = (component: Summary.Fieldset | Summary.Panel | Summary.DataGrid, level: number) => `
${level <= 1 ? h3(component.label) : h4(component.label)}
<div ${addInnrykkClass(level)}>
${sectionContent(component.components, level + 1)}
</div>`;

const datagridRow = (component: Summary.DataGridRow, level: number) => `
<div class="row">
${component.label ? `<div class="row-label">${component.label}</div>` : ""}
${sectionContent(component.components, level)}
</div>`;

const field = (component: Summary.Field) =>
  `<div class="spm">${component.label}</div><div class="svar">- ${component.value}</div>`;

const alert = (component: Summary.Field) =>
  `<div class="label">${component.label}</div><div class="alert">${component.value}</div>`;

const img = (component: Summary.Image) => `
<div>
<div class="spm">${component.label}</div>
<img src="${component.value}" alt="${component.alt}" width="${calcImageWidth(component.widthPercent)}"/>
<div class="alt">${component.alt}</div>
</div>
`;

const multipleAnswers = (component: Summary.Selectboxes) => `
<div class="spm">${component.label}</div>
${component.value.map((val) => `<div class="svar">- ${val}</div>`).join("")}`;

const signature = ({ label, description, key }: NewFormSignatureType, translate: TranslateFunction) => `
<h3>${translate(label)}</h3>
<div class="underskrift">${translate(description)}</div>
<div>_____________________________________________________________</div>
<div class="underskrift">${translate("Sted og dato")}</div>
<div>_____________________________________________________________</div>
<div class="underskrift">${translate("Underskrift")}</div>`;

const signatureSection = (
  formProperties: FormPropertiesType,
  submissionMethod: string,
  translate: TranslateFunction
) => {
  if (submissionMethod === "digital") {
    return "";
  }
  const { signatures, descriptionOfSignatures } = formProperties;
  const signatureList = signatureUtils.mapBackwardCompatibleSignatures(signatures);

  return `
<h2>${translate("Underskrift")}</h2>
<p class="underskrift">${translate(descriptionOfSignatures || "")}</p>
${signatureList.map((signatureObject) => signature(signatureObject, translate)).join("")}`;
};

export { createHtmlFromSubmission, body, signatureSection };
