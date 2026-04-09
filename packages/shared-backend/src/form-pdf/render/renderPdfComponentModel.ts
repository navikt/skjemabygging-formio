import { PdfData } from '@navikt/skjemadigitalisering-shared-domain';
import { ResolvedComponentModel } from '@navikt/skjemadigitalisering-shared-form';
import PdfTextFieldModel from '../models/text-field/PdfTextFieldModel';

const renderPdfComponentModel = (componentModel: ResolvedComponentModel): PdfData | null => {
  switch (componentModel.type) {
    case 'textField':
      return PdfTextFieldModel(componentModel);
    default:
      return null;
  }
};

export { renderPdfComponentModel };
