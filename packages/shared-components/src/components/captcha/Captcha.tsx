import makeStyles from '../../util/styles/jss/jss';
import { useAttachmentUpload } from '../attachment/AttachmentUploadContext';

const useStyles = makeStyles({
  firstNameInput: {
    opacity: 0,
    position: 'absolute',
    top: '-2000px',
    left: '-2000px',
    width: '1px',
    height: '1px',
    zIndex: -1,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
});

const Captcha = () => {
  const { setCaptchaValue } = useAttachmentUpload();
  const styles = useStyles();
  return (
    <input
      type="text"
      id="firstName"
      title="firstName"
      data-cy="firstName"
      tabIndex={-1}
      autoComplete="off"
      required
      className={styles.firstNameInput}
      onChange={(value) => setCaptchaValue({ firstName: value.target.value })}
      aria-hidden
    />
  );
};

export default Captcha;
