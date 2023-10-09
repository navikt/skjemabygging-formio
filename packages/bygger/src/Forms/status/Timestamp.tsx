import moment from 'moment';
import { useStatusStyles } from './styles';

const Timestamp = ({ timestamp }: { timestamp?: string }) => {
  const styles = useStatusStyles({});
  if (!timestamp) {
    return <></>;
  }

  const timestampAsMoment = moment(timestamp);
  const dateAndTime = `${timestampAsMoment.format('DD.MM.YY')}, kl. ${timestampAsMoment.format('HH.mm')}`;
  return <p className={styles.rowText}>{dateAndTime}</p>;
};

export default Timestamp;
