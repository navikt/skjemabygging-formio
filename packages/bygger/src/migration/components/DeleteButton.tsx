import { TrashIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';

const useStyles = makeStyles({
  button: {
    height: 'fit-content',
    minWidth: 'fit-content',
    alignSelf: 'end',
  },
});

const DeleteButton = ({ className, onClick }: { className?: string; onClick: () => void }) => {
  const styles = useStyles();
  return (
    <Button
      className={`${styles.button} ${className}`}
      type="button"
      variant="tertiary"
      icon={<TrashIcon aria-hidden />}
      onClick={onClick}
    ></Button>
  );
};

export default DeleteButton;
