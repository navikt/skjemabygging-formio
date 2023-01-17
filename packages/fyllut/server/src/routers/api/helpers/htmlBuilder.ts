import {
  FormSummaryComponent,
  FormSummaryField,
  FormSummaryImage,
  FormSummaryPanel,
  formSummaryUtil,
  NavFormType,
} from "@navikt/skjemadigitalisering-shared-domain";

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

const sectionContent = (components: FormSummaryComponent[]): string => {
  return components
    .map((component) => {
      switch (component.type) {
        case "fieldset":
          return sectionContent(component.components);
        case "image":
          return img(component as FormSummaryImage);
        default:
          return field(component as FormSummaryField);
      }
    })
    .join("");
};

const section = (formSection: FormSummaryPanel) => `
  <h2>${formSection.label}</h2>
  ${sectionContent(formSection.components)}
`;

export const body = (formSummaryObject: FormSummaryPanel[]) => {
  console.log("formSubmission", JSON.stringify(formSummaryObject, null, 2));
  return `
<body>
    ${formSummaryObject.map(section).join("")}
</body>
  `;
};

export const createHtmlFromSubmission = (
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
  console.log(body(formSummaryObject));
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${lang}" lang="${lang}">
  ${head(translate(form.title))}
  ${body(formSummaryObject)}
</html>
  `;
};
