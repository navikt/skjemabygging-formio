import { AppConfigContextType } from '../../context/config/configContext';

const DEFAULT = 'ja';

const submitCaptchaValue = async (data: Record<string, string>, config: AppConfigContextType): Promise<void> => {
  const { http } = config;
  await http?.post('/fyllut/api/captcha', { ...data, data_33: DEFAULT });
};

export { submitCaptchaValue };
