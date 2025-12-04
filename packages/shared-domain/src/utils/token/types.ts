export interface JwtToken {
  exp: number;
}

export interface NologinToken extends JwtToken {
  purpose: string;
  innsendingsId: string;
}
