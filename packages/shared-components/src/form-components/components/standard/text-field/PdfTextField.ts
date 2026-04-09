import { renderPdfComponentModel } from '@navikt/skjemadigitalisering-shared-backend/form-pdf';
import { resolveComponent } from '@navikt/skjemadigitalisering-shared-form';
import { PdfComponentProps } from '../../../types';

const PdfTextField = (props: PdfComponentProps) => {
  const componentModel = resolveComponent({
    component: props.component,
    currentLanguage: props.currentLanguage,
    submission: props.submission,
    submissionPath: props.submissionPath,
    translate: props.translate,
  });

  if (!componentModel || Array.isArray(componentModel)) {
    return null;
  }

  return renderPdfComponentModel(componentModel);
};

export default PdfTextField;
