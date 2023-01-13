import {
  FormSummaryComponent,
  FormSummaryPanel,
  formSummaryUtil,
  NavFormType,
} from "@navikt/skjemadigitalisering-shared-domain";

const style = () => `
<style>
    body {}
    h1, h2, h3, h4, .spm {font-family: Arial;}
    .svar {margin-bottom: 5px; font-family: "Courier New", sans-serif;}
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

const field = (component: FormSummaryComponent) => `
  <div class="spm">${component.label}</div>
  <div class="svar">- ${component.value}</div>
`;

const section = (formSection: FormSummaryPanel) => `
  <h2>${formSection.label}</h2>
  ${formSection.components.map(field).join("")}
`;

export const body = (formSummaryObject: FormSummaryPanel[]) => {
  console.log("formSubmission", JSON.stringify(formSummaryObject, null, 2));
  return `
<body>
    ${formSummaryObject.map(section).join("")}
</body>
  `;
};

export const createHtmlFromSubmission = (form: NavFormType, submission: any, translations: any, isTest: boolean) => {
  const lang = "no";

  console.log("submission", submission);
  console.log("translations", translations);

  const formSummaryObject: FormSummaryPanel[] = formSummaryUtil.createFormSummaryObject(form, submission);
  console.log(body(formSummaryObject));
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${lang}" lang="${lang}">
  ${head(form.title)}
  ${body(formSummaryObject)}
</html>
  `;
};
