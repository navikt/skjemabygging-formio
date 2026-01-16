import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';

export const useNavBarStyles = makeStyles({
  navBar: {
    height: '3.625rem',
  },
  internalHeader: {
    justifyContent: 'center',
    position: 'relative',
    minHeight: '3.625rem',
  },
  formsLink: {
    height: '100%',
    position: 'absolute',
    left: '0',
    display: 'flex',
    alignItems: 'center',
    marginRight: 'auto',
    padding: '0 30px',
    color: 'var(--ax-text-neutral)',
  },
  navBarLinks: {
    height: '3.625rem',
    display: 'flex',
  },
  headerMenus: {
    height: '100%',
    position: 'absolute',
    right: '0',
    display: 'flex',
  },
  indicateLocalBorder: {
    height: '10px',
    width: '100%',
    background:
      'linear-gradient(90deg,rgba(255, 0, 0, 1) 0%, rgba(255, 154, 0, 1) 10%,rgba(208, 222, 33, 1) 20%,rgba(79, 220, 74, 1) 30%,rgba(63, 218, 216, 1) 40%,rgba(47, 201, 226, 1) 50%,rgba(28, 127, 238, 1) 60%,  rgba(95, 21, 242, 1) 70%,rgba(186, 12, 248, 1) 80%,rgba(251, 7, 217, 1) 90%,rgba(255, 0, 0, 1) 100%)',
    opacity: '0.5',
  },
});
