import { Box, Label } from '@navikt/ds-react';
import FormStatus from './FormStatus';
import LabeledTimeAndUser from './LabeledTimeAndUser';
import PublishedLanguages from './PublishedLanguages';
import ResetFormButton from './ResetFormButton';
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
  const styles = useStatusStyles({ spacing } as Jss.Theme);
  const { changedAt, changedBy, publishedAt, publishedBy, publishedLanguages, status } = formStatusProperties;

  return (
    <Box className={styles.container}>
      <div className={styles.panelItem} data-cy="form-status">
        <Label>Status:</Label>
        <div className={styles.sidePanelFormStatusContainer}>
          <FormStatus status={determineStatus(formStatusProperties)} size="large" />
        </div>
        <ResetFormButton className={styles.resetFormButton} formStatusProperties={formStatusProperties} />
        {!hideToggleDiffButton && publishedAt && <ToggleDiffButton className={styles.toggleDiffButton} />}
      </div>
      <LabeledTimeAndUser label="Sist lagret:" timestamp={changedAt} userName={changedBy} />
      <LabeledTimeAndUser
        label="Sist publisert:"
        timestamp={status !== 'unpublished' ? publishedAt : undefined}
        userName={publishedBy}
        spacing={spacing}
      />
      <LabeledTimeAndUser
        label="Avpublisert:"
        timestamp={status === 'unpublished' ? publishedAt : undefined}
        userName={publishedBy}
        spacing={spacing}
      />
      <PublishedLanguages publishedLanguages={publishedLanguages} />
    </Box>
  );
};

export default FormStatusPanel;
