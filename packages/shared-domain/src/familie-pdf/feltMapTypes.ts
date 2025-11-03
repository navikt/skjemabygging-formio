export interface FeltMap {
  label: string;
  verdiliste: VerdilisteElement[];
  pdfConfig: PdfConfig;
  skjemanummer?: string | null; // Optional and can be null
  bunntekst: EkstraBunntekst | null;
  vannmerke?: string | null;
}

export interface VerdilisteElement {
  label: string;
  verdi?: string | null; // Optional and can be null
  visningsVariant?: string | null;
  verdiliste?: VerdilisteElement[] | null; // Recursive and nullable
}

export interface PdfConfig {
  harInnholdsfortegnelse: boolean;
  språk: string;
}

export interface EkstraBunntekst {
  upperleft: string | null;
  lowerleft: string | null;
  upperMiddle: string | null;
  lowerMiddle: string | null;
  upperRight: string | null;
}
