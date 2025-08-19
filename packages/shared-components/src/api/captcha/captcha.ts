import { AppConfigContextType } from '../../context/config/configContext';

interface CaptchaResponse {
  success: boolean;
  innsendingsId?: string;
  access_token?: string;
}

const DEFAULT = 'ja';

const submitCaptchaValue = async (
  data: Record<string, string>,
  config: AppConfigContextType,
): Promise<CaptchaResponse> => {
  const { http } = config;
  const result = (await http?.post('/fyllut/api/captcha', { ...data, data_33: DEFAULT })) as CaptchaResponse;
  console.log(result);
  return result;
};

export { submitCaptchaValue };
