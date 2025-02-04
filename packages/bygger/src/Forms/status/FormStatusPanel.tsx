import { Box, Label } from '@navikt/ds-react';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import FormStatus, { determineStatus } from './FormStatus';
import PublishedLanguages from './PublishedLanguages';
import Timestamp from './Timestamp';
import ToggleDiffButton from './ToggleDiffButton';
import { useStatusStyles } from './styles';

interface Props {
  form: Form;
  spacing?: 'default' | 'small';
  hideToggleDiffButton?: boolean;
}

const FormStatusPanel = ({ form, spacing, hideToggleDiffButton = false }: Props) => {
  // console.log('publishProperties', publishProperties);
  const styles = useStatusStyles({ spacing } as Jss.Theme);
  // const { modified, modifiedBy, published, publishedBy, unpublished, unpublishedBy } = publishProperties;
  const { changedAt, changedBy, publishedAt, publishedBy, properties } = form;
  const { unpublished, unpublishedBy, publishedLanguages } = properties ?? {};
  console.log('FormStatusPanel', form);

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
          <FormStatus status={determineStatus(form)} size="large" />
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
