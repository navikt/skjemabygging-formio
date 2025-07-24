import { Button, TextField } from '@navikt/ds-react';
import { makeStyles, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';

interface Props {
  onToken: (token: string) => void;
  onFailure: (errorMessage: string) => void;
}

const useStyles = makeStyles({
  firstName: {
    opacity: 0,
    position: 'absolute',
    top: 0,
    left: '-1000px',
    height: 0,
    width: 0,
    zIndex: -1,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
});

interface CaptchaFormData {
  data_33: string;
  firstName: string;
}

interface Challenge {
  id: string;
  expression: string;
}

const Captcha = ({ onToken, onFailure }: Props) => {
  const { http } = useAppConfig();
  const styles = useStyles();
  const [validationError, setValidationError] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [renderedAt, setRenderedAt] = useState<string>(dateUtils.getIso8601String());
  const [captchaOk, setCaptchaOk] = useState<boolean>(false);
  const [formData, setFormData] = useState<CaptchaFormData>({
    data_33: '',
    firstName: '',
  });

  useEffect(() => {
    http?.get<Challenge>('/fyllut/api/captcha').then(setChallenge);
  }, [http]);

  const handleChange = ({ name, value }: { name: string; value: string }) => {
    setValidationError(null);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setValidationError(null);
    setCaptchaOk(false);
    if (!formData.data_33) {
      setValidationError('Du må bekrefte at du ikke er en robot');
      return;
    }
    try {
      const response = await http?.post<{ access_token: string }>('/fyllut/api/captcha', {
        ...formData,
        timestampRender: renderedAt,
        timestampSubmit: dateUtils.getIso8601String(),
        challengeId: challenge?.id,
      });
      if (response?.access_token) {
        onToken(response.access_token);
        setCaptchaOk(true);
      }
    } catch (_error) {
      const errorMessage = 'Captcha feilet';
      setRenderedAt(dateUtils.getIso8601String());
      setValidationError(errorMessage);
      onFailure(errorMessage);
    }
  };

  return (
    <div className="mb">
      <form>
        <div>
          <TextField
            label="Mattespørsmål"
            description={`${challenge?.expression} =`}
            id="data_33"
            name="data_33"
            onChange={(e) => handleChange({ name: e.target.name, value: e.target.value })}
            error={validationError}
            className="mb"
            autoComplete="off"
            required
          />
        </div>

        <div className={styles.firstName} aria-hidden="true">
          <input
            type="text"
            name="firstName"
            id="firstName"
            title="First name"
            value={formData.firstName}
            onChange={(e) => handleChange({ name: e.target.name, value: e.target.value })}
            tabIndex={-1}
            autoComplete="off"
            required
          />
        </div>
        <Button onClick={handleSubmit}>Send</Button>
        {captchaOk && <div>Captcha ok</div>}
      </form>
    </div>
  );
};

export default Captcha;
