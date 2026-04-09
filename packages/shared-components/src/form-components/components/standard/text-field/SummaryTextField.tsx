import { resolveComponent } from '@navikt/skjemadigitalisering-shared-form';
import { renderSummaryComponentModel } from '@navikt/skjemadigitalisering-shared-frontend/form-summary';
import { FormComponentProps } from '../../../types';

const SummaryTextField = (props: FormComponentProps) => {
  const componentModel = resolveComponent({
    component: props.component,
    currentLanguage: props.currentLanguage,
    formProperties: props.formProperties,
    panelValidationList: props.panelValidationList,
    submission: props.submission,
    submissionPath: props.submissionPath,
    translate: props.translate,
  });

  if (!componentModel || Array.isArray(componentModel)) {
    return null;
  }

  return renderSummaryComponentModel(componentModel);
};

export default SummaryTextField;
