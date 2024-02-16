import {
  DeclarationType,
  FormPropertiesType,
  formSummaryUtil,
  NavFormType,
  NewFormSignatureType,
  signatureUtils,
  Submission,
  Summary,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';

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
  lang: string = 'nb',
) => {
  const symmaryPanels: Summary.Panel[] = formSummaryUtil.createFormSummaryPanels(form, submission, translate);
  const confirmation = createConfirmationSection(form, translate);
  const signatures = signatureSection(form.properties, submissionMethod, translate);

  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${lang}" lang="${lang}">
${head(translate(form.title))}
${body(symmaryPanels, confirmation, signatures)}
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
.row {margin: 12px 0 24px 0;}
.alt {margin-bottom: 5px; font-family: "Courier New", sans-serif; font-style: italic;}
.innrykk {margin: 0px 0px 10px 20px;}
.underskrift {margin-bottom: 30px;}
</style>`;

const body = (formSummaryObject: Summary.Panel[], confirmation?: string, signatures?: string) => `
<body>
${formSummaryObject.map(section).join('')}
${confirmation || ''}
${signatures || ''}
</body>`;

const section = (formSection: Summary.Panel) => `
<h2>${formSection.label}</h2>
${sectionContent(formSection.components, 1)}`;

const sectionContent = (components: Summary.Component[], level: number): string => {
  return components
    .map((component) => {
      switch (component.type) {
        case 'fieldset':
          return sectionContent(component.components, level);
        case 'panel':
        case 'navSkjemagruppe':
        case 'datagrid':
          return subsection(component, level);
        case 'datagrid-row':
          return datagridRow(component, level);
        case 'selectboxes':
          return multipleAnswers(component);
        case 'image':
          return img(component);
        case 'alertstripe':
          return alert(component);
        case 'attachment':
          return attachment(component as Summary.Attachment);
        case 'htmlelement':
          return htmlelement(component);
        default:
          return field(component);
      }
    })
    .join('');
};

const h3 = (label: string) => `<h3>${label}</h3>`;
const h4 = (label: string) => `<h4>${label}</h4>`;
const addInnrykkClass = (level: number) => (level <= 2 ? 'class="innrykk"' : '');

const subsection = (component: Summary.Fieldset | Summary.Panel | Summary.DataGrid, level: number) => `
${level <= 1 ? h3(component.label) : h4(component.label)}
<div ${addInnrykkClass(level)}>
${sectionContent(component.components, level + 1)}
</div>`;

const datagridRow = (component: Summary.DataGridRow, level: number) => `
<div class="row">
${component.label ? `<div class="row-label">${component.label}</div>` : ''}
${sectionContent(component.components, level)}
</div>`;

const field = (component: Summary.Field) =>
  `<div class="spm">${component.label}</div><div class="svar">: ${component.value}</div>`;

const attachment = (component: Summary.Attachment) => {
  let html = `<div class="spm">${component.label}</div><div class="svar">: ${component.value.description}</div>`;
  if (component.value.additionalDocumentationLabel && component.value.additionalDocumentation) {
    html += `<div class="spm">${component.value.additionalDocumentationLabel}</div><div class="svar">: ${component.value.additionalDocumentation}</div>`;
  }
  if (component.value.deadlineWarning) {
    html += `<div class="alert">${component.value.deadlineWarning}</div>`;
  }

  return html;
};

const htmlelement = (component: Summary.Field) => {
  if (component.label) {
    return field(component);
  }
  return `<div>${component.value}</div>`;
};

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
${component.value.map((val) => `<div class="svar">: ${val}</div>`).join('')}`;

const signature = ({ label, description, _key }: NewFormSignatureType, translate: TranslateFunction) => `
<h3>${translate(label)}</h3>
<div class="underskrift">${description ? translate(description) : ''}</div>
<div class="underskrift">${translate(TEXTS.pdfStatiske.placeAndDate)} _________________________________________</div>
<div class="underskrift">${translate(TEXTS.pdfStatiske.signature)} _________________________________________</div>`;

const signatureSection = (
  formProperties: FormPropertiesType,
  submissionMethod: string,
  translate: TranslateFunction,
) => {
  if (submissionMethod === 'digital') {
    return '';
  }
  const { signatures, descriptionOfSignatures, descriptionOfSignaturesPositionUnder } = formProperties;
  const signatureList = signatureUtils.mapBackwardCompatibleSignatures(signatures);

  return signatureList.length > 0
    ? `
<h2>${translate(TEXTS.pdfStatiske.signature)}</h2>
${!descriptionOfSignaturesPositionUnder ? `<p class="underskrift">${translate(descriptionOfSignatures || '')}</p>` : ''}
${signatureList.map((signatureObject) => signature(signatureObject, translate)).join('')}
${descriptionOfSignaturesPositionUnder ? `<p class="underskrift">${translate(descriptionOfSignatures || '')}</p>` : ''}`
    : undefined;
};

const createConfirmationSection = (form: NavFormType, translate: (text: string) => string) => {
  if (
    form.properties.declarationType === DeclarationType.custom ||
    form.properties.declarationType === DeclarationType.default
  ) {
    return `<h2>${translate(TEXTS.statiske.declaration.header)}</h2> ${field({
      label:
        form.properties.declarationType === DeclarationType.custom && form.properties.declarationText
          ? translate(form.properties.declarationText)
          : translate(TEXTS.statiske.declaration.defaultText),
      type: 'textfield',
      key: '',
      value: translate(TEXTS.common.yes),
    })}`;
  }
};

export { body, createHtmlFromSubmission, signatureSection };
