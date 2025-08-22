import makeStyles from '../../util/styles/jss/jss';

export const usePhoneNumberStyles = makeStyles({
  wrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '.5rem',
  },
  areaCodesSelect: {
    flex: 2,
  },
  phoneNumber: {
    flex: 3,
  },
  error: {
    marginTop: '0.5rem',
  },
});
