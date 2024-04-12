import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';

export const useStyles = makeStyles({
  titleRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '3rem',
  },
  main: {
    display: 'flex',
    marginBottom: '3rem',
    width: '100%',
    flexDirection: 'column',
  },
  submitButton: {
    alignSelf: 'flex-start',
  },
});
