import { Label } from '@navikt/ds-react';
import { useStatusStyles } from './styles';
import Timestamp from './Timestamp';

type Props = {
  label: string;
  timestamp?: string;
  userName?: string;
  spacing?: 'default' | 'small';
};

const LabeledTimeAndUser = ({ label, timestamp, userName, spacing = 'default' }: Props) => {
  const styles = useStatusStyles({ spacing } as Jss.Theme);
  if (!timestamp) {
    return <></>;
  }
  return (
    <div className={styles.panelItem}>
      <Label>{label}</Label>
      <Timestamp timestamp={timestamp} />
      {userName && <p className={styles.rowText}>{userName}</p>}
    </div>
  );
};

export default LabeledTimeAndUser;
