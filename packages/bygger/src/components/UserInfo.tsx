import { PersonGroupIcon } from '@navikt/aksel-icons';
import { useAuth } from '../context/auth-context';

const UserInfo = () => {
  const { userData } = useAuth();
  if (userData) {
    return <PersonGroupIcon title={`${userData.name} (${userData.NAVident || 'formio-internal'})`} />;
  }
  return null;
};

export default UserInfo;
