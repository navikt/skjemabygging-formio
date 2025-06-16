import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';

export const addButtonStyles = makeStyles({
  addButton: {
    borderRadius: 'var(--a-border-radius-large)',
    margin: 'var(--a-space-12) var(--a-space-16) var(--a-space-12) 0',
  },
});

export const useTextFieldStyles = makeStyles({
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  deleteButton: {
    borderRadius: 'var(--a-border-radius-large)',
    margin: '0 var(--a-space-12) 0 0',
  },
  textField: {
    padding: 'var(--a-space-12) var(--a-space-32) 0 0',
    width: '100%',
  },
  textFieldWithDeleteButton: {
    padding: 'var(--a-space-12) var(--a-space-12) 0 0',
    width: '100%',
  },
  hidden: {
    display: 'none',
  },
});

export const useFieldsetErrorMessageStyles = makeStyles({
  message: {
    display: 'flex',
    gap: 'var(--a-space-4)',
    color: 'var(--a-red-500)',
    marginTop: '.25rem',
    height: '1rem',
  },
  icon: {
    marginTop: '0.15em',
    flex: '0 0 auto',
    height: '100%',
  },
});

export const enableIntroPageSwitchStyles = makeStyles({
  enableSwitch: {
    margin: '0 0 2rem 0',
  },
});
