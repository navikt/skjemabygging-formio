import baseHttp from '../util/http/http';

interface CaptchaResponse {
  success: boolean;
  access_token?: string;
}

const DEFAULT = 'ja';

const submitCaptchaValue = async (
  data: Record<string, string>,
  http?: typeof baseHttp,
): Promise<CaptchaResponse | undefined> => {
  return http?.post('/fyllut/api/captcha', { ...data, data_33: DEFAULT });
};

export { submitCaptchaValue };
