import makeStyles from '../../util/styles/jss/jss';

export const useAttachmentStyles = makeStyles({
  button: {
    maxWidth: '18.75rem',
    borderRadius: 'var(--ax-radius-8)',
  },
  uploadedFilesHeader: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  deleteAllButton: {
    display: 'flex',
    alignSelf: 'flex-end',
  },
  addAnotherAttachmentButton: {
    maxWidth: '18.75rem',
  },
});
