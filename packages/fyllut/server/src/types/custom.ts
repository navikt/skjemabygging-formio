import { JWTPayload } from "jose";

export type IdportenTokenPayload = {
  pid: string;
} & JWTPayload;
