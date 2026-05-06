interface PdfFormData {
  label?: string;
  verdiliste?: PdfData[];
  pdfConfig?: PdfConfig | null;
  skjemanummer?: string | null;
  bunntekst?: PdfFooter | null;
  vannmerke?: string | null;
}

interface PdfData {
  label?: string;
  verdi?: string | number | null;
  verdiliste?: PdfData[];
  visningsVariant?: string | null; // 'TABELL' | 'VEDLEGG' | 'PUNKTLISTE' | 'HTML' | 'HOLDSAMMEN'
}

interface PdfConfig {
  harInnholdsfortegnelse: boolean;
  språk: string;
}

interface PdfFooter {
  upperleft: string | null;
  lowerleft: string | null;
  upperMiddle: string | null;
  lowerMiddle: string | null;
  upperRight: string | null;
}

export type { PdfConfig, PdfData, PdfFooter, PdfFormData };
