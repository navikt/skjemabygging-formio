import makeStyles from '../../util/styles/jss/jss';

export const usePhoneNumberStyles = makeStyles({
  wrapper: {
    display: 'flex',
    gap: '.5rem',
  },
  areaCodesSelect75: {
    flex: 0.75,
    maxWidth: '4.8rem',
  },
  areaCodesSelect65: {
    flex: 0.65,
    maxWidth: '4.5rem',
  },
  phoneNumber: {
    maxWidth: '30%',
    flex: 3,
  },
  error: {
    marginTop: '0.5rem',
  },
});
