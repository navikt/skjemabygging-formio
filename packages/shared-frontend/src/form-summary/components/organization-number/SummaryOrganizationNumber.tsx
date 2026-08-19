import { formatOrganizationNumber } from '@navikt/skjemadigitalisering-shared-domain';
import { DefaultAnswer } from '../../shared';
import { FormComponentProps } from '../../types';

const SummaryOrganizationNumber = (props: FormComponentProps) => {
  return <DefaultAnswer {...props} valueFormat={formatOrganizationNumber} />;
};

export default SummaryOrganizationNumber;
