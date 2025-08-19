import { makeStyles } from '../../index';
import { useAttachmentUpload } from '../attachment/AttachmentUploadContext';

const useStyles = makeStyles({
  firstNameInput: {
    position: 'absolute',
    top: '-2000px',
    left: '-2000px',
    width: '1px',
    height: '1px',
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
      className={styles.firstNameInput}
      onChange={(value) => setCaptchaValue({ firstName: value.target.value })}
      aria-hidden
    />
  );
};

export default Captcha;
