type CommonCodeName = 'TemaIFyllUt' | 'ValutaBetaling' | 'EnhetstyperNorg' | 'Retningsnumre';

interface CodeDescription {
  term?: string;
}

interface BetydningEntry {
  // Upstream field name from kodeverk.
  beskrivelser?: Record<string, CodeDescription | undefined>;
}

interface CodeDescriptionsResponse {
  // Upstream field name from kodeverk.
  betydninger: Record<string, BetydningEntry[]>;
}

export type { BetydningEntry, CodeDescriptionsResponse, CommonCodeName };
