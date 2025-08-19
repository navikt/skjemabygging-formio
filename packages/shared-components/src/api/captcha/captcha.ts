import { AppConfigContextType } from '../../context/config/configContext';

interface CaptchaResponse {
  success: boolean;
  access_token?: string;
}

const DEFAULT = 'ja';

const submitCaptchaValue = async (
  data: Record<string, string>,
  config: AppConfigContextType,
): Promise<CaptchaResponse | undefined> => {
  const { http } = config;
  return http?.post('/fyllut/api/captcha', { ...data, data_33: DEFAULT });
};

export { submitCaptchaValue };
