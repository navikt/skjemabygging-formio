import {
  formSummaryUtil,
  NavFormType,
  navFormUtils,
  Submission,
  SummaryComponent,
} from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguages } from '../../../context/languages';
import { useAppConfig } from '../../../index';
import { PanelValidation } from '../../../util/form/panel-validation/panelValidation';
import ComponentSummary from '../component/ComponentSummary';

interface Props {
  form: NavFormType;
  submission?: Submission;
  panelValidationList?: PanelValidation[];
}

const FormSummary = ({ form, submission, panelValidationList }: Props) => {
  const { translate, currentLanguage } = useLanguages();
  const { submissionMethod } = useAppConfig();
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
  return <ComponentSummary components={summaryPanels} panelValidationList={panelValidationList} />;
};
export default FormSummary;
