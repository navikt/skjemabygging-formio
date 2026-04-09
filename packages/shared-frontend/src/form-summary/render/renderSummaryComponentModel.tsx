import { ResolvedComponentModel } from '@navikt/skjemadigitalisering-shared-form';
import SummaryTextFieldModel from '../models/text-field/SummaryTextFieldModel';

const renderSummaryComponentModel = (componentModel: ResolvedComponentModel) => {
  switch (componentModel.type) {
    case 'textField':
      return <SummaryTextFieldModel componentModel={componentModel} />;
    default:
      return null;
  }
};

export { renderSummaryComponentModel };
