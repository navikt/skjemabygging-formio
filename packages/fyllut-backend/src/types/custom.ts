import { JWTPayload } from 'jose';

export type QueryParamSub = 'digital' | 'paper' | 'digitalnologin' | undefined;

export type IdportenTokenPayload = {
  pid: string;
} & JWTPayload;
