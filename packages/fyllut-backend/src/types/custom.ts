import { JWTPayload } from 'jose';

export type QueryParamSub = 'digital' | 'paper' | undefined;

export type IdportenTokenPayload = {
  pid: string;
} & JWTPayload;
