import { formSummaryUtil, NavFormType, Summary } from "@navikt/skjemadigitalisering-shared-domain";
import { useLanguages } from "../../context/languages";
import { useAppConfig } from "../../index";
import ComponentSummary from "./ComponentSummary";

interface Props {
  form: NavFormType;
  formUrl: string;
  submission: object;
}

const FormSummary = ({ form, formUrl, submission }: Props) => {
  const { logger } = useAppConfig();
  const { translate } = useLanguages();
  // @ts-ignore <- remove when createFormSummaryObject is converted to typescript
  const summaryComponents: Summary.Component[] = formSummaryUtil.createFormSummaryObject(form, submission, translate);
  const summaryPanels = summaryComponents.filter((component) => component.type === "panel");
  if (summaryPanels.length < summaryComponents.length) {
    logger?.info(
      `OBS! Skjemaet ${form.title} (${form.properties.skjemanummer}) har komponenter som ikke ligger inne i et panel`
    );
  }

  if (summaryPanels.length === 0) {
    return null;
  }
  return <ComponentSummary components={summaryPanels} formUrl={formUrl} />;
};
export default FormSummary;
