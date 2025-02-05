import { Box, Label } from '@navikt/ds-react';
import FormStatus from './FormStatus';
import PublishedLanguages from './PublishedLanguages';
import Timestamp from './Timestamp';
import ToggleDiffButton from './ToggleDiffButton';
import { useStatusStyles } from './styles';
import { FormStatusProperties } from './types';
import { determineStatus } from './utils';

interface Props {
  formStatusProperties: FormStatusProperties;
  spacing?: 'default' | 'small';
  hideToggleDiffButton?: boolean;
}

const FormStatusPanel = ({ formStatusProperties, spacing, hideToggleDiffButton = false }: Props) => {
  // console.log('publishProperties', publishProperties);
  const styles = useStatusStyles({ spacing } as Jss.Theme);
  // const { modified, modifiedBy, published, publishedBy, unpublished, unpublishedBy } = publishProperties;
  const { changedAt, changedBy, publishedAt, publishedBy, properties } = formStatusProperties;
  const { unpublished, unpublishedBy, publishedLanguages } = properties ?? {};

  const LabeledTimeAndUser = ({
    label,
    timestamp,
    userName,
  }: {
    label: string;
    timestamp?: string;
    userName?: string;
  }) => {
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

  return (
    <Box className={styles.container}>
      <div className={styles.panelItem}>
        <Label>Status:</Label>
        <div className={styles.sidePanelFormStatusContainer}>
          <FormStatus status={determineStatus(formStatusProperties)} size="large" />
        </div>
        {!hideToggleDiffButton && publishedAt && <ToggleDiffButton className={styles.toggleDiffButton} />}
      </div>
      <LabeledTimeAndUser label="Sist lagret:" timestamp={changedAt} userName={changedBy} />
      <LabeledTimeAndUser label="Sist publisert:" timestamp={publishedAt} userName={publishedBy} />
      <LabeledTimeAndUser label="Avpublisert:" timestamp={unpublished} userName={unpublishedBy} />
      <PublishedLanguages publishProperties={{ publishedAt, publishedLanguages }} />
    </Box>
  );
};

export default FormStatusPanel;
