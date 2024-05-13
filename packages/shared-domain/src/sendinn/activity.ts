export interface SendInnMaalgruppe {
  gyldighetsperiode?: AktivitetPeriode;
  maalgruppetype: string;
  maalgruppenavn?: string;
}
export interface SendInnAktivitet {
  aktivitetId: string;
  aktivitetstype: string;
  aktivitetsnavn: string;
  periode: AktivitetPeriode;
  antallDagerPerUke: number;
  prosentAktivitetsdeltakelse: number;
  aktivitetsstatus: string;
  aktivitetsstatusnavn: string;
  erStoenadsberettigetAktivitet: boolean;
  erUtdanningsaktivitet: boolean;
  arrangoer: string;
  saksinformasjon: AktivitetSaksinformasjon;
  maalgruppe?: SendInnMaalgruppe;
}

export interface AktivitetPeriode {
  fom: string;
  tom?: string;
}

export interface AktivitetSaksinformasjon {
  saksnummerArena: string;
  sakstype: string;
  vedtaksinformasjon: AktivitetVedtaksinformasjon[];
}

export interface AktivitetVedtaksinformasjon {
  vedtakId: string;
  dagsats: number;
  periode: AktivitetPeriode;
  trengerParkering: boolean;
  betalingsplan: VedtakBetalingsplan[];
}

export interface VedtakBetalingsplan {
  betalingsplanId: string;
  beloep: number;
  utgiftsperiode: BetalingsplanUtgiftsperiode;
  journalpostId?: string;
}

export interface BetalingsplanUtgiftsperiode {
  fom: string;
  tom?: string;
}
