const contentSources = ['published', 'latest'] as const;

type ContentSource = (typeof contentSources)[number];

const isContentSource = (value: unknown): value is ContentSource =>
  contentSources.some((contentSource) => contentSource === value);

export { isContentSource };
export type { ContentSource };
