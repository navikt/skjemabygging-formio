import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';

const base64Encode = (data: string) => {
  return Buffer.from(data).toString('base64');
};

const base64EncodeByteArray = (data: number[]) => {
  return Buffer.from(data).toString('base64');
};

const base64Decode = (data: string | null) => {
  return data ? Buffer.from(data, 'base64') : undefined;
};

const requireBase64Decode = (data: string | null | undefined, errorMessage: string) => {
  const decoded = base64Decode(data ?? null);
  if (!decoded) {
    throw new ResponseError('INTERNAL_SERVER_ERROR', errorMessage);
  }

  return decoded;
};

export { base64Decode, base64Encode, base64EncodeByteArray, requireBase64Decode };
