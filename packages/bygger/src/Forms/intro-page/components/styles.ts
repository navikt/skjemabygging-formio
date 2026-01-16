import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';

export const addButtonStyles = makeStyles({
  addButton: {
    borderRadius: 'var(--ax-radius-8)',
    margin: 'var(--ax-space-12) var(--ax-space-16) var(--ax-space-12) 0',
  },
});

export const useTextFieldStyles = makeStyles({
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  deleteButton: {
    borderRadius: 'var(--ax-radius-8)',
    margin: '0 var(--ax-space-12) 0 0',
  },
  textField: {
    padding: 'var(--ax-space-12) var(--ax-space-32) 0 0',
    width: '100%',
  },
  textFieldWithDeleteButton: {
    padding: 'var(--ax-space-12) var(--ax-space-12) 0 0',
    width: '100%',
  },
  hidden: {
    display: 'none',
  },
});

export const enableIntroPageSwitchStyles = makeStyles({
  enableSwitch: {
    margin: '0 0 2rem 0',
  },
});
