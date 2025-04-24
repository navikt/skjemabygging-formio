export interface FeltMap {
  label: string;
  verdiliste: VerdilisteElement[];
  pdfConfig: PdfConfig;
  skjemanummer?: string | null; // Optional and can be null
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
