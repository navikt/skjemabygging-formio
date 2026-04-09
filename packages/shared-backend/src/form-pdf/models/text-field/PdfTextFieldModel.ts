import { PdfData } from '@navikt/skjemadigitalisering-shared-domain';
import { ResolvedTextFieldModel } from '@navikt/skjemadigitalisering-shared-form';

const PdfTextFieldModel = (componentModel: ResolvedTextFieldModel): PdfData => ({
  label: componentModel.translatedLabel,
  verdi: String(componentModel.value),
});

export default PdfTextFieldModel;
