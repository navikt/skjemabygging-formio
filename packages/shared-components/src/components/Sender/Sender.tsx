import SenderOrganization from './SenderOrganization';
import SenderPerson from './SenderPerson';
import { SenderProps } from './types';

const Sender = (props: SenderProps) => {
  const { role } = props;

  return <>{role === 'organization' ? <SenderOrganization {...props} /> : <SenderPerson {...props} />}</>;
};

export default Sender;
