const base64Encode = (data: string) => {
  return Buffer.from(data).toString('base64');
};

const base64EncodeByteArray = (data: number[]) => {
  return Buffer.from(data).toString('base64');
};

const base64Decode = (data: string | null) => {
  return data ? Buffer.from(data, 'base64') : undefined;
};

export { base64Decode, base64Encode, base64EncodeByteArray };
