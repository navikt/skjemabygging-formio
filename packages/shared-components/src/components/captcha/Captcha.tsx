import { FyllutFrontendConfig } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect } from 'react';
import { createSolvedChallenge } from '../../api/captcha/captcha';
import { useAppConfig } from '../../context/config/configContext';
import { useSendInn } from '../../context/sendInn/sendInnContext';
import makeStyles from '../../util/styles/jss/jss';

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
  const { setCaptchaValue } = useSendInn();
  const { config, http, logger } = useAppConfig();
  const styles = useStyles();

  const useCaptchaPow = (config as FyllutFrontendConfig | undefined)?.useCaptchaPow;

  useEffect(() => {
    if (!useCaptchaPow) {
      return;
    }
    // Solve the proof of work challenge up front, so it is ready when the user submits.
    // If it has expired by then, a new challenge is fetched and solved on submit.
    const pendingChallenge = createSolvedChallenge(http).catch((error) => {
      logger?.info('Failed to solve captcha challenge', { error: error.message });
      return undefined;
    });
    setCaptchaValue((value) => ({ ...value, pendingChallenge }));
  }, [useCaptchaPow, http, logger, setCaptchaValue]);

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
      onChange={(event) => setCaptchaValue((value) => ({ ...value, firstName: event.target.value }))}
      aria-hidden
    />
  );
};

export default Captcha;
