import { formSummaryUtil, NavFormType, navFormUtils, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguages } from '../../../context/languages';
import { useAppConfig } from '../../../index';
import { PanelValidation } from '../../../util/form/panel-validation/panelValidation';
import ComponentSummary from '../component/ComponentSummary';

interface Props {
  form: NavFormType;
  formUrl: string;
  submission?: Submission;
  panelValidationList?: PanelValidation[];
}

const FormSummary = ({ form, formUrl, submission, panelValidationList }: Props) => {
  const { translate, currentLanguage } = useLanguages();
  const { submissionMethod } = useAppConfig();
  // @ts-ignore <- remove when createFormSummaryObject is converted to typescript
  const summaryComponents: SummaryComponent[] = formSummaryUtil.createFormSummaryPanels(
    form,
    submission,
    translate,
    false,
    currentLanguage,
  );
  const activePanels = navFormUtils
    .getActivePanelsFromForm(form, submission, submissionMethod)
    .map((panel) => panel.key);
  const summaryPanels = summaryComponents.filter((component) => activePanels.includes(component.key));

  if (summaryPanels.length === 0) {
    return null;
  }
  return <ComponentSummary components={summaryPanels} formUrl={formUrl} panelValidationList={panelValidationList} />;
};
export default FormSummary;
