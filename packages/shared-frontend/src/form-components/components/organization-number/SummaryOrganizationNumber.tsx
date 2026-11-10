import { formatOrganizationNumber } from '@navikt/skjemadigitalisering-shared-domain';
import { OrganizationNumberDefinition } from '../../component-types';
import { DefaultAnswer } from '../../shared';
import { FormComponentProps } from '../../types';

const SummaryOrganizationNumber = (props: FormComponentProps<OrganizationNumberDefinition>) => {
  return <DefaultAnswer {...props} valueFormat={formatOrganizationNumber} />;
};

export default SummaryOrganizationNumber;
