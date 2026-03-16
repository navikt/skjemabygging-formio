import { SenderProps } from '@navikt/skjemadigitalisering-shared-domain';
import SenderOrganization from './SenderOrganization';
import SenderPerson from './SenderPerson';

const Sender = (props: SenderProps) => {
  const { role } = props;

  return <>{role === 'organization' ? <SenderOrganization {...props} /> : <SenderPerson {...props} />}</>;
};

export default Sender;
