// Upstream field names from Tilleggsstonader API.
type UpstreamActivity = { id: string; tekst: string; type: string }[];

type RegisterDataQuery = Record<string, string | string[] | undefined>;

export type { RegisterDataQuery, UpstreamActivity };
