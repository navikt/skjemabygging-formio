import {
  DeclarationType,
  FormPropertiesType,
  formSummaryUtil,
  NavFormType,
  NewFormSignatureType,
  signatureUtils,
  Submission,
  SummaryActivity,
  SummaryAddress,
  SummaryAttachment,
  SummaryComponent,
  SummaryDataFetcher,
  SummaryDataGrid,
  SummaryDataGridRow,
  SummaryField,
  SummaryFieldset,
  SummaryPanel,
  SummarySelectboxes,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';

type TranslateFunction = (text: string) => string;

const createHtmlFromSubmission = (
  form: NavFormType,
  submission: Submission,
  submissionMethod: string,
  translate: (text: string) => string,
  lang: string = 'nb',
) => {
  const symmaryPanels: SummaryPanel[] = formSummaryUtil.createFormSummaryPanels(
    form,
    submission,
    translate,
    true,
    lang,
  );
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
.html {margin-bottom: 5px;}
.row-label {margin-bottom: 2px; font-family: "Arial", sans-serif; font-weight: bold; text-decoration: underline}
.row {margin: 12px 0 24px 0;}
.alt {margin-bottom: 5px; font-family: "Courier New", sans-serif; font-style: italic;}
.innrykk {margin: 0px 0px 10px 20px;}
.underskrift {margin-bottom: 30px;}
</style>`;

const body = (formSummaryObject: SummaryPanel[], confirmation?: string, signatures?: string) => `
<body>
${formSummaryObject.map(section).join('')}
${confirmation || ''}
${signatures || ''}
</body>`;

const section = (formSection: SummaryPanel) => `
<h2>${formSection.label}</h2>
${sectionContent(formSection.components, 1)}`;

const sectionContent = (components: SummaryComponent[], level: number): string => {
  return components
    .filter((component) => !component.hiddenInSummary)
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
        case 'dataFetcher':
        case 'selectboxes':
          return multipleAnswers(component);
        case 'alertstripe':
        case 'htmlelement':
          return html(component);
        case 'activities':
          return activity(component);
        case 'drivinglist':
          return drivingList(component);
        case 'navAddress':
          return address(component);
        case 'attachment':
          return attachment(component as SummaryAttachment);
        default:
          return field(component);
      }
    })
    .join('');
};

const h3 = (label: string) => `<h3>${label}</h3>`;
const h4 = (label: string) => `<h4>${label}</h4>`;
const addInnrykkClass = (level: number) => (level <= 2 ? 'class="innrykk"' : '');

const subsection = (component: SummaryFieldset | SummaryPanel | SummaryDataGrid, level: number) => `
${level <= 1 ? h3(component.label) : h4(component.label)}
<div ${addInnrykkClass(level)}>
${sectionContent(component.components, level + 1)}
</div>`;

const datagridRow = (component: SummaryDataGridRow, level: number) => `
<div class="row">
${component.label ? `<div class="row-label">${component.label}</div>` : ''}
${sectionContent(component.components, level)}
</div>`;

const field = (component: SummaryField) =>
  `<div class="spm">${component.label}</div><div class="svar">: ${component.value}</div>`;

const attachment = (component: SummaryAttachment) => {
  let html = `<div class="spm">${component.label}</div><div class="svar">: ${component.value.description}</div>`;
  if (component.value.additionalDocumentationLabel && component.value.additionalDocumentation) {
    html += `<div class="spm">${component.value.additionalDocumentationLabel}</div><div class="svar">: ${component.value.additionalDocumentation}</div>`;
  }
  if (component.value.deadlineWarning) {
    html += `<div class="html">${component.value.deadlineWarning}</div>`;
  }

  return html;
};

const address = (component: SummaryAddress) =>
  `<div class="spm">${component.label}</div><div class="svar">: ${component.value}</div>`;

const activity = (component: SummaryActivity) =>
  `<div class="spm">${component.label}</div><div class="svar">: ${component.value.text}</div>`;

const drivingList = (component) => `
  <div class="spm">${component.label}</div>
  <div class="svar"> 
    <p>${component.value.description}</p>
    <ul>
      ${component.value.dates
        .map((date) => {
          return `<li key="${date.key}">${date.text}</li>`;
        })
        .join('')}
    </ul>
  </div>`;

const html = (component: SummaryField) => {
  if (component.label) {
    return field(component);
  }
  return `<div class="html">${component.value}</div>`;
};

const multipleAnswers = (component: SummarySelectboxes | SummaryDataFetcher) => `
<div class="spm">${component.label}</div>
${component.value.map((val) => `<div class="svar">: ${val}</div>`).join('')}`;

const signature = ({ label, description, _key }: NewFormSignatureType, translate: TranslateFunction) => `
<h3>${translate(label)}</h3>
<div class="underskrift">${description ? translate(description) : ''}</div>
<div class="underskrift">${translate(TEXTS.pdfStatiske.placeAndDate)} ___________________________________________________</div>
<div class="underskrift">${translate(TEXTS.pdfStatiske.signature)} ____________________________________________________</div>
<div class="underskrift">${translate(TEXTS.pdfStatiske.signatureName)} ________________________________________</div>`;

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
