import { JWTPayload } from "jose";

export type User = {
  name: string;
  preferredUsername: string;
  NAVident: string;
  isAdmin: boolean;
};

export type AzureAdTokenPayload = {
  name: string;
  preferred_username: string;
  NAVident: string;
  groups?: string[];
} & JWTPayload;
