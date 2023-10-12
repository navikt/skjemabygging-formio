import { People } from '@navikt/ds-icons';
import { useAuth } from '../context/auth-context';

const UserInfo = () => {
  const { userData } = useAuth();
  if (userData) {
    return <People title={`${userData.name} (${userData.NAVident || 'formio-internal'})`} />;
  }
  return null;
};

export default UserInfo;
